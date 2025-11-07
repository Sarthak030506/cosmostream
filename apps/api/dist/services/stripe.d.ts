import Stripe from 'stripe';
export declare function createSubscription(email: string, tier: string): Promise<Stripe.Response<Stripe.Subscription>>;
export declare function cancelSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>>;
export declare function handleWebhook(event: Stripe.Event): Promise<void>;
//# sourceMappingURL=stripe.d.ts.map