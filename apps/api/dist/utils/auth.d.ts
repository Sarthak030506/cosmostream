export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function generateToken(user: any): string;
export declare function generateRefreshToken(user: any): string;
export declare function verifyToken(token: string): any;
export declare function verifyRefreshToken(token: string): any;
//# sourceMappingURL=auth.d.ts.map