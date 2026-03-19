import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * 첨부파일 처리 결과
 */
export interface AttachmentResult {
  attachment_filename: string;
  attachment_filepath: string;
  attachment_filesize: number;
}

/**
 * 첨부파일 유효성 검사 및 저장
 * POST와 PUT 핸들러에서 공유
 */
export async function processAttachment(
  attachment: File
): Promise<{ result: AttachmentResult } | { error: NextResponse }> {
  // 파일 확장자 확인
  const allowedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.hwp'];
  const fileExt = attachment.name.toLowerCase().substring(attachment.name.lastIndexOf('.'));

  if (!allowedFileTypes.includes(fileExt)) {
    return {
      error: NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다.' },
        { status: 400 }
      )
    };
  }

  // 파일 크기 확인 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (attachment.size > maxSize) {
    return {
      error: NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      )
    };
  }

  // 파일명 생성 (timestamp + UUID)
  const timestamp = Date.now();
  const randomString = crypto.randomUUID().substring(0, 8);
  const fileName = `${timestamp}_${randomString}${fileExt}`;

  // uploads 디렉토리 확인 및 생성
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create upload directory:', err);
  }

  // 파일 저장
  const bytes = await attachment.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  return {
    result: {
      attachment_filename: attachment.name,
      attachment_filepath: `/uploads/${fileName}`,
      attachment_filesize: attachment.size,
    }
  };
}

/**
 * 게시글 목록 조회용 쿼리 조건 빌더
 * GET 핸들러의 data 쿼리와 count 쿼리에서 공유
 */
export interface QueryFilterParams {
  board_id: string | null;
  board: string | null;
  category_id: string | null;
  search: string | null;
}

export interface QueryFilterResult {
  whereClause: string;
  params: (string | number)[];
  nextParamIndex: number;
}

export function buildPostFilterConditions(
  filters: QueryFilterParams,
  startParamIndex: number = 1
): QueryFilterResult {
  let whereClause = '';
  const params: (string | number)[] = [];
  let paramIndex = startParamIndex;

  if (filters.board_id) {
    whereClause += ` AND p.board_id = $${paramIndex++}`;
    params.push(parseInt(filters.board_id));
  }

  if (filters.board) {
    whereClause += ` AND p.board_id = $${paramIndex++}`;
    params.push(parseInt(filters.board));
  }

  if (filters.category_id) {
    whereClause += ` AND p.category_id = $${paramIndex++}`;
    params.push(parseInt(filters.category_id));
  }

  if (filters.search) {
    whereClause += ` AND (p.title ILIKE $${paramIndex++} OR p.content ILIKE $${paramIndex++})`;
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  return { whereClause, params, nextParamIndex: paramIndex };
}
