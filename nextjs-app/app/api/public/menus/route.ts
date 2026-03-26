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
// POST - DB 마이그레이션: link_posts에 section 컬럼 추가
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'migrate-section-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // section 컬럼 추가
    await dbQuery.run("ALTER TABLE link_posts ADD COLUMN IF NOT EXISTS section VARCHAR(100) DEFAULT '탄소중립 기술'");
    
    // 기존 데이터 업데이트
    await dbQuery.run("UPDATE link_posts SET section = '탄소중립 기술' WHERE section IS NULL OR section = '탄소중립 기술'");

    const posts = await dbQuery.all("SELECT id, title, section FROM link_posts");
    return NextResponse.json({ success: true, message: 'section 컬럼 추가 완료', posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
