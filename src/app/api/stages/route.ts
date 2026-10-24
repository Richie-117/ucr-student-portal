import { NextRequest, NextResponse } from 'next/server';
import { getStages, createStage } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    const stages = await getStages();
    return NextResponse.json({ success: true, count: stages.length, stages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch stages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { title, description, sortOrder, published } = body;

    if (!title) {
      return NextResponse.json({ error: 'Stage title is required' }, { status: 400 });
    }

    const newStage = await createStage({
      title: title.trim(),
      description: description ? description.trim() : undefined,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 99,
      published: published !== undefined ? published : true,
    });

    return NextResponse.json({ success: true, stage: newStage }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create stage' }, { status: 400 });
  }
}
