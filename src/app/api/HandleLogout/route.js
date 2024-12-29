

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() { // Named export for POST
  const cookieStore = await cookies();
  cookieStore.delete('token'); 
  return NextResponse.json({
    message: "Cookie deleted and Logged out"
});
}