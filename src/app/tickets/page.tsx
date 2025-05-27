import { getTickets } from '@/actions/ticket.actions';
import { logEvent } from '@/utils/sentry';
import Link from 'next/link';

const TicketsPage = async () => {
  const tickets = await getTickets();
  console.log(tickets);

  return (
    <div className='min-h-screen bg-blue-50 p-8'>
      <h1 className='text-3xl font-bold text-blue-600 mb-8 text-center'>
        Support Tickets
      </h1>
      {tickets.length > 0 ? (
        <div className='space-y-4 max-w-3xl mx-auto'>
          {tickets.map((item) => (
            <div
              key={item.id}
              className='flex justify-between items-center bg-white p-6 rounded-lg shadow border border-gray-200'
            >
              <h2 className='text-xl font-semibold text-blue-600'>
                {item.subject}
              </h2>
              <p className='text-right space-y-2'>
                <div className='text-sm text-gray-500'>
                  Priority: <span className='font-bold'>{item.priority}</span>
                </div>
                <Link
                  href={`/tickets/${item.id}`}
                  className='inline-block mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition text-center'
                >
                  View Ticket
                </Link>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center text-gray-600'>No tickets found</div>
      )}
    </div>
  );
};

export default TicketsPage;
