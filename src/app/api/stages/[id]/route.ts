import { NextRequest, NextResponse } from 'next/server';
import { updateStage, deleteStage } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const updated = await updateStage(params.id, body);
    return NextResponse.json({ success: true, stage: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const deleted = await deleteStage(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Stage deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
