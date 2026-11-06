// Subscription plans: monthly price in sum, monthly token limits, chat questions per day
// and how deeply the AI thinks. Input tokens are what the AI reads (questions, photos,
// chat history), output tokens are what it writes. The free week uses the Pro plan.
// ai.thinking: how much the model thinks before answering in the chat. Plans are named by it on
// the site: Pro "Умная" (low), Gold "Очень умная" (medium), MAX "Сверхумная" (high).
// Checked 31.10.2026 on gemini-flash-latest (= gemini-3.8-flash): only thinkingLevel changes it
// (low ≈ 0 thinking tokens, medium ≈ 600, high ≈ 850); thinkingBudget below 4096 means "no thinking".
// ai.waitMs: how long to wait for the main model before switching to the lighter backup one
// (deeper thinking needs more time before the first word).
const PLANS = {
  pro: { name: 'Pro', price: 70000, input: 2000000, output: 5000000, questions: 30, ai: { thinking: { thinkingLevel: 'low' }, waitMs: 15000 } },
  gold: { name: 'Gold', price: 100000, input: 3000000, output: 6000000, questions: 40, ai: { thinking: { thinkingLevel: 'medium' }, waitMs: 22000 } },
  max: { name: 'MAX', price: 120000, input: 4000000, output: 7000000, questions: 50, ai: { thinking: { thinkingLevel: 'high' }, waitMs: 30000 } },
};

const DEFAULT_PLAN = 'pro';
const planId = (v) => (Object.hasOwn(PLANS, v) ? v : DEFAULT_PLAN);

// Without a subscription only the chat is free: FREE_TRIES.chat questions (since 07.11.2026);
// counted for the whole account, not per day. Other paid sections open with a subscription or the free week.
const FREE_TRIES = { chat: 20 };

module.exports = { PLANS, DEFAULT_PLAN, planId, FREE_TRIES };
