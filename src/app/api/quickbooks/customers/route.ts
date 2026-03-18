import { makeApiCall } from '@/lib/quickbooks';

export async function GET() {
  // The query parameter is not URL encoded here because makeApiCall will handle it.
  return makeApiCall('query', 'select * from Customer');
}
