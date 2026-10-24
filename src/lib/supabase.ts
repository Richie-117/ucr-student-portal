import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Student,
  CourseModule,
  LearningStage,
  GalleryItem,
  DivisionEvent,
  AdminUser,
  Lecturer,
} from './types';

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('your-project-ref') &&
    !url.includes('placeholder') &&
    url.startsWith('https://')
  );
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.SUPABASE_URL!;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

// ============================================================================
// DATA MAPPERS (CamelCase TypeScript <-> SnakeCase PostgreSQL)
// ============================================================================

export function studentFromRow(row: any): Student {
  return {
    id: row.id,
    fullName: row.full_name,
    studentNumber: row.student_number,
    course: row.course,
    batch: row.batch,
    profileImageUrl: row.profile_image_url || undefined,
    isRepresentative: Boolean(row.is_representative),
    representativeRole: row.representative_role || undefined,
    gender: row.gender || undefined,
    phoneNumber: row.phone_number || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function studentToRow(s: Partial<Student>): Record<string, any> {
  const row: Record<string, any> = {};
  if (s.id !== undefined) row.id = s.id;
  if (s.fullName !== undefined) row.full_name = s.fullName;
  if (s.studentNumber !== undefined) row.student_number = s.studentNumber;
  if (s.course !== undefined) row.course = s.course;
  if (s.batch !== undefined) row.batch = s.batch;
  if (s.profileImageUrl !== undefined) row.profile_image_url = s.profileImageUrl;
  if (s.isRepresentative !== undefined) row.is_representative = s.isRepresentative;
  if (s.representativeRole !== undefined) row.representative_role = s.representativeRole;
  if (s.gender !== undefined) row.gender = s.gender;
  if (s.phoneNumber !== undefined) row.phone_number = s.phoneNumber;
  if (s.notes !== undefined) row.notes = s.notes;
  if (s.createdAt !== undefined) row.created_at = s.createdAt;
  if (s.updatedAt !== undefined) row.updated_at = s.updatedAt;
  return row;
}

export function moduleFromRow(row: any): CourseModule {
  return {
    id: row.id,
    title: row.title,
    code: row.code || undefined,
    description: row.description || '',
    courseCodes: row.course_codes || [],
    learningStageId: row.learning_stage_id || '',
    status: row.status,
    thumbnailUrl: row.thumbnail_url || undefined,
    resources: Array.isArray(row.resources) ? row.resources : [],
    sortOrder: row.sort_order ?? 0,
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function moduleToRow(m: Partial<CourseModule>): Record<string, any> {
  const row: Record<string, any> = {};
  if (m.id !== undefined) row.id = m.id;
  if (m.title !== undefined) row.title = m.title;
  if (m.code !== undefined) row.code = m.code;
  if (m.description !== undefined) row.description = m.description;
  if (m.courseCodes !== undefined) row.course_codes = m.courseCodes;
  if (m.learningStageId !== undefined) row.learning_stage_id = m.learningStageId;
  if (m.status !== undefined) row.status = m.status;
  if (m.thumbnailUrl !== undefined) row.thumbnail_url = m.thumbnailUrl;
  if (m.resources !== undefined) row.resources = m.resources;
  if (m.sortOrder !== undefined) row.sort_order = m.sortOrder;
  if (m.published !== undefined) row.published = m.published;
  if (m.createdAt !== undefined) row.created_at = m.createdAt;
  if (m.updatedAt !== undefined) row.updated_at = m.updatedAt;
  return row;
}

export function stageFromRow(row: any): LearningStage {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    sortOrder: row.sort_order ?? 0,
    published: Boolean(row.published),
  };
}

export function stageToRow(s: Partial<LearningStage>): Record<string, any> {
  const row: Record<string, any> = {};
  if (s.id !== undefined) row.id = s.id;
  if (s.title !== undefined) row.title = s.title;
  if (s.description !== undefined) row.description = s.description;
  if (s.sortOrder !== undefined) row.sort_order = s.sortOrder;
  if (s.published !== undefined) row.published = s.published;
  return row;
}

export function galleryFromRow(row: any): GalleryItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    title: row.title,
    eventDate: row.event_date || undefined,
    showOnHome: Boolean(row.show_on_home),
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

export function galleryToRow(g: Partial<GalleryItem>): Record<string, any> {
  const row: Record<string, any> = {};
  if (g.id !== undefined) row.id = g.id;
  if (g.imageUrl !== undefined) row.image_url = g.imageUrl;
  if (g.title !== undefined) row.title = g.title;
  if (g.eventDate !== undefined) row.event_date = g.eventDate;
  if (g.showOnHome !== undefined) row.show_on_home = g.showOnHome;
  if (g.sortOrder !== undefined) row.sort_order = g.sortOrder;
  if (g.createdAt !== undefined) row.created_at = g.createdAt;
  return row;
}

export function eventFromRow(row: any): DivisionEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    eventDate: row.event_date,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    location: row.location || undefined,
    coverImageUrl: row.cover_image_url || undefined,
    registrationUrl: row.registration_url || undefined,
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function eventToRow(e: Partial<DivisionEvent>): Record<string, any> {
  const row: Record<string, any> = {};
  if (e.id !== undefined) row.id = e.id;
  if (e.title !== undefined) row.title = e.title;
  if (e.description !== undefined) row.description = e.description;
  if (e.eventDate !== undefined) row.event_date = e.eventDate;
  if (e.startTime !== undefined) row.start_time = e.startTime;
  if (e.endTime !== undefined) row.end_time = e.endTime;
  if (e.location !== undefined) row.location = e.location;
  if (e.coverImageUrl !== undefined) row.cover_image_url = e.coverImageUrl;
  if (e.registrationUrl !== undefined) row.registration_url = e.registrationUrl;
  if (e.published !== undefined) row.published = e.published;
  if (e.createdAt !== undefined) row.created_at = e.createdAt;
  if (e.updatedAt !== undefined) row.updated_at = e.updatedAt;
  return row;
}

export function lecturerFromRow(row: any): Lecturer {
  return {
    id: row.id,
    name: row.name,
    designation: row.designation,
    roleType: row.role_type,
    specialization: row.specialization,
    profileImageUrl: row.profile_image_url,
    sortOrder: row.sort_order ?? 0,
  };
}

export function adminFromRow(row: any): AdminUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role,
  };
}
