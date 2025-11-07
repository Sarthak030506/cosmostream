import { Context } from '../../context';
export declare const authResolvers: {
    Mutation: {
        signup(_: any, { email, password, name }: any, { db }: Context): Promise<{
            token: string;
            refreshToken: string;
            user: {
                id: any;
                email: any;
                name: any;
                role: any;
                createdAt: any;
            };
        }>;
        login(_: any, { email, password }: any, { db }: Context): Promise<{
            token: string;
            refreshToken: string;
            user: {
                id: any;
                email: any;
                name: any;
                role: any;
                createdAt: any;
            };
        }>;
        refreshToken(_: any, { refreshToken }: any, { db }: Context): Promise<{
            token: string;
            refreshToken: string;
            user: {
                id: any;
                email: any;
                name: any;
                role: any;
                createdAt: any;
            };
        }>;
        requestPasswordReset(_: any, { email }: {
            email: string;
        }, { db }: Context): Promise<{
            success: boolean;
            message: string;
        }>;
        resetPassword(_: any, { token, newPassword }: {
            token: string;
            newPassword: string;
        }, { db }: Context): Promise<{
            success: boolean;
            message: string;
        }>;
    };
};
//# sourceMappingURL=auth.d.ts.map