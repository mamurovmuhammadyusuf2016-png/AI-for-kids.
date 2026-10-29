// Subscription plans: monthly price in sum, monthly token limits, chat questions per day
// and how fast the AI answers. Input tokens are what the AI reads (questions, photos,
// chat history), output tokens are what it writes. The free week uses the Pro plan.
// ai.thinking: how long the model may think before answering (less thinking = faster;
// null = as long as the model wants);
// ai.waitMs: how long to wait for the main model before switching to the fast backup one.
const PLANS = {
  pro: { name: 'Pro', price: 70000, input: 2000000, output: 5000000, questions: 30, ai: { thinking: null, waitMs: 25000 } },
  gold: { name: 'Gold', price: 100000, input: 3000000, output: 6000000, questions: 40, ai: { thinking: { thinkingBudget: 256 }, waitMs: 12000 } },
  max: { name: 'MAX', price: 120000, input: 4000000, output: 7000000, questions: 50, ai: { thinking: { thinkingBudget: 0 }, waitMs: 8000 } },
};

const DEFAULT_PLAN = 'pro';
const planId = (v) => (Object.hasOwn(PLANS, v) ? v : DEFAULT_PLAN);

module.exports = { PLANS, DEFAULT_PLAN, planId };
