import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { processAttachment, buildPostFilterConditions } from '@/lib/post-helpers';

interface Post {
  id: number;
  title: string;
  content: string;
  board_id?: number;
  category_id?: number;
  view_count: number;
  created_at: string;
  updated_at?: string;
  featured_image?: string;
  slug?: string;
  excerpt?: string;
  status?: string;
  attachment_filename?: string;
  attachment_filepath?: string;
  attachment_filesize?: number;
}

// GET /api/posts - 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = '10';
    const offset = String((parseInt(page) - 1) * parseInt(limit));

    const filters = {
      board_id: searchParams.get('board_id'),
      board: searchParams.get('board'),
      category_id: searchParams.get('category_id'),
      search: searchParams.get('search'),
    };

    // 데이터 쿼리 조건 빌더
    const { whereClause, params, nextParamIndex } = buildPostFilterConditions(filters);

    const query = `
      SELECT p.*, b.name as board_name, c.name as category_name
      FROM posts p
      LEFT JOIN boards b ON p.board_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1${whereClause}
      ORDER BY p.created_at DESC LIMIT $${nextParamIndex} OFFSET $${nextParamIndex + 1}
    `;
    const queryParams = [...params, parseInt(limit), parseInt(offset)];

    const posts = await dbQuery.all<Post>(query, queryParams);

    // 전체 개수 조회 (동일 필터 조건 재사용)
    const { whereClause: countWhereClause, params: countParams } = buildPostFilterConditions(filters);
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      WHERE 1=1${countWhereClause}
    `;
    const countResult = await dbQuery.get<{ total: number }>(countQuery, countParams);

    return NextResponse.json({
      results: posts,
      count: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / parseInt(limit))
    });
  } catch (error) {
    console.error('Posts fetch error:', error);
    return NextResponse.json(
      { error: '게시글 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/posts - 게시글 생성
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let postData: {
      title: string;
      slug?: string;
      content: string;
      excerpt?: string;
      featured_image?: string;
      thumbnail_url?: string;
      board_id?: number | null;
      category_id?: number | null;
      status?: string;
    } = { title: '', content: '' };
    let attachment: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // FormData 처리
      const formData = await request.formData();
      
      // 텍스트 필드 추출
      postData.title = formData.get('title') as string;
      postData.slug = formData.get('slug') as string;
      postData.content = formData.get('content') as string;
      postData.excerpt = formData.get('excerpt') as string;
      postData.featured_image = formData.get('featured_image') as string;
      postData.thumbnail_url = formData.get('thumbnail_url') as string;
      postData.board_id = formData.get('board_id') ? parseInt(formData.get('board_id') as string) : null;
      postData.category_id = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null;
      postData.status = formData.get('status') as string || 'published';
      
      // 첨부파일 확인
      attachment = formData.get('attachment') as File;
    } else {
      // JSON 처리
      postData = await request.json();
    }

    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 첨부파일 처리
    let attachment_filename = null;
    let attachment_filepath = null;
    let attachment_filesize = null;

    if (attachment) {
      const attachResult = await processAttachment(attachment);
      if ('error' in attachResult) {
        return attachResult.error;
      }
      attachment_filename = attachResult.result.attachment_filename;
      attachment_filepath = attachResult.result.attachment_filepath;
      attachment_filesize = attachResult.result.attachment_filesize;
    }

    // 게시글 생성
    const result = await dbQuery.run(
      `INSERT INTO posts (
        title, slug, content, excerpt, featured_image, thumbnail_url,
        board_id, category_id, status, 
        attachment_filename, attachment_filepath, attachment_filesize,
        view_count, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING id`,
      [
        postData.title, 
        postData.slug || null, 
        postData.content, 
        postData.excerpt || null, 
        postData.featured_image || null,
        postData.thumbnail_url || null,
        postData.board_id || null, 
        postData.category_id || null, 
        postData.status || 'published',
        attachment_filename,
        attachment_filepath,
        attachment_filesize,
        0, 
        new Date().toISOString()
      ]
    );

    const newPost = await dbQuery.get<Post>(
      'SELECT * FROM posts WHERE id = $1',
      [result.rows[0]?.id]
    );

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: '게시글 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}