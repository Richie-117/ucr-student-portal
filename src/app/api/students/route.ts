import { NextRequest, NextResponse } from 'next/server';
import { getStudents, createStudent } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';
import { CourseType } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course') as CourseType | null;
    const search = searchParams.get('search') || undefined;
    const representative = searchParams.get('representative');

    const students = await getStudents({
      course: course && (course === 'TPOPT' || course === 'TPRPT') ? course : undefined,
      search,
      isRepresentative: representative !== null ? representative === 'true' : undefined,
    });

    return NextResponse.json({ success: true, count: students.length, students });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { fullName, studentNumber, course, batch, profileImageUrl, isRepresentative, representativeRole, gender, notes } = body;

    if (!fullName || !course || !batch) {
      return NextResponse.json({ error: 'Full name, course, and batch are required.' }, { status: 400 });
    }

    if (course !== 'TPOPT' && course !== 'TPRPT') {
      return NextResponse.json({ error: 'Course must be either TPOPT or TPRPT.' }, { status: 400 });
    }

    const newStudent = await createStudent({
      fullName: fullName.trim(),
      studentNumber: (studentNumber || '').trim(),
      course,
      batch: batch.trim(),
      profileImageUrl: profileImageUrl || undefined,
      isRepresentative: Boolean(isRepresentative),
      representativeRole: representativeRole || undefined,
      gender: gender || undefined,
      notes: notes || undefined,
    });

    return NextResponse.json({ success: true, student: newStudent }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: error.message || 'Failed to create student' }, { status: 400 });
  }
}
