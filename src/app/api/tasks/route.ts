import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const task = await prisma.task.create({
      data: {
        task: json.task,
        status: json.status,
        priority: json.priority,
        dueDate: new Date(json.dueDate),
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 });
  }
} 