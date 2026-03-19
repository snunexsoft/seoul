import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import bcrypt from 'bcrypt';
import { createToken } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await dbQuery.get<User>(
      'SELECT id, username, password FROM users WHERE username = $1',
      [username]
    );

    if (!user) {
      return NextResponse.json(
        { error: '잘못된 사용자명 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '잘못된 사용자명 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = createToken(user.id, user.username);

    // 성공 응답
    const response = NextResponse.json({
      success: true,
      username: user.username,
      message: '로그인에 성공했습니다.'
    });

    // JWT 토큰을 HttpOnly 쿠키에 저장
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    return response;
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}