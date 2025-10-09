export interface Course {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  videoIds: string[];
  quizId?: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedModules: string[];
  currentModuleId?: string;
  lastAccessedAt: Date;
}
