import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);

    if (!auth.isAuthenticated) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      username: auth.username
    });
  } catch (error) {
    console.error('세션 체크 오류:', error);
    return NextResponse.json({ authenticated: false });
  }
}
