"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionResolvers = void 0;
const graphql_1 = require("graphql");
const stripe_1 = require("../../services/stripe");
exports.subscriptionResolvers = {
    Mutation: {
        async createSubscription(_, { tier }, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            // Check for existing subscription
            const existing = await db.query(`SELECT id FROM user_subscriptions
         WHERE user_id = $1 AND status IN ('active', 'trialing')`, [user.id]);
            if (existing.rows.length > 0) {
                throw new graphql_1.GraphQLError('User already has an active subscription', {
                    extensions: { code: 'SUBSCRIPTION_EXISTS' },
                });
            }
            // Create Stripe subscription
            const stripeSubscription = await (0, stripe_1.createSubscription)(user.email, tier);
            // Store in database
            const result = await db.query(`INSERT INTO user_subscriptions
         (user_id, tier, status, stripe_subscription_id, current_period_end)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, tier, status, current_period_end, created_at`, [
                user.id,
                tier.toLowerCase(),
                stripeSubscription.status,
                stripeSubscription.id,
                new Date(stripeSubscription.current_period_end * 1000),
            ]);
            return {
                ...result.rows[0],
                tier: tier,
                status: stripeSubscription.status.toUpperCase(),
            };
        },
        async cancelSubscription(_, __, { user, db }) {
            if (!user) {
                throw new graphql_1.GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }
            const subscription = await db.query(`SELECT stripe_subscription_id FROM user_subscriptions
         WHERE user_id = $1 AND status = 'active'`, [user.id]);
            if (subscription.rows.length === 0) {
                throw new graphql_1.GraphQLError('No active subscription found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            // Cancel in Stripe
            await (0, stripe_1.cancelSubscription)(subscription.rows[0].stripe_subscription_id);
            // Update database
            await db.query(`UPDATE user_subscriptions
         SET status = 'canceled'
         WHERE user_id = $1 AND stripe_subscription_id = $2`, [user.id, subscription.rows[0].stripe_subscription_id]);
            return true;
        },
    },
};
//# sourceMappingURL=subscription.js.map