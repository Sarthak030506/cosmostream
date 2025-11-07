import { Context } from '../../context';
export declare const adminResolvers: {
    Query: {
        users(_: any, { search, limit, offset }: {
            search?: string;
            limit?: number;
            offset?: number;
        }, { user, db }: Context): Promise<{
            items: {
                id: any;
                email: any;
                name: any;
                role: any;
                createdAt: any;
            }[];
            hasMore: boolean;
            totalCount: number;
        }>;
    };
    Mutation: {
        updateUserRole(_: any, { userId, role }: {
            userId: string;
            role: string;
        }, { user, db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        deleteUser(_: any, { userId }: {
            userId: string;
        }, { user, db }: Context): Promise<boolean>;
    };
};
//# sourceMappingURL=admin.d.ts.map