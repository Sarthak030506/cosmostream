import { Context } from '../../context';
export declare const videoResolvers: {
    Query: {
        video(_: any, { id }: any, { db }: Context): Promise<any>;
        myVideos(_: any, { status, limit, offset }: any, { user, db }: Context): Promise<{
            items: any[];
            hasMore: boolean;
            totalCount: number;
        }>;
        videos(_: any, { limit, offset, category, tags }: any, { db }: Context): Promise<any[]>;
        searchVideos(_: any, { query, limit, offset }: any, { db }: Context): Promise<any[]>;
    };
    Mutation: {
        requestUploadUrl(_: any, { title, description, tags, category, difficulty }: any, { user, db }: Context): Promise<{
            uploadUrl: string;
            videoId: string;
        }>;
        requestThumbnailUploadUrl(_: any, { videoId }: any, { user, db }: Context): Promise<{
            uploadUrl: string;
            videoId: any;
        }>;
        completeVideoUpload(_: any, { videoId, fileSize }: any, { user, db }: Context): Promise<any>;
        updateVideo(_: any, { id, title, description, tags, category, difficulty, thumbnailUrl }: any, { user, db }: Context): Promise<any>;
        deleteVideo(_: any, { id }: any, { user, db }: Context): Promise<boolean>;
    };
    Video: {
        status(parent: any): any;
        createdAt(parent: any): any;
        updatedAt(parent: any): any;
        completedAt(parent: any): any;
        thumbnailUrl(parent: any): any;
        manifestUrl(parent: any): any;
        fileSize(parent: any): any;
        processingProgress(parent: any): any;
        errorMessage(parent: any): any;
        creator(parent: any, _: any, { db }: Context): Promise<{
            id: any;
            email: any;
            name: any;
            role: any;
            createdAt: any;
        }>;
    };
};
//# sourceMappingURL=video.d.ts.map