import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const json = await request.json();
    if (!json) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(json.task && { task: json.task }),
        ...(json.status && { status: json.status }),
        ...(json.priority && { priority: json.priority }),
        ...(json.dueDate && { dueDate: new Date(json.dueDate) }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Error updating task' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params?.id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const taskId = parseInt(params.id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });
    
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Error deleting task' }, 
      { status: 500 }
    );
  }
}
