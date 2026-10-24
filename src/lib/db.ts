import fs from 'fs';
import path from 'path';
import {
  DatabaseSchema,
  Student,
  CourseModule,
  LearningStage,
  GalleryItem,
  DivisionEvent,
  AdminUser,
  DashboardStats,
  Lecturer,
} from './types';
import { getInitialDatabase } from './seed-data';
import {
  isSupabaseConfigured,
  getSupabaseAdmin,
  studentFromRow,
  studentToRow,
  moduleFromRow,
  moduleToRow,
  stageFromRow,
  stageToRow,
  galleryFromRow,
  galleryToRow,
  eventFromRow,
  eventToRow,
  lecturerFromRow,
  adminFromRow,
} from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Memory cache for file-based fallback
let cache: DatabaseSchema | null = null;
let writeQueue = Promise.resolve();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function getDatabase(): Promise<DatabaseSchema> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const [
        studentsRes,
        modulesRes,
        stagesRes,
        galleryRes,
        eventsRes,
        adminsRes,
        lecturersRes,
      ] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('modules').select('*').order('sort_order', { ascending: true }),
        supabase.from('learning_stages').select('*').order('sort_order', { ascending: true }),
        supabase.from('gallery').select('*').order('sort_order', { ascending: true }),
        supabase.from('events').select('*'),
        supabase.from('admins').select('*'),
        supabase.from('lecturers').select('*').order('sort_order', { ascending: true }),
      ]);

      if (
        !studentsRes.error &&
        !modulesRes.error &&
        !stagesRes.error &&
        !galleryRes.error &&
        !eventsRes.error
      ) {
        return {
          students: (studentsRes.data || []).map(studentFromRow),
          modules: (modulesRes.data || []).map(moduleFromRow),
          learningStages: (stagesRes.data || []).map(stageFromRow),
          gallery: (galleryRes.data || []).map(galleryFromRow),
          events: (eventsRes.data || []).map(eventFromRow),
          admins: (adminsRes.data || []).map(adminFromRow),
          lecturers: (lecturersRes.data || []).map(lecturerFromRow),
        };
      }
      console.warn('Supabase fetch encountered errors, falling back to local JSON cache');
    } catch (err) {
      console.warn('Failed to query Supabase database, using local backup cache:', err);
    }
  }

  // Local JSON File Fallback
  if (cache) {
    return cache;
  }

  ensureDataDir();

  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialDatabase();
    await saveDatabase(initial);
    cache = initial;
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    cache = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading database file, reinitializing with defaults:', error);
    const initial = getInitialDatabase();
    await saveDatabase(initial);
    cache = initial;
    return initial;
  }
}

export async function saveDatabase(data: DatabaseSchema): Promise<void> {
  ensureDataDir();
  cache = data;

  writeQueue = writeQueue
    .then(async () => {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      await fs.promises.rename(tempFile, DB_FILE);
    })
    .catch((err) => {
      console.error('Failed to write database file:', err);
    });

  return writeQueue;
}

export async function resetDatabase(): Promise<DatabaseSchema> {
  const fresh = getInitialDatabase();
  await saveDatabase(fresh);
  return fresh;
}

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const tpoptStudents = db.students.filter((s) => s.course === 'TPOPT').length;
  const tprptStudents = db.students.filter((s) => s.course === 'TPRPT').length;
  const ongoingModules = db.modules.filter((m) => m.published && m.status === 'ongoing').length;
  const upcomingEvents = db.events.filter((e) => e.published && e.eventDate >= today).length;

  return {
    totalStudents: db.students.length,
    tpoptStudents,
    tprptStudents,
    ongoingModules,
    upcomingEvents,
    totalModules: db.modules.length,
    totalEvents: db.events.length,
  };
}

// ==================== STUDENTS ====================

export async function getStudents(options?: {
  course?: 'TPOPT' | 'TPRPT';
  isRepresentative?: boolean;
  search?: string;
}): Promise<Student[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let query = supabase.from('students').select('*');

      if (options?.course) {
        query = query.eq('course', options.course);
      }
      if (options?.isRepresentative !== undefined) {
        query = query.eq('is_representative', options.isRepresentative);
      }
      if (options?.search) {
        const q = options.search.trim();
        query = query.or(`full_name.ilike.%${q}%,student_number.ilike.%${q}%,batch.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        const result = data.map(studentFromRow);
        result.sort((a, b) => {
          if (a.isRepresentative && !b.isRepresentative) return -1;
          if (!a.isRepresentative && b.isRepresentative) return 1;
          return a.studentNumber.localeCompare(b.studentNumber);
        });
        return result;
      }
    } catch (e) {
      console.warn('Supabase getStudents error, falling back to local file:', e);
    }
  }

  // Local fallback
  const db = await getDatabase();
  let result = [...db.students];

  if (options?.course) {
    result = result.filter((s) => s.course === options.course);
  }
  if (options?.isRepresentative !== undefined) {
    result = result.filter((s) => s.isRepresentative === options.isRepresentative);
  }
  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    result = result.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q) ||
        (s.batch && s.batch.toLowerCase().includes(q))
    );
  }

  result.sort((a, b) => {
    if (a.isRepresentative && !b.isRepresentative) return -1;
    if (!a.isRepresentative && b.isRepresentative) return 1;
    return a.studentNumber.localeCompare(b.studentNumber);
  });

  return result;
}

export async function getStudentById(id: string): Promise<Student | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('students').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return studentFromRow(data);
      }
    } catch (e) {
      console.warn('Supabase getStudentById error, falling back:', e);
    }
  }

  const db = await getDatabase();
  return db.students.find((s) => s.id === id) || null;
}

export async function createStudent(data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const newId = `student-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (supabase) {
    try {
      // Validate unique studentNumber
      if (data.studentNumber && data.studentNumber.trim()) {
        const { data: existing } = await supabase
          .from('students')
          .select('id')
          .ilike('student_number', data.studentNumber.trim())
          .maybeSingle();
        if (existing) {
          throw new Error(`Student ID ${data.studentNumber} is already registered.`);
        }
      }

      // If marked as representative, check limit
      if (data.isRepresentative) {
        const { data: reps } = await supabase
          .from('students')
          .select('id')
          .eq('course', data.course)
          .eq('is_representative', true);
        if (reps && reps.length >= 2) {
          throw new Error(
            `Course ${data.course} already has 2 batch representatives assigned. Please unassign an existing representative first.`
          );
        }
      }

      const row = studentToRow({
        ...data,
        id: newId,
        createdAt: now,
        updatedAt: now,
      });

      const { data: inserted, error } = await supabase.from('students').insert(row).select().single();
      if (error) throw error;
      return studentFromRow(inserted);
    } catch (e) {
      console.error('Supabase createStudent error:', e);
      throw e;
    }
  }

  // Local JSON fallback
  const db = await getDatabase();
  if (data.studentNumber && data.studentNumber.trim()) {
    const existing = db.students.find(
      (s) => s.studentNumber.trim().toLowerCase() === data.studentNumber.trim().toLowerCase()
    );
    if (existing) {
      throw new Error(`Student ID ${data.studentNumber} is already registered.`);
    }
  }

  if (data.isRepresentative) {
    const currentCourseReps = db.students.filter(
      (s) => s.course === data.course && s.isRepresentative
    );
    if (currentCourseReps.length >= 2) {
      throw new Error(
        `Course ${data.course} already has 2 batch representatives assigned. Please unassign an existing representative first.`
      );
    }
  }

  const newStudent: Student = {
    ...data,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  db.students.push(newStudent);
  await saveDatabase(db);
  return newStudent;
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const existing = await getStudentById(id);
      if (!existing) throw new Error('Student not found');

      if (data.studentNumber && data.studentNumber.trim() !== existing.studentNumber.trim()) {
        const { data: dup } = await supabase
          .from('students')
          .select('id')
          .neq('id', id)
          .ilike('student_number', data.studentNumber.trim())
          .maybeSingle();
        if (dup) {
          throw new Error(`Student ID ${data.studentNumber} is already in use by another student.`);
        }
      }

      const targetCourse = data.course || existing.course;
      const targetIsRep = data.isRepresentative !== undefined ? data.isRepresentative : existing.isRepresentative;

      if (targetIsRep && (!existing.isRepresentative || targetCourse !== existing.course)) {
        const { data: otherCourseReps } = await supabase
          .from('students')
          .select('id')
          .neq('id', id)
          .eq('course', targetCourse)
          .eq('is_representative', true);
        if (otherCourseReps && otherCourseReps.length >= 2) {
          throw new Error(
            `Course ${targetCourse} already has 2 batch representatives assigned. Please unassign one first.`
          );
        }
      }

      const updatePayload: Partial<Student> = {
        ...data,
        updatedAt: now,
      };
      if (updatePayload.isRepresentative === false) {
        updatePayload.representativeRole = undefined;
      }

      const row = studentToRow(updatePayload);
      const { data: updated, error } = await supabase
        .from('students')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return studentFromRow(updated);
    } catch (e) {
      console.error('Supabase updateStudent error:', e);
      throw e;
    }
  }

  // Local JSON fallback
  const db = await getDatabase();
  const index = db.students.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error('Student not found');
  }

  const existing = db.students[index];
  if (data.studentNumber && data.studentNumber.trim() !== existing.studentNumber.trim()) {
    const dup = db.students.find(
      (s) => s.id !== id && s.studentNumber.trim().toLowerCase() === data.studentNumber!.trim().toLowerCase()
    );
    if (dup) {
      throw new Error(`Student ID ${data.studentNumber} is already in use by another student.`);
    }
  }

  const targetCourse = data.course || existing.course;
  const targetIsRep = data.isRepresentative !== undefined ? data.isRepresentative : existing.isRepresentative;

  if (targetIsRep && (!existing.isRepresentative || targetCourse !== existing.course)) {
    const otherCourseReps = db.students.filter(
      (s) => s.id !== id && s.course === targetCourse && s.isRepresentative
    );
    if (otherCourseReps.length >= 2) {
      throw new Error(
        `Course ${targetCourse} already has 2 batch representatives assigned. Please unassign one first.`
      );
    }
  }

  const updated: Student = {
    ...existing,
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now,
  };

  if (!updated.isRepresentative) {
    updated.representativeRole = undefined;
  }

  db.students[index] = updated;
  await saveDatabase(db);
  return updated;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Supabase deleteStudent error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const initialLen = db.students.length;
  db.students = db.students.filter((s) => s.id !== id);
  if (db.students.length === initialLen) return false;
  await saveDatabase(db);
  return true;
}

// ==================== MODULES ====================

export async function getModules(options?: {
  course?: 'TPOPT' | 'TPRPT';
  status?: string;
  stageId?: string;
  publishedOnly?: boolean;
}): Promise<CourseModule[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let query = supabase.from('modules').select('*').order('sort_order', { ascending: true });
      if (options?.publishedOnly) {
        query = query.eq('published', true);
      }
      if (options?.course) {
        query = query.contains('course_codes', [options.course]);
      }
      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }
      if (options?.stageId && options.stageId !== 'all') {
        query = query.eq('learning_stage_id', options.stageId);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map(moduleFromRow);
      }
    } catch (e) {
      console.warn('Supabase getModules error, falling back:', e);
    }
  }

  const db = await getDatabase();
  let result = [...db.modules];

  if (options?.publishedOnly) {
    result = result.filter((m) => m.published);
  }
  if (options?.course) {
    result = result.filter((m) => m.courseCodes.includes(options.course!));
  }
  if (options?.status && options.status !== 'all') {
    result = result.filter((m) => m.status === options.status);
  }
  if (options?.stageId && options.stageId !== 'all') {
    result = result.filter((m) => m.learningStageId === options.stageId);
  }

  result.sort((a, b) => a.sortOrder - b.sortOrder);
  return result;
}

export async function getModuleById(id: string): Promise<CourseModule | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('modules').select('*').eq('id', id).maybeSingle();
      if (!error && data) return moduleFromRow(data);
    } catch (e) {
      console.warn('Supabase getModuleById error:', e);
    }
  }

  const db = await getDatabase();
  return db.modules.find((m) => m.id === id) || null;
}

export async function createModule(data: Omit<CourseModule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseModule> {
  const now = new Date().toISOString();
  const newId = `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = moduleToRow({ ...data, id: newId, createdAt: now, updatedAt: now });
      const { data: inserted, error } = await supabase.from('modules').insert(row).select().single();
      if (error) throw error;
      return moduleFromRow(inserted);
    } catch (e) {
      console.error('Supabase createModule error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const newModule: CourseModule = {
    ...data,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };
  db.modules.push(newModule);
  await saveDatabase(db);
  return newModule;
}

export async function updateModule(id: string, data: Partial<CourseModule>): Promise<CourseModule> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = moduleToRow({ ...data, updatedAt: now });
      const { data: updated, error } = await supabase
        .from('modules')
        .update(row)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return moduleFromRow(updated);
    } catch (e) {
      console.error('Supabase updateModule error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const index = db.modules.findIndex((m) => m.id === id);
  if (index === -1) throw new Error('Module not found');

  const updated: CourseModule = {
    ...db.modules[index],
    ...data,
    id,
    createdAt: db.modules[index].createdAt,
    updatedAt: now,
  };

  db.modules[index] = updated;
  await saveDatabase(db);
  return updated;
}

export async function deleteModule(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase.from('modules').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Supabase deleteModule error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const initialLen = db.modules.length;
  db.modules = db.modules.filter((m) => m.id !== id);
  if (db.modules.length === initialLen) return false;
  await saveDatabase(db);
  return true;
}

// ==================== LEARNING STAGES ====================

export async function getStages(): Promise<LearningStage[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('learning_stages')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) return data.map(stageFromRow);
    } catch (e) {
      console.warn('Supabase getStages error:', e);
    }
  }

  const db = await getDatabase();
  return [...db.learningStages].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createStage(data: Omit<LearningStage, 'id'>): Promise<LearningStage> {
  const newId = `stage-${Date.now()}`;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = stageToRow({ ...data, id: newId });
      const { data: inserted, error } = await supabase.from('learning_stages').insert(row).select().single();
      if (error) throw error;
      return stageFromRow(inserted);
    } catch (e) {
      console.error('Supabase createStage error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const newStage: LearningStage = { ...data, id: newId };
  db.learningStages.push(newStage);
  await saveDatabase(db);
  return newStage;
}

export async function updateStage(id: string, data: Partial<LearningStage>): Promise<LearningStage> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = stageToRow(data);
      const { data: updated, error } = await supabase
        .from('learning_stages')
        .update(row)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return stageFromRow(updated);
    } catch (e) {
      console.error('Supabase updateStage error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const index = db.learningStages.findIndex((s) => s.id === id);
  if (index === -1) throw new Error('Stage not found');

  const updated = { ...db.learningStages[index], ...data, id };
  db.learningStages[index] = updated;
  await saveDatabase(db);
  return updated;
}

export async function deleteStage(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase.from('learning_stages').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Supabase deleteStage error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const initialLen = db.learningStages.length;
  db.learningStages = db.learningStages.filter((s) => s.id !== id);
  if (db.learningStages.length === initialLen) return false;
  await saveDatabase(db);
  return true;
}

// ==================== GALLERY ====================

export async function getGallery(options?: { homeOnly?: boolean }): Promise<GalleryItem[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let query = supabase.from('gallery').select('*').order('sort_order', { ascending: true });
      if (options?.homeOnly) {
        query = query.eq('show_on_home', true);
      }
      const { data, error } = await query;
      if (!error && data) return data.map(galleryFromRow);
    } catch (e) {
      console.warn('Supabase getGallery error:', e);
    }
  }

  const db = await getDatabase();
  let result = [...db.gallery];
  if (options?.homeOnly) {
    result = result.filter((g) => g.showOnHome);
  }
  result.sort((a, b) => a.sortOrder - b.sortOrder);
  return result;
}

export async function createGalleryItem(data: Omit<GalleryItem, 'id' | 'createdAt'>): Promise<GalleryItem> {
  const now = new Date().toISOString();
  const newId = `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = galleryToRow({ ...data, id: newId, createdAt: now });
      const { data: inserted, error } = await supabase.from('gallery').insert(row).select().single();
      if (error) throw error;
      return galleryFromRow(inserted);
    } catch (e) {
      console.error('Supabase createGalleryItem error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const newItem: GalleryItem = {
    ...data,
    id: newId,
    createdAt: now,
  };
  db.gallery.push(newItem);
  await saveDatabase(db);
  return newItem;
}

export async function updateGalleryItem(id: string, data: Partial<GalleryItem>): Promise<GalleryItem> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = galleryToRow(data);
      const { data: updated, error } = await supabase
        .from('gallery')
        .update(row)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return galleryFromRow(updated);
    } catch (e) {
      console.error('Supabase updateGalleryItem error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const index = db.gallery.findIndex((g) => g.id === id);
  if (index === -1) throw new Error('Gallery item not found');

  const updated = { ...db.gallery[index], ...data, id };
  db.gallery[index] = updated;
  await saveDatabase(db);
  return updated;
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Supabase deleteGalleryItem error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const initialLen = db.gallery.length;
  db.gallery = db.gallery.filter((g) => g.id !== id);
  if (db.gallery.length === initialLen) return false;
  await saveDatabase(db);
  return true;
}

// ==================== EVENTS ====================

export async function getEvents(options?: {
  publishedOnly?: boolean;
  type?: 'upcoming' | 'past';
}): Promise<DivisionEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      let query = supabase.from('events').select('*');
      if (options?.publishedOnly) {
        query = query.eq('published', true);
      }
      if (options?.type === 'upcoming') {
        query = query.gte('event_date', today).order('event_date', { ascending: true });
      } else if (options?.type === 'past') {
        query = query.lt('event_date', today).order('event_date', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) {
        const result = data.map(eventFromRow);
        if (!options?.type) {
          result.sort((a, b) => {
            const aUpcoming = a.eventDate >= today;
            const bUpcoming = b.eventDate >= today;
            if (aUpcoming && !bUpcoming) return -1;
            if (!aUpcoming && bUpcoming) return 1;
            if (aUpcoming) return a.eventDate.localeCompare(b.eventDate);
            return b.eventDate.localeCompare(a.eventDate);
          });
        }
        return result;
      }
    } catch (e) {
      console.warn('Supabase getEvents error:', e);
    }
  }

  const db = await getDatabase();
  let result = [...db.events];

  if (options?.publishedOnly) {
    result = result.filter((e) => e.published);
  }

  if (options?.type === 'upcoming') {
    result = result.filter((e) => e.eventDate >= today);
    result.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  } else if (options?.type === 'past') {
    result = result.filter((e) => e.eventDate < today);
    result.sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  } else {
    result.sort((a, b) => {
      const aUpcoming = a.eventDate >= today;
      const bUpcoming = b.eventDate >= today;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      if (aUpcoming) return a.eventDate.localeCompare(b.eventDate);
      return b.eventDate.localeCompare(a.eventDate);
    });
  }

  return result;
}

export async function getEventById(id: string): Promise<DivisionEvent | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
      if (!error && data) return eventFromRow(data);
    } catch (e) {
      console.warn('Supabase getEventById error:', e);
    }
  }

  const db = await getDatabase();
  return db.events.find((e) => e.id === id) || null;
}

export async function createEvent(data: Omit<DivisionEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<DivisionEvent> {
  const now = new Date().toISOString();
  const newId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = eventToRow({ ...data, id: newId, createdAt: now, updatedAt: now });
      const { data: inserted, error } = await supabase.from('events').insert(row).select().single();
      if (error) throw error;
      return eventFromRow(inserted);
    } catch (e) {
      console.error('Supabase createEvent error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const newEvent: DivisionEvent = {
    ...data,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };
  db.events.push(newEvent);
  await saveDatabase(db);
  return newEvent;
}

export async function updateEvent(id: string, data: Partial<DivisionEvent>): Promise<DivisionEvent> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = eventToRow({ ...data, updatedAt: now });
      const { data: updated, error } = await supabase
        .from('events')
        .update(row)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return eventFromRow(updated);
    } catch (e) {
      console.error('Supabase updateEvent error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const index = db.events.findIndex((e) => e.id === id);
  if (index === -1) throw new Error('Event not found');

  const updated: DivisionEvent = {
    ...db.events[index],
    ...data,
    id,
    createdAt: db.events[index].createdAt,
    updatedAt: now,
  };

  db.events[index] = updated;
  await saveDatabase(db);
  return updated;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Supabase deleteEvent error:', e);
      throw e;
    }
  }

  const db = await getDatabase();
  const initialLen = db.events.length;
  db.events = db.events.filter((e) => e.id !== id);
  if (db.events.length === initialLen) return false;
  await saveDatabase(db);
  return true;
}

// ==================== AUTH / ADMIN ====================

export async function getAdminByUsernameOrEmail(identifier: string): Promise<AdminUser | null> {
  const clean = identifier.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .or(`username.ilike.${clean},email.ilike.${clean}`)
        .maybeSingle();
      if (!error && data) {
        return adminFromRow(data);
      }
    } catch (e) {
      console.warn('Supabase getAdminByUsernameOrEmail error, falling back:', e);
    }
  }

  const db = await getDatabase();
  return (
    db.admins.find(
      (a) => a.username.toLowerCase() === clean || a.email.toLowerCase() === clean
    ) || null
  );
}

// ==================== LECTURERS ====================

export async function getLecturers(): Promise<Lecturer[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('lecturers')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        return data.map(lecturerFromRow);
      }
    } catch (e) {
      console.warn('Supabase getLecturers error:', e);
    }
  }

  const db = await getDatabase();
  const list = db.lecturers || [];
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}
