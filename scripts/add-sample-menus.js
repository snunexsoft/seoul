const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', 'server', 'database.db');

console.log('🚀 샘플 메뉴 추가 중...');
console.log('📍 DB 경로:', dbPath);

try {
  const db = new Database(dbPath);
  
  // WAL 모드 설정
  db.pragma('journal_mode = WAL');
  
  console.log('✅ 데이터베이스 연결 성공');

  // 기존 메뉴 삭제 (선택사항)
  // db.exec('DELETE FROM menus');

  // 메인 메뉴들 추가
  const insertMenu = db.prepare(`
    INSERT INTO menus (name, url, type, parent_id, sort_order, is_active, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  // 메인 메뉴들
  const mainMenus = [
    { name: '온실가스', url: '/greenhouse-gas', type: 'page', sort_order: 1 },
    { name: '에너지', url: '/energy', type: 'page', sort_order: 2 },
    { name: '태양광 발전', url: '/solar-power', type: 'page', sort_order: 3 },
    { name: '그린캠퍼스', url: '#', type: 'page', sort_order: 4 },
    { name: '그린레포트', url: '#', type: 'page', sort_order: 5 },
    { name: '탄소중립연구자 네트워크', url: '#', type: 'page', sort_order: 6 },
    { name: '에너지 데이터 플랫폼', url: '#', type: 'page', sort_order: 7 }
  ];

  const menuIds = {};

  // 메인 메뉴 삽입
  mainMenus.forEach(menu => {
    const result = insertMenu.run(menu.name, menu.url, menu.type, null, menu.sort_order, 1, now);
    menuIds[menu.name] = result.lastInsertRowid;
    console.log(`✅ 메인 메뉴 추가: ${menu.name} (ID: ${result.lastInsertRowid})`);
  });

  // 하위 메뉴들
  const subMenus = [
    // 그린캠퍼스 하위
    { parent: '그린캠퍼스', name: '그린캠퍼스 소개', url: '/green-campus', sort_order: 1 },
    { parent: '그린캠퍼스', name: '친환경 건물', url: '/green-building', sort_order: 2 },
    { parent: '그린캠퍼스', name: '친환경 교통', url: '/green-transport', sort_order: 3 },
    { parent: '그린캠퍼스', name: '폐기물 관리', url: '/waste-management', sort_order: 4 },
    
    // 그린레포트 하위
    { parent: '그린레포트', name: '지속가능성 보고서', url: '/sustainability-report', sort_order: 1 },
    { parent: '그린레포트', name: '인포그래픽', url: '/infographic', sort_order: 2 },
    { parent: '그린레포트', name: '연구보고서', url: '/research-report', sort_order: 3 },
    
    // 탄소중립연구자 네트워크 하위
    { parent: '탄소중립연구자 네트워크', name: '연구자 소개', url: '/researcher-network', sort_order: 1 },
    { parent: '탄소중립연구자 네트워크', name: '연구 프로젝트', url: '/research-projects', sort_order: 2 },
    { parent: '탄소중립연구자 네트워크', name: '협력 프로그램', url: '/collaboration', sort_order: 3 },
    { parent: '탄소중립연구자 네트워크', name: '탄소중립 기술', url: '/carbon-tech', sort_order: 4 },
    { parent: '탄소중립연구자 네트워크', name: '기후과학 연구', url: '/climate-research', sort_order: 5 },
    
    // 에너지 데이터 플랫폼 하위
    { parent: '에너지 데이터 플랫폼', name: '데이터 대시보드', url: '/data-dashboard', sort_order: 1 },
    { parent: '에너지 데이터 플랫폼', name: 'API 문서', url: '/api-docs', sort_order: 2 },
    { parent: '에너지 데이터 플랫폼', name: '데이터 다운로드', url: '/data-download', sort_order: 3 }
  ];

  // 하위 메뉴 삽입
  subMenus.forEach(menu => {
    const parentId = menuIds[menu.parent];
    if (parentId) {
      const result = insertMenu.run(menu.name, menu.url, 'page', parentId, menu.sort_order, 1, now);
      console.log(`  ✅ 하위 메뉴 추가: ${menu.name} (부모: ${menu.parent})`);
    }
  });

  db.close();
  console.log('🎉 샘플 메뉴 추가 완료!');

} catch (error) {
  console.error('❌ 데이터베이스 업데이트 실패:', error);
  process.exit(1);
}