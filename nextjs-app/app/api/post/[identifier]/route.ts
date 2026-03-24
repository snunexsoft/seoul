import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;

    // ID(숫자) 또는 slug로 게시글 조회
    const isNumeric = /^\d+$/.test(identifier);
    const post = isNumeric
      ? await dbQuery.get(
          `SELECT p.*, b.name as board_name, b.slug as board_slug_name
           FROM posts p LEFT JOIN boards b ON p.board_id = b.id
           WHERE p.id = $1`, [identifier])
      : await dbQuery.get(
          `SELECT p.*, b.name as board_name, b.slug as board_slug_name
           FROM posts p LEFT JOIN boards b ON p.board_id = b.id
           WHERE p.slug = $1`, [identifier]);

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 조회수 증가
    if (isNumeric) {
      await dbQuery.run('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [identifier]);
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
