import { NextRequest, NextResponse } from 'next/server';
import { getGallery, createGalleryItem } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const homeOnly = searchParams.get('homeOnly') === 'true';

    const items = await getGallery({ homeOnly });
    return NextResponse.json({ success: true, count: items.length, gallery: items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { imageUrl, title, eventDate, showOnHome, sortOrder } = body;

    if (!imageUrl || !title) {
      return NextResponse.json({ error: 'Image URL and title are required' }, { status: 400 });
    }

    const newItem = await createGalleryItem({
      imageUrl: imageUrl.trim(),
      title: title.trim(),
      eventDate: eventDate ? eventDate.trim() : undefined,
      showOnHome: showOnHome !== undefined ? showOnHome : true,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 99,
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create gallery item' }, { status: 400 });
  }
}
