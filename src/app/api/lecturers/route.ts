import { NextResponse } from 'next/server';
import { getLecturers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lecturers = await getLecturers();
    return NextResponse.json({ success: true, count: lecturers.length, lecturers });
  } catch (error: any) {
    console.error('Error fetching lecturers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lecturers' },
      { status: 500 }
    );
  }
}
