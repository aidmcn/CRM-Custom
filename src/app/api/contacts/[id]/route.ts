import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const contact = await prisma.contact.update({
      where: { id: parseInt(params.id) },
      data: json,
    });
    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating contact' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contact.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting contact' }, { status: 500 });
  }
} 