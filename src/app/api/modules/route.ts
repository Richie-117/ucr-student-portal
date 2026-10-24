import { NextRequest, NextResponse } from 'next/server';
import { getModules, createModule } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';
import { CourseType } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course') as CourseType | null;
    const status = searchParams.get('status') || undefined;
    const stageId = searchParams.get('stageId') || undefined;
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    const modules = await getModules({
      course: course && (course === 'TPOPT' || course === 'TPRPT') ? course : undefined,
      status,
      stageId,
      publishedOnly,
    });

    return NextResponse.json({ success: true, count: modules.length, modules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch modules' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { title, code, description, courseCodes, learningStageId, status, thumbnailUrl, resources, sortOrder, published } = body;

    if (!title || !description || !courseCodes || !learningStageId) {
      return NextResponse.json({ error: 'Title, description, course applicability, and learning stage are required.' }, { status: 400 });
    }

    const newModule = await createModule({
      title: title.trim(),
      code: code ? code.trim() : undefined,
      description: description.trim(),
      courseCodes,
      learningStageId,
      status: status || 'ongoing',
      thumbnailUrl: thumbnailUrl || undefined,
      resources: resources || [],
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 99,
      published: published !== undefined ? published : true,
    });

    return NextResponse.json({ success: true, module: newModule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create module' }, { status: 400 });
  }
}
