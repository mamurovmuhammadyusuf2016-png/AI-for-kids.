// Subscription plans: monthly price in sum and monthly token limits.
// Input tokens are what the AI reads (questions, photos, chat history),
// output tokens are what it writes. The free week uses the Pro limits.
const PLANS = {
  pro: { name: 'Pro', price: 70000, input: 2000000, output: 5000000 },
  gold: { name: 'Gold', price: 100000, input: 3000000, output: 6000000 },
  max: { name: 'MAX', price: 120000, input: 4000000, output: 7000000 },
};

const DEFAULT_PLAN = 'pro';
const planId = (v) => (Object.hasOwn(PLANS, v) ? v : DEFAULT_PLAN);

module.exports = { PLANS, DEFAULT_PLAN, planId };
