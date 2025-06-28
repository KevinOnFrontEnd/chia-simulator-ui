import { NextResponse } from 'next/server';

/**
 * This health endpoint is to determine when the docker container has started so that 
 * tests can be run against the api (e.g. using cdv/get address)
 * 
 * @returns A date string indicating api is active.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() });
}