import { Context } from '../../context';
export declare const courseResolvers: {
    Query: {
        course(_: any, { id }: any, { db }: Context): Promise<any>;
        courses(_: any, { limit, offset }: any, { db }: Context): Promise<any[]>;
    };
    Mutation: {
        createCourse(_: any, { title, description }: any, { user, db }: Context): Promise<any>;
        addModuleToCourse(_: any, { courseId, title, videoIds }: any, { user, db }: Context): Promise<any>;
        enrollInCourse(_: any, { courseId }: any, { user, db }: Context): Promise<boolean>;
    };
};
//# sourceMappingURL=course.d.ts.map