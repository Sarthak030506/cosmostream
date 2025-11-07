import { Context } from '../../context';
export declare const subscriptionResolvers: {
    Mutation: {
        createSubscription(_: any, { tier }: any, { user, db }: Context): Promise<any>;
        cancelSubscription(_: any, __: any, { user, db }: Context): Promise<boolean>;
    };
};
//# sourceMappingURL=subscription.d.ts.map