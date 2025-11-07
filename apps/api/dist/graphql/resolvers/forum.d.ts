import { Context } from '../../context';
export declare const forumResolvers: {
    Query: {
        thread(_: any, { id }: any, { db }: Context): Promise<any>;
        threads(_: any, { category, limit, offset }: any, { db }: Context): Promise<any[]>;
    };
    Mutation: {
        createThread(_: any, { title, category, tags, content }: any, { user, db }: Context): Promise<any>;
        createPost(_: any, { threadId, content }: any, { user, db }: Context): Promise<any>;
        votePost(_: any, { postId, value }: any, { user, db }: Context): Promise<any>;
    };
    Thread: {
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        creator(parent: any, _: any, { db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
        posts(parent: any, _: any, { db }: Context): Promise<any[]>;
    };
    Post: {
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        isExpertAnswer(parent: any): any;
        thread(parent: any, _: any, { db }: Context): Promise<any>;
        author(parent: any, _: any, { db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
    };
};
//# sourceMappingURL=forum.d.ts.map