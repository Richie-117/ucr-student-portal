import { NextRequest, NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'upcoming' | 'past' | null;
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    const events = await getEvents({
      type: type || undefined,
      publishedOnly,
    });

    return NextResponse.json({ success: true, count: events.length, events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { title, description, eventDate, startTime, endTime, location, coverImageUrl, registrationUrl, published } = body;

    if (!title || !description || !eventDate) {
      return NextResponse.json({ error: 'Title, description, and event date are required' }, { status: 400 });
    }

    const newEvent = await createEvent({
      title: title.trim(),
      description: description.trim(),
      eventDate: eventDate.trim(),
      startTime: startTime ? startTime.trim() : undefined,
      endTime: endTime ? endTime.trim() : undefined,
      location: location ? location.trim() : undefined,
      coverImageUrl: coverImageUrl || undefined,
      registrationUrl: registrationUrl ? registrationUrl.trim() : undefined,
      published: published !== undefined ? published : true,
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 400 });
  }
}
