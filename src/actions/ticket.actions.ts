'use server';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { logEvent } from '@/utils/sentry';

export const createTicket = async (
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> => {
  try {
    /* throw new Error('Simulated prisma error'); */

    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;

    if (!subject || !description || !priority) {
      logEvent(
        'Validation Error: Missing data fields',
        'ticket',
        {
          subject,
          description,
          priority,
        },
        'warning'
      );
      return {
        success: false,
        message: 'All fields are required',
      };
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority,
      },
    });

    logEvent(
      `Ticket created successfully: ${ticket.id}`,
      'ticket',
      {
        ticketId: ticket.id,
      },
      'info'
    );

    revalidatePath('/tickets');

    return {
      success: true,
      message: 'Ticket created successfully',
    };
  } catch (error) {
    logEvent(
      'An error occured while creating the ticket',
      'ticket',
      {
        formData: Object.fromEntries(formData.entries()),
      },
      'error',
      error
    );
    return {
      success: false,
      message: 'Error occurred while creating ticket',
    };
  }
};

export const getTickets = async () => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    logEvent(
      'Tickets fetched successfully',
      'ticket',
      {
        count: tickets.length,
      },
      'info'
    );
    return tickets;
  } catch (error) {
    logEvent('Error fetching tickets', 'ticket', {}, 'error', error);
    return [];
  }
};

export const getTicketById = async (id: string) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(id) },
    });

    if (!ticket) {
      logEvent('Ticket not found', 'ticket', { ticketId: id }, 'warning');
      return {
        success: false,
        message: 'Ticket not found',
      };
    }
    return {
      success: true,
      ticket,
    };
  } catch (error) {
    logEvent(
      'Error fetching ticket details',
      'ticket',
      { ticketId: id },
      'error',
      error
    );

    return null;
  }
};
