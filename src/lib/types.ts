export type CourseType = 'TPOPT' | 'TPRPT';

export interface Student {
  id: string;
  fullName: string;
  studentNumber: string;
  course: CourseType;
  batch: string;
  profileImageUrl?: string;
  isRepresentative: boolean;
  representativeRole?: string; // e.g., 'Male Representative', 'Female Representative'
  gender?: 'Male' | 'Female';
  phoneNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ModuleStatus = 'ongoing' | 'upcoming' | 'completed';

export interface ModuleResource {
  title: string;
  url: string;
}

export interface CourseModule {
  id: string;
  title: string;
  code?: string;
  description: string;
  courseCodes: CourseType[];
  learningStageId: string;
  status: ModuleStatus;
  thumbnailUrl?: string;
  resources?: ModuleResource[];
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningStage {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  published: boolean;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  eventDate?: string;
  showOnHome: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface DivisionEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  location?: string;
  coverImageUrl?: string;
  registrationUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'superadmin' | 'admin';
}

export interface Lecturer {
  id: string;
  name: string;
  designation: string;
  roleType: 'head' | 'senior_lecturer' | 'lecturer';
  specialization: string;
  profileImageUrl: string;
  sortOrder: number;
}

export interface DatabaseSchema {
  students: Student[];
  modules: CourseModule[];
  learningStages: LearningStage[];
  gallery: GalleryItem[];
  events: DivisionEvent[];
  admins: AdminUser[];
  lecturers: Lecturer[];
}

export interface DashboardStats {
  totalStudents: number;
  tpoptStudents: number;
  tprptStudents: number;
  ongoingModules: number;
  upcomingEvents: number;
  totalModules: number;
  totalEvents: number;
}
