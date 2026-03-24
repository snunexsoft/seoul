import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await dbQuery.get(
      `SELECT p.*, b.name as board_name, b.slug as board_slug_name
       FROM posts p LEFT JOIN boards b ON p.board_id = b.id
       WHERE p.id = $1`, [id]);

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await dbQuery.run('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [id]);

    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
