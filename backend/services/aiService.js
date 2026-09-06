/**
 * AI Customer Support Agent
 * ---------------------------------------------------------------
 * This is NOT a hardcoded/rule-based chatbot. It uses OpenAI's function
 * (tool) calling: the LLM decides which retrieval function(s) it needs,
 * we execute those functions against MongoDB / the application's own
 * data layer, feed the real results back to the model, and only then
 * does the model produce its final natural-language answer.
 *
 * Flow:
 *   User message -> OpenAI (with tools) -> tool_calls decided by model
 *   -> we run the matching MongoDB queries -> results sent back to model
 *   -> OpenAI produces final grounded answer -> returned to user
 */

const OpenAI = require("openai");
const Product = require("../models/Product");
const Order = require("../models/Order");
const School = require("../models/School");
const Policy = require("../models/Policy");

const CANDIDATE_MODELS = [
  process.env.OPENAI_MODEL || "gemini-3.5-flash",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3-flash-preview",
];

async function createChatCompletionWithFallback(openai, params) {
  let lastErr = null;
  const modelsToTry = [
    params.model || process.env.OPENAI_MODEL || "gemini-3.5-flash",
    ...CANDIDATE_MODELS.filter((m) => m !== (params.model || process.env.OPENAI_MODEL || "gemini-3.5-flash")),
  ];

  for (const model of modelsToTry) {
    try {
      const response = await openai.chat.completions.create({
        ...params,
        model,
      });
      return response;
    } catch (err) {
      lastErr = err;
      const isRetryable = err.status === 429 || err.status === 404 || err.status === 503 || err.status === 500;
      if (!isRetryable) throw err;
      console.warn(`Model ${model} failed (${err.status || err.message}), trying fallback...`);
    }
  }
  throw lastErr;
}

// Optional: point the OpenAI SDK at a different OpenAI-compatible provider
// (e.g. Google Gemini's free-tier OpenAI-compatible endpoint) purely via env
// vars, with zero code changes required. Leave OPENAI_BASE_URL unset to use
// OpenAI itself.
//   OpenAI:  OPENAI_API_KEY=sk-...            (OPENAI_BASE_URL unset)
//   Gemini:  OPENAI_API_KEY=<gemini key>
//            OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
//            OPENAI_MODEL=gemini-2.5-flash
const BASE_URL = process.env.OPENAI_BASE_URL || undefined;

// Lazily instantiated so the server can still boot (and every other feature keep
// working) even if OPENAI_API_KEY hasn't been configured yet. runAgent() checks
// for the key up front and returns a friendly message instead of calling this.
let _openai = null;
function getOpenAIClient() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: BASE_URL });
  }
  return _openai;
}

// ---------------------------------------------------------------------------
// Tool (function) definitions exposed to the LLM
// ---------------------------------------------------------------------------
const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the uniform product catalog stored in MongoDB. Use this to answer questions about " +
        "what products are available, for which school/grade/gender/color/category, and their prices.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Free text search term, e.g. 'white shirt'" },
          schoolName: { type: "string", description: "Name of the school, e.g. 'Green Valley High School'" },
          grade: { type: "string", description: "Grade/class level, e.g. '7' or 'Grade 7'" },
          category: {
            type: "string",
            enum: ["shirt", "pant", "skirt", "tie", "sweater", "shoes", "sports-kit", "accessory"],
          },
          color: { type: "string", description: "Color of the product, e.g. 'white'" },
          gender: { type: "string", enum: ["boy", "girl", "unisex"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_sizes",
      description:
        "Given a specific product name (or partial name) or product id, return the exact sizes " +
        "currently available for it and how many units are in stock for each size.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string" },
          productName: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_my_orders",
      description:
        "Fetch the currently authenticated user's own recent orders (order number, status, items, dates). " +
        "Use this for general 'my orders' questions. Requires the user to be logged in.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_order_status",
      description:
        "Look up the live status and tracking details of one specific order belonging to the " +
        "authenticated user, by order number (e.g. 'SMU12345678') or order id. Use this for " +
        "'Where is my order?' style questions.",
      parameters: {
        type: "object",
        properties: {
          orderNumber: { type: "string" },
          orderId: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_policy",
      description:
        "Retrieve the official store policy text stored in the database for a given topic, " +
        "such as delivery timelines or the returns/exchange process.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", enum: ["delivery", "returns", "sizing-guide", "payment"] },
        },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_schools",
      description: "List the schools supported on the platform, optionally filtered by name search.",
      parameters: {
        type: "object",
        properties: { search: { type: "string" } },
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Tool implementations - these are the ONLY places the agent touches data,
// and they all go through the same Mongoose models used by the REST API.
// ---------------------------------------------------------------------------
async function execSearchProducts(args) {
  const filter = { isActive: true };
  if (args.category) filter.category = args.category;
  if (args.gender) filter.gender = args.gender;
  if (args.grade) {
    const normalizedGrade = String(args.grade).replace(/[^0-9a-zA-Z]/g, "");
    filter.gradeLevels = { $regex: normalizedGrade, $options: "i" };
  }
  if (args.color) filter.color = { $regex: args.color, $options: "i" };
  if (args.schoolName) {
    const school = await School.findOne({ name: { $regex: args.schoolName, $options: "i" } });
    if (school) filter.school = school._id;
  }
  if (args.query) {
    filter.$or = [
      { name: { $regex: args.query, $options: "i" } },
      { description: { $regex: args.query, $options: "i" } },
      { color: { $regex: args.query, $options: "i" } },
    ];
  }

  const products = await Product.find(filter).limit(10).populate("school", "name");
  return {
    count: products.length,
    products: products.map((p) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      color: p.color,
      gender: p.gender,
      price: p.price,
      school: p.school?.name,
      gradeLevels: p.gradeLevels,
      sizesAvailable: p.sizes.filter((s) => s.stock > 0).map((s) => ({ size: s.size, stock: s.stock })),
    })),
  };
}

async function execGetProductSizes(args) {
  let product = null;
  if (args.productId) product = await Product.findById(args.productId);
  if (!product && args.productName) {
    product = await Product.findOne({ name: { $regex: args.productName, $options: "i" } });
  }
  if (!product) return { found: false, message: "No matching product found in the catalog." };
  return {
    found: true,
    productName: product.name,
    price: product.price,
    sizes: product.sizes.map((s) => ({ size: s.size, inStock: s.stock > 0, stock: s.stock })),
  };
}

async function execGetMyOrders(args, ctx) {
  if (!ctx.user) {
    return { authenticated: false, message: "The user is not logged in, so their orders cannot be looked up." };
  }
  const orders = await Order.find({ user: ctx.user._id }).sort({ createdAt: -1 }).limit(10);
  return {
    authenticated: true,
    count: orders.length,
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: o.totalAmount,
      placedOn: o.createdAt,
      estimatedDeliveryDate: o.estimatedDeliveryDate,
      items: o.items.map((i) => `${i.name} (size ${i.size}) x${i.quantity}`),
    })),
  };
}

async function execGetOrderStatus(args, ctx) {
  if (!ctx.user) {
    return { authenticated: false, message: "The user is not logged in, so this order cannot be looked up." };
  }
  let order = null;
  if (args.orderNumber) order = await Order.findOne({ orderNumber: args.orderNumber, user: ctx.user._id });
  if (!order && args.orderId) order = await Order.findOne({ _id: args.orderId, user: ctx.user._id });
  if (!order) {
    return { found: false, message: "No matching order was found for this user." };
  }
  return {
    found: true,
    orderNumber: order.orderNumber,
    status: order.status,
    statusHistory: order.statusHistory.map((h) => ({ status: h.status, at: h.at, note: h.note })),
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    items: order.items.map((i) => `${i.name} (size ${i.size}) x${i.quantity}`),
    totalAmount: order.totalAmount,
    shippingAddress: order.shippingAddress,
  };
}

async function execGetPolicy(args) {
  const policy = await Policy.findOne({ key: args.topic });
  if (!policy) return { found: false };
  return { found: true, title: policy.title, content: policy.content };
}

async function execListSchools(args) {
  const filter = {};
  if (args.search) filter.name = { $regex: args.search, $options: "i" };
  const schools = await School.find(filter).limit(20);
  return { schools: schools.map((s) => ({ id: s._id, name: s.name, city: s.city, grades: s.grades })) };
}

const TOOL_IMPLEMENTATIONS = {
  search_products: execSearchProducts,
  get_product_sizes: execGetProductSizes,
  get_my_orders: execGetMyOrders,
  get_order_status: execGetOrderStatus,
  get_policy: execGetPolicy,
  list_schools: execListSchools,
};

const SYSTEM_PROMPT = `You are the ShopMyUniform Customer Support Agent, embedded in a school-uniform
e-commerce website. You help parents and students with questions about products, sizes, delivery,
orders, and returns/exchanges.

Rules you must follow strictly:
1. Never invent product details, prices, stock, order statuses, or policy text. Always call the
   appropriate tool to retrieve real data from the application's database before answering any
   question about products, sizes, orders, or policies.
2. If a tool reports that the user is not authenticated, tell the user they need to log in to see
   their orders, and offer to help with product/size/delivery/returns questions instead.
3. If a search returns no results, say so honestly and suggest a broader search rather than guessing.
4. Keep answers concise, friendly, and specific (mention exact sizes, prices, order numbers, and
   statuses returned by the tools).
5. If the user asks something unrelated to the store (products, sizing, delivery, orders, returns,
   schools), politely redirect them back to what you can help with.
6. Presentation: Keep formatting clean, natural, and easy to read. Avoid starting messages with excessive headings (like ###) or redundant asterisks. Put order numbers in inline code tags (e.g. \`SMU12345678\`). Use clean, simple bullet points for lists.`;

/**
 * Runs one turn of the agent loop: sends the conversation + tool definitions to the model,
 * executes any tool calls the model asks for against MongoDB, feeds results back, and returns
 * the final assistant message plus a trace of which tools were used (useful for the UI/debugging).
 */
async function runAgent({ message, history = [], user = null }) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      reply:
        "The AI assistant is not fully configured yet (missing OPENAI_API_KEY on the server). " +
        "Please contact support directly, or ask the site admin to set the environment variable.",
      toolCalls: [],
    };
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(user
      ? [{ role: "system", content: `Authenticated user context: name="${user.name}", email="${user.email}", userId="${user._id}".` }]
      : [{ role: "system", content: "The current visitor is NOT logged in." }]),
    ...history,
    { role: "user", content: message },
  ];

  const toolCallTrace = [];
  const ctx = { user };

  const openai = getOpenAIClient();

  // Allow up to a few rounds of tool calls before forcing a final answer.
  for (let round = 0; round < 4; round++) {
    const response = await createChatCompletionWithFallback(openai, {
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.3,
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;
    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls || [];
    if (toolCalls.length === 0) {
      return { reply: assistantMessage.content, toolCalls: toolCallTrace };
    }

    for (const call of toolCalls) {
      const fnName = call.function.name;
      let args = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch (e) {
        args = {};
      }
      const impl = TOOL_IMPLEMENTATIONS[fnName];
      let result;
      try {
        result = impl ? await impl(args, ctx) : { error: `Unknown tool ${fnName}` };
      } catch (err) {
        result = { error: `Tool execution failed: ${err.message}` };
      }
      toolCallTrace.push({ tool: fnName, args, result });
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    reply: "I looked into that but couldn't finalize an answer. Could you rephrase your question?",
    toolCalls: toolCallTrace,
  };
}

module.exports = { runAgent };
