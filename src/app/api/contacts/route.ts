import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching contacts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const contact = await prisma.contact.create({
      data: {
        name: json.name,
        email: json.email,
        phone: json.phone,
      },
    });
    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating contact' }, { status: 500 });
  }
} 