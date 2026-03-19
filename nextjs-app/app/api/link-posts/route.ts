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

// GET /api/link-posts - 링크 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    let query = `
      SELECT * FROM link_posts
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND (main_category = $${paramIndex} OR sub_category = $${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const posts = await dbQuery.all<LinkPost>(query, params);

    // 전체 개수 조회
    let countQuery = `SELECT COUNT(*) as total FROM link_posts WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND (main_category = $${countParamIndex} OR sub_category = $${countParamIndex})`;
      countParams.push(category);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamIndex} OR content ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await dbQuery.get<{ total: string }>(countQuery, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Error fetching link posts:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/link-posts - 링크 게시글 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, link_url, image_url, main_category, sub_category, status } = body;

    if (!title || !content || !link_url || !main_category || !sub_category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await dbQuery.run(
      `INSERT INTO link_posts (title, content, link_url, image_url, main_category, sub_category, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [title, content, link_url, image_url || null, main_category, sub_category, status || 'published']
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating link post:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
