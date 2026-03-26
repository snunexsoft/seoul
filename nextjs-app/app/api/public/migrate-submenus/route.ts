import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

// 탄소중립연구자 네트워크 서브메뉴 추가 (1회성 마이그레이션)
export async function GET(request: Request) {
  // 간단한 보호 - 쿼리 파라미터 확인
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'migrate-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 탄소중립연구자 네트워크 메뉴 ID 확인
    const parent = await dbQuery.get<{ id: number }>(
      "SELECT id FROM menus WHERE name = '탄소중립연구자 네트워크' AND parent_id IS NULL LIMIT 1"
    );

    if (!parent) {
      return NextResponse.json({ error: '탄소중립연구자 네트워크 메뉴를 찾을 수 없습니다' }, { status: 404 });
    }

    const parentId = parent.id;

    // 이미 서브메뉴가 있는지 확인
    const existing = await dbQuery.all(
      "SELECT id, name FROM menus WHERE parent_id = $1",
      [parentId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        message: '이미 서브메뉴가 존재합니다', 
        existing 
      });
    }

    // Header.jsx에 하드코딩되어 있던 서브메뉴 추가
    const subMenus = [
      { name: '연구자 소개', url: '/researcher-network', type: 'page', sort_order: 0 },
      { name: '연구 프로젝트', url: '/research-projects', type: 'page', sort_order: 1 },
      { name: '협력 프로그램', url: '/collaboration', type: 'page', sort_order: 2 },
      { name: '탄소중립 기술', url: '/carbon-tech', type: 'page', sort_order: 3 },
      { name: '기후과학 연구', url: '/climate-research', type: 'page', sort_order: 4 },
    ];

    const results = [];
    for (const menu of subMenus) {
      await dbQuery.run(
        `INSERT INTO menus (name, url, type, parent_id, sort_order, is_active, created_at) 
         VALUES ($1, $2, $3, $4, $5, true, NOW())`,
        [menu.name, menu.url, menu.type, parentId, menu.sort_order]
      );
      results.push(menu.name);
    }

    return NextResponse.json({ 
      success: true, 
      message: `${results.length}개 서브메뉴 추가 완료`,
      parentId,
      added: results 
    });
  } catch (error: any) {
    console.error('마이그레이션 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
