import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface LinkPost {
  id: number;
  title: string;
  content: string;
  link_url: string;
  image_url?: string;
  main_category: string;
  sub_category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// GET /api/link-posts/[id] - 링크 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await dbQuery.get<LinkPost>(
      'SELECT * FROM link_posts WHERE id = $1',
      [parseInt(id)]
    );

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error fetching link post:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/link-posts/[id] - 링크 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, link_url, image_url, main_category, sub_category, status } = body;

    if (!title || !content || !link_url || !main_category || !sub_category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await dbQuery.run(
      `UPDATE link_posts
       SET title = $1, content = $2, link_url = $3, image_url = $4,
           main_category = $5, sub_category = $6, status = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, content, link_url, image_url || null, main_category, sub_category, status || 'published', parseInt(id)]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating link post:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/link-posts/[id] - 링크 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await dbQuery.run(
      'DELETE FROM link_posts WHERE id = $1 RETURNING id',
      [parseInt(id)]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('Error deleting link post:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
