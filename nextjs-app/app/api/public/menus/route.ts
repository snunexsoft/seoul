import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface Menu {
  id: number;
  name: string;
  url: string;
  type: string;
  parent_id?: number | null;
  sort_order: number;
  children?: Menu[];
}

// 계층형 메뉴 구조 생성
function buildMenuTree(flatMenus: Menu[]): Menu[] {
  const menuMap = new Map<number, Menu>();
  const rootMenus: Menu[] = [];

  // 메뉴 맵 생성
  flatMenus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // 트리 구조 생성
  flatMenus.forEach(menu => {
    const menuNode = menuMap.get(menu.id)!;
    if (menu.parent_id) {
      const parent = menuMap.get(menu.parent_id);
      if (parent) {
        parent.children!.push(menuNode);
      } else {
        rootMenus.push(menuNode);
      }
    } else {
      rootMenus.push(menuNode);
    }
  });

  // 자식 메뉴 정렬
  const sortMenus = (menus: Menu[]) => {
    menus.sort((a, b) => a.sort_order - b.sort_order);
    menus.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        sortMenus(menu.children);
      }
    });
  };

  sortMenus(rootMenus);
  return rootMenus;
}

// GET - 공개 메뉴 조회 (계층 구조)
export async function GET() {
  try {
    const menus = await dbQuery.all<Menu>(`
      SELECT id, name, url, type, parent_id, sort_order 
      FROM menus 
      WHERE is_active = true
      ORDER BY parent_id ASC NULLS FIRST, sort_order ASC
    `);

    // 계층 구조로 변환
    const menuTree = buildMenuTree(menus || []);

    // 캐시 헤더 추가 - 1시간 캐싱
    return NextResponse.json(menuTree, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    return NextResponse.json({ error: '메뉴를 불러오는데 실패했습니다' }, { status: 500 });
  }
}

// POST - 탄소중립연구자 네트워크 서브메뉴 마이그레이션 (1회성)
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'migrate-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parent = await dbQuery.get<{ id: number }>(
      "SELECT id FROM menus WHERE name = '탄소중립연구자 네트워크' AND parent_id IS NULL LIMIT 1"
    );

    if (!parent) {
      return NextResponse.json({ error: '탄소중립연구자 네트워크 메뉴를 찾을 수 없습니다' }, { status: 404 });
    }

    const parentId = parent.id;

    const existing = await dbQuery.all(
      "SELECT id, name FROM menus WHERE parent_id = $1",
      [parentId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: '이미 서브메뉴가 존재합니다', existing });
    }

    // 시퀀스 리셋
    await dbQuery.run("SELECT setval(pg_get_serial_sequence('menus', 'id'), (SELECT MAX(id) FROM menus))");

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

    return NextResponse.json({ success: true, message: `${results.length}개 서브메뉴 추가 완료`, parentId, added: results });
  } catch (error: any) {
    console.error('마이그레이션 오류:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
