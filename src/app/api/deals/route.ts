import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        contact: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Fetched deals:', deals); // Debug log
    return NextResponse.json(deals);
    
  } catch (error) {
    console.error('Error fetching deals:', error); // Debug log
    return NextResponse.json({ error: 'Error fetching deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const deal = await prisma.deal.create({
      data: {
        name: json.name,
        value: json.value,
        stage: json.stage,
        contactId: json.contactId ? parseInt(json.contactId.toString()) : null
      },
      include: {
        contact: true
      }
    });
    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json({ error: 'Error creating deal' }, { status: 500 });
  }
} 