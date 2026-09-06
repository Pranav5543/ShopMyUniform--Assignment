const { runAgent } = require("../services/aiService");

// POST /api/ai/chat  { message, history? }
// Works for both guest and authenticated users (optionalAuth middleware).
// Authenticated users get order-related answers grounded in their own data.
exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "A message is required" });
    }
    const safeHistory = Array.isArray(history)
      ? history
          .filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
          .slice(-10)
      : [];

    const result = await runAgent({ message, history: safeHistory, user: req.user || null });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "AI assistant failed to respond", error: err.message });
  }
};
