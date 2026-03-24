import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 인증 없이 접근 가능한 공개 API 경로
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/check',
  '/api/public/',
  '/api/boards',
  '/api/pages/',
  '/api/history',
  '/api/hero-slides',
  '/api/menus',
  '/api/solar',
  '/api/buildings',
  '/api/post/',
];

function isPublicApiRoute(path: string): boolean {
  // GET /api/posts, /api/posts/[id], /api/posts/[id]/view 는 공개
  if (path.match(/^\/api\/posts(\/\d+)?(\/view)?$/) && !path.includes('?')) {
    return true;
  }
  return PUBLIC_API_ROUTES.some(route => path.startsWith(route));
}

async function verifyTokenInMiddleware(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;
    const encodedSecret = new TextEncoder().encode(secret);
    await jwtVerify(token, encodedSecret);
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  // 정적 자산에 대한 캐시 헤더 설정
  if (path.startsWith('/img/') ||
      path.startsWith('/downloads/') ||
      path.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // Public API 응답에 대한 기본 캐시 헤더
  if (path.startsWith('/api/public/')) {
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  }

  // API 라우트 보호: 공개 API가 아닌 경우 인증 필요
  if (path.startsWith('/api/') && !isPublicApiRoute(path)) {
    // GET 요청의 /api/posts 관련은 공개 허용
    if (request.method === 'GET' && path.match(/^\/api\/posts/)) {
      return response;
    }

    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken || !(await verifyTokenInMiddleware(adminToken))) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
  }

  // /admin으로 시작하는 경로인지 확인
  if (path.startsWith('/admin')) {
    // 로그인 페이지는 제외
    if (path === '/admin/login') {
      return response;
    }

    // JWT 토큰 검증
    const adminToken = request.cookies.get('admin-token')?.value;

    if (!adminToken || !(await verifyTokenInMiddleware(adminToken))) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/img/:path*',
    '/downloads/:path*',
    '/_next/static/:path*'
  ]
};
