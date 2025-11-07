import { Pool } from 'pg';
declare const pool: Pool;
export declare const db: {
    query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
    getClient: () => Promise<import("pg").PoolClient>;
    end: () => Promise<void>;
};
export { pool };
//# sourceMappingURL=index.d.ts.map