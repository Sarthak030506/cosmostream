"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscription = createSubscription;
exports.cancelSubscription = cancelSubscription;
exports.handleWebhook = handleWebhook;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});
const PRICE_IDS = {
    PREMIUM: process.env.STRIPE_PRICE_PREMIUM || 'price_premium',
    INSTITUTIONAL: process.env.STRIPE_PRICE_INSTITUTIONAL || 'price_institutional',
};
async function createSubscription(email, tier) {
    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
    }
    else {
        customer = await stripe.customers.create({ email });
    }
    // Get price ID based on tier
    const priceId = tier === 'PREMIUM' ? PRICE_IDS.PREMIUM : PRICE_IDS.INSTITUTIONAL;
    // Create subscription
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        trial_period_days: 14,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
}
async function cancelSubscription(subscriptionId) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
}
async function handleWebhook(event) {
    switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            // Handle subscription changes
            break;
        case 'invoice.payment_succeeded':
            // Handle successful payment
            break;
        case 'invoice.payment_failed':
            // Handle failed payment
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
}
//# sourceMappingURL=stripe.js.map