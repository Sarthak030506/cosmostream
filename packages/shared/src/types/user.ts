export enum UserRole {
  VIEWER = 'viewer',
  CREATOR = 'creator',
  ADMIN = 'admin',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export interface CreatorProfile {
  userId: string;
  verified: boolean;
  approvalStatus: ApprovalStatus;
  credentials?: string;
  subscriberCount: number;
  totalViews: number;
}

export interface AuthPayload {
  token: string;
  refreshToken: string;
  user: User;
}
