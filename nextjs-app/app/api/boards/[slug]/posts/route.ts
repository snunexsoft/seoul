import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 보드 조회
    const board = await dbQuery.get<{ id: number }>(
      'SELECT id FROM boards WHERE slug = $1',
      [slug]
    );

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // 해당 보드의 게시글 조회
    const posts = await dbQuery.all(
      'SELECT * FROM posts WHERE board_id = $1 ORDER BY created_at DESC',
      [board.id]
    );

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
