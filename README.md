# ShopMyUniform — MERN E-Commerce with an AI Customer Support Agent

A full-stack school-uniform shopping site (MongoDB, Express, React, Node) with an AI
customer support agent that is **grounded in the application's real data** via OpenAI
function/tool calling — not a hardcoded chatbot.

---

## 1. Project Overview

ShopMyUniform lets parents/students:

- Register/login, maintain a profile (children's names, grades, school, addresses)
- Pick their school and browse a uniform catalog (search, filter by grade/category/school)
- View product details (price, sizes, live stock per size)
- Add items to a cart, check out, and place an order
- Track "My Orders" and view order details/status timeline, cancel an order

A floating **AI Support Agent** widget (bottom-right on every page) answers:

- Product/availability questions ("Do you have white shirts for Grade 7?")
- Size questions ("Which sizes are available for this shirt?")
- Delivery questions ("How long will delivery take?")
- Order status questions ("Where is my order?") — using the logged-in user's real orders
- Returns/exchange questions ("How do I exchange my shirt?")

The agent **retrieves real data from MongoDB via the same backend models/APIs** before
answering — see [Section 8, AI Architecture](#8-ai-architecture--integration-approach) for exactly how.

---

## 2. Technology Stack

| Layer    | Technology                                                                                   |
| -------- | -------------------------------------------------------------------------------------------- |
| Frontend | React 19 (Vite), React Router, Axios, plain CSS (no UI framework, hand-built design system)  |
| Backend  | Node.js, Express.js                                                                          |
| Database | MongoDB (Mongoose ODM)                                                                       |
| Auth     | JWT (JSON Web Tokens), bcrypt password hashing                                               |
| AI       | OpenAI Chat Completions API with**function/tool calling** (`gpt-4o-mini` by default) |

---

## 3. Repository Structure

```
shopmyuniform/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, School, Product, Cart, Order, Policy
│   ├── middleware/auth.js        # JWT protect + optionalAuth
│   ├── controllers/              # auth, school, product, cart, order, ai
│   ├── routes/                   # REST route definitions
│   ├── services/aiService.js     # The AI agent: tools + OpenAI tool-calling loop
│   ├── seed/seed.js              # Seeds schools, products, policies, demo user
│   ├── server.js                 # Express app entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Axios instance (attaches JWT)
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── components/           # Navbar, ProductCard, ChatWidget, ProtectedRoute
│   │   ├── pages/                # Home, Login, Register, Profile, Schools,
│   │   │                         # Products, ProductDetail, Cart, Checkout,
│   │   │                         # MyOrders, OrderDetail
│   │   ├── App.jsx                # Routes
│   │   └── index.css              # Design system / styles
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

---

## 4. Setup Instructions (Local)

### Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (recommended), or
  - A local MongoDB instance (`mongodb://localhost:27017/shopmyuniform`)
- An OpenAI API key from https://platform.openai.com/api-keys (or any OpenAI-compatible provider — see note below)

### 4.1 Clone and install

```bash
git clone <your-repo-url> shopmyuniform
cd shopmyuniform

# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd ../frontend
npm install
```

### 4.2 Configure environment variables

Copy the example env files and fill in real values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/shopmyuniform
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
CLIENT_URL=http://localhost:5173
```

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### 4.3 Seed the database

This creates sample schools, products (with real per-size stock), store policies
(delivery/returns), and a demo login (`demo@shopmyuniform.com` / `demo1234`):

```bash
cd backend
npm run seed
```

### 4.4 Run the app

```bash
# Terminal 1 — backend
cd backend
npm run dev        # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev        # http://localhost:5173
```

Open http://localhost:5173, log in with the demo account (pre-filled on the login
page), browse products, place an order, then open the chat widget bottom-right and
ask it things like:

- "Do you have white shirts?"
- "What sizes are available for the St. Xavier's white shirt?"
- "How long will delivery take?"
- "Where is my order?"
- "How do I exchange a shirt?"

---

## 5. Required Environment Variables

### Backend (`backend/.env`)

| Variable           | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `PORT`           | Port the API listens on (default 5000)               |
| `MONGO_URI`      | MongoDB connection string                            |
| `JWT_SECRET`     | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | JWT lifetime, e.g.`7d`                             |
| `OPENAI_API_KEY` | OpenAI API key used by the AI agent                  |
| `OPENAI_MODEL`   | Model name, defaults to`gpt-4o-mini`               |
| `CLIENT_URL`     | Frontend origin, for CORS                            |

### Frontend (`frontend/.env`)

| Variable         | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the backend API, e.g.`http://localhost:5000/api` |

---

## 6. Database Structure

**User**

```
name, email (unique), password (hashed), role [parent|student|admin],
phone, school (ref School), children: [{ name, grade, school }],
addresses: [{ label, line1, line2, city, state, pincode, country, phone }]
```

**School**

```
name (unique), city, grades: [String], logoUrl
```

**Product**

```
name, description, category [shirt|pant|skirt|tie|sweater|shoes|sports-kit|accessory],
school (ref School), gradeLevels: [String], gender [boy|girl|unisex], color, price,
images: [String], sizes: [{ size, stock }], isActive
```

(text index on name/description/color for search)

**Cart**

```
user (ref User, unique), items: [{ product (ref Product), size, quantity }]
```

**Order**

```
orderNumber (unique), user (ref User),
items: [{ product, name, size, quantity, price }] (price/name snapshotted at order time),
shippingAddress, paymentMethod [COD|CARD|UPI],
itemsTotal, shippingFee, totalAmount,
status [Placed|Processing|Shipped|Out for Delivery|Delivered|Cancelled|Return Requested|Returned],
statusHistory: [{ status, note, at }], estimatedDeliveryDate
```

**Policy** (used by the AI agent — see below)

```
key (unique) [delivery|returns|sizing-guide|payment], title, content
```

---

## 7. API Endpoints
*(Note: In the tables below, a **✅ in the Auth column** means the user must be logged in to use the API. A **—** means the API is public and can be accessed by anyone without logging in.)*
### Auth

| Method | Path                   | Auth | Description                                       |
| ------ | ---------------------- | ---- | ------------------------------------------------- |
| POST   | `/api/auth/register` | —   | Create account, returns JWT                       |
| POST   | `/api/auth/login`    | —   | Login, returns JWT                                |
| GET    | `/api/auth/me`       | ✅   | Get current profile                               |
| PUT    | `/api/auth/me`       | ✅   | Update profile (name, phone, children, addresses) |

### Schools

| Method | Path                 | Auth | Description                     |
| ------ | -------------------- | ---- | ------------------------------- |
| GET    | `/api/schools`     | —   | List all schools                |
| GET    | `/api/schools/:id` | —   | Get one school                  |
| POST   | `/api/schools`     | —   | Create a school (admin utility) |

### Products

| Method | Path                                                                    | Auth | Description                    |
| ------ | ----------------------------------------------------------------------- | ---- | ------------------------------ |
| GET    | `/api/products?school=&category=&grade=&gender=&search=&page=&limit=` | —   | List/search/filter products    |
| GET    | `/api/products/:id`                                                   | —   | Product detail                 |
| POST   | `/api/products`                                                       | —   | Create product (admin utility) |
| PUT    | `/api/products/:id`                                                   | —   | Update product (admin utility) |

### Cart

| Method | Path                | Auth | Description                               |
| ------ | ------------------- | ---- | ----------------------------------------- |
| GET    | `/api/cart`       | ✅   | Get current user's cart                   |
| POST   | `/api/cart`       | ✅   | Add item`{ productId, size, quantity }` |
| PUT    | `/api/cart`       | ✅   | Update item quantity                      |
| DELETE | `/api/cart`       | ✅   | Remove one item`{ productId, size }`    |
| DELETE | `/api/cart/clear` | ✅   | Empty cart                                |

### Orders

| Method | Path                       | Auth | Description                                                            |
| ------ | -------------------------- | ---- | ---------------------------------------------------------------------- |
| POST   | `/api/orders`            | ✅   | Checkout: create order from cart`{ shippingAddress, paymentMethod }` |
| GET    | `/api/orders`            | ✅   | List current user's orders                                             |
| GET    | `/api/orders/:id`        | ✅   | Order detail                                                           |
| PUT    | `/api/orders/:id/cancel` | ✅   | Cancel an order                                                        |

### AI

| Method | Path             | Auth     | Description                                                                                                    |
| ------ | ---------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/ai/chat` | optional | `{ message, history }` → `{ reply, toolCalls }`. Works for guests; order-related questions require login. |

---

## 8. AI Architecture & Integration Approach

### The problem with "just ask an LLM"

A plain LLM call would hallucinate product stock, prices, and order statuses. The
assignment explicitly requires the AI to be **connected to the application's actual data**.

### The approach: OpenAI tool/function calling as a retrieval layer

```
User question
     │
     ▼
POST /api/ai/chat  (backend/controllers/aiController.js)
     │
     ▼
aiService.runAgent()  — sends the conversation + a list of "tools" to OpenAI
     │
     ▼
OpenAI decides it needs data, returns tool_calls (e.g. search_products, get_order_status)
     │
     ▼
Backend executes the matching Mongoose query against MongoDB (real data)
     │
     ▼
Tool results are sent back to OpenAI as `role: "tool"` messages
     │
     ▼
OpenAI generates the final answer using ONLY the retrieved real data
     │
     ▼
Response returned to the ChatWidget, along with a trace of which tools ran
```

This lives entirely in `backend/services/aiService.js`. The six tools exposed to the
model are:

| Tool                  | What it queries                                                                   | Used for                                                      |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `search_products`   | `Product` collection (filtered by school/grade/category/color/gender/free text) | "Do you have white shirts for Grade 7?"                       |
| `get_product_sizes` | `Product.sizes` for one product                                                 | "What sizes are available for this shirt?"                    |
| `get_my_orders`     | `Order` collection, scoped to `req.user._id`                                  | "What have I ordered recently?"                               |
| `get_order_status`  | One`Order` by order number/id, scoped to the user                               | "Where is my order?"                                          |
| `get_policy`        | `Policy` collection (delivery/returns/sizing/payment)                           | "How long will delivery take?" / "How do I exchange a shirt?" |
| `list_schools`      | `School` collection                                                             | "Which schools do you support?"                               |

Key design points:

- **Every tool call is scoped to the authenticated user** (`req.user`, passed in via
  the `optionalAuth` middleware) — a user can only ever retrieve their *own* orders.
  If the visitor isn't logged in, the order tools return `authenticated: false` and
  the model is instructed to ask them to log in rather than invent an answer.
- **The system prompt forbids inventing data** ("never guess prices/stock/order
  status — always call a tool first").
- **Delivery/returns answers come from the `Policy` collection in MongoDB**, not
  from text baked into the prompt — so updating store policy is a database change,
  not a code change.
- The agent loop (`runAgent`) supports **multiple rounds of tool calls** (up to 4)
  so the model can, e.g., first search for a product, then look up its sizes.
- The API response includes `toolCalls`, a trace of which tools ran — the frontend
  chat widget exposes a "Show data sources used" toggle so it's visible (including
  to an evaluator) that answers are grounded in real retrieved data, not memorized text.

### Swapping the LLM provider (e.g. to use Google Gemini's free tier instead of paid OpenAI)

`aiService.js` uses the official `openai` npm SDK, and the base URL is driven entirely
by an environment variable — **no code changes needed** to switch providers:

- **OpenAI** (paid, requires a card): set `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-4o-mini`,
  leave `OPENAI_BASE_URL` unset.
- **Google Gemini** (free tier, no card required — get a key at
  [aistudio.google.com](https://aistudio.google.com)): set
  ```
  OPENAI_API_KEY=<your Gemini API key>
  OPENAI_MODEL=gemini-2.5-flash
  OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
  ```

  Google exposes an OpenAI-compatible endpoint for Gemini that supports the same
  `tools`/function-calling format used here, so the agent's retrieval logic works
  unchanged. This is the recommended option for a free/no-cost submission.
- Any other OpenAI-compatible provider (Azure OpenAI, OpenRouter, etc.) works the
  same way — just set its `OPENAI_BASE_URL`, key, and model name.

---

## 9. Deployment

This repo is split into two deployable services:

### Backend → Render (or Railway/Fly.io)

1. Push this repo to GitHub.
2. On Render: **New → Web Service**, connect the repo, set **Root Directory** to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add the environment variables from Section 5 (use your Atlas `MONGO_URI`,
   a real `JWT_SECRET`, your `OPENAI_API_KEY`, and set `CLIENT_URL` to your deployed
   frontend URL once you have it).
5. After first deploy, run the seed script once (Render Shell tab): `npm run seed`.

### Frontend → Vercel (or Netlify)

1. **New Project**, import the same repo, set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output dir: `dist`.
3. Add env var `VITE_API_URL` = your deployed backend URL + `/api`
   (e.g. `https://shopmyuniform-api.onrender.com/api`).
4. Deploy, then go back to the backend's `CLIENT_URL` env var and set it to this
   Vercel URL, and redeploy the backend so CORS allows it.

### Database → MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) for simplicity,
   or your hosting provider's IPs.
3. Create a database user, copy the connection string into `MONGO_URI`.

---

## 10. What You (the Submitter) Still Need To Do

I've written and verified (syntax-checked, module-load-tested, and production-built)
the complete codebase, but the following steps require your own accounts/credentials
and can't be done on your behalf:

1. **Create a GitHub repository** and push this code (`git init`, `git remote add origin ...`, `git push`).
2. **Create a free MongoDB Atlas cluster** and get a `MONGO_URI`.
3. **Get an OpenAI API key** (https://platform.openai.com/api-keys) — needed for the
   AI agent to actually respond (the app still runs fully without it; the AI endpoint
   will just return a friendly "not configured" message).
4. **Deploy** backend (Render/Railway) and frontend (Vercel/Netlify) as described above,
   and run `npm run seed` once against your live database.
5. Optionally, swap the demo data in `backend/seed/seed.js` for your own schools/products.

Once deployed, submit: the GitHub repo link, the live frontend URL, and this README.
