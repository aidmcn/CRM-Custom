import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (!params?.id) {
            return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 });
        }

        const dealId = parseInt(params.id, 10);
        if (isNaN(dealId)) {
            return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 });
        }

        const json = await request.json();
        console.log('Received payload:', json);

        const { name, value, stage, contactId } = json;

        // Update the deal with proper contact relationship
        const deal = await prisma.deal.update({
            where: { 
                id: dealId 
            },
            data: {
                name,
                value: value.toString(),
                stage,
                contactId: contactId ? parseInt(contactId.toString()) : null
            },
            include: {
                contact: true
            }
        });

        return NextResponse.json(deal);

    } catch (error: any) {
        console.error('Error updating deal:', error);
        return NextResponse.json(
            { error: 'Error updating deal', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 });
        }

        const dealId = parseInt(id, 10);
        if (isNaN(dealId)) {
            return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 });
        }

        const deal = await prisma.deal.delete({
            where: { id: dealId },
        });

        console.log('Deleted deal:', deal); // Debug log

        return NextResponse.json(deal);
    } catch (error: any) {
        console.error('Error deleting deal:', error);
        return NextResponse.json(
            { error: 'Error deleting deal', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
} 