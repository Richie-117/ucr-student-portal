import { NextRequest, NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const reset = await resetDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database reset to initial sample data successfully.',
      counts: {
        students: reset.students.length,
        modules: reset.modules.length,
        stages: reset.learningStages.length,
        gallery: reset.gallery.length,
        events: reset.events.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reset database' }, { status: 500 });
  }
}
