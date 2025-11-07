import Queue from 'bull';
export declare const videoQueue: Queue.Queue<any>;
export declare function addVideoToProcessingQueue(data: {
    videoId: string;
    s3Key: string;
    priority?: number;
}): Promise<Queue.Job<any>>;
//# sourceMappingURL=video-queue.d.ts.map