export interface Thread {
  id: string;
  title: string;
  creatorId: string;
  category: string;
  tags: string[];
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  votes: number;
  isExpertAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostVote {
  postId: string;
  userId: string;
  value: number; // 1 or -1
}

export enum ForumCategory {
  GENERAL = 'general',
  ASTROPHYSICS = 'astrophysics',
  OBSERVING = 'observing',
  EQUIPMENT = 'equipment',
  EDUCATION = 'education',
  NEWS = 'news',
}
