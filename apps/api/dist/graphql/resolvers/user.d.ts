import { Context } from '../../context';
export declare const userResolvers: {
    Query: {
        me(_: any, __: any, { user, db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        user(_: any, { id }: any, { db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
    };
    Mutation: {
        updateProfile(_: any, { name, bio, avatar }: any, { user, db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        applyForCreator(_: any, { credentials }: any, { user, db }: Context): Promise<{
            verified: boolean;
            approvalStatus: string;
            credentials: any;
            subscriberCount: number;
            totalViews: number;
        }>;
    };
    User: {
        profile(parent: any, _: any, { db }: Context): Promise<any>;
        creatorProfile(parent: any, _: any, { db }: Context): Promise<{
            verified: any;
            approvalStatus: any;
            credentials: any;
            subscriberCount: number;
            totalViews: number;
        }>;
    };
};
//# sourceMappingURL=user.d.ts.map