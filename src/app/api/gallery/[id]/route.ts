import { NextRequest, NextResponse } from 'next/server';
import { updateGalleryItem, deleteGalleryItem } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const updated = await updateGalleryItem(params.id, body);
    return NextResponse.json({ success: true, item: updated });
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

    const deleted = await deleteGalleryItem(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
