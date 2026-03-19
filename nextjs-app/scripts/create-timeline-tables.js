const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database.db'));

try {
  // 타임라인 배경 이미지 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS timeline_backgrounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ timeline_backgrounds 테이블 생성됨');

  // 아이콘 링크 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS icon_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon_url TEXT NOT NULL,
      link_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ icon_links 테이블 생성됨');

  // 기본 아이콘 링크 데이터 확인 및 삽입
  const iconCount = db.prepare('SELECT COUNT(*) as count FROM icon_links').get();
  
  if (iconCount.count === 0) {
    const insertIcon = db.prepare(`
      INSERT INTO icon_links (name, icon_url, link_url, display_order) 
      VALUES (?, ?, ?, ?)
    `);

    const defaultIcons = [
      { name: '온실가스 배출량', icon: '1.png', url: '/greenhouse-gas', order: 1 },
      { name: '온실가스 감축활동', icon: '2.png', url: '#', order: 2 },
      { name: '온실가스 맵', icon: '3.png', url: '#', order: 3 },
      { name: '에너지', icon: '4.png', url: '/energy', order: 4 },
      { name: '태양광 발전', icon: '5.png', url: '/solar-power', order: 5 },
      { name: '전력사용량', icon: '6.png', url: '#', order: 6 },
      { name: '친환경 학생 활동', icon: '8.png', url: '#', order: 7 },
      { name: '그린리더십', icon: '9.png', url: '#', order: 8 },
      { name: '그린레포트', icon: '10.png', url: '#', order: 9 },
      { name: '인포그래픽', icon: '11.png', url: '/infographic', order: 10 },
      { name: '자료실', icon: '12.png', url: '#', order: 11 },
      { name: '지속가능성 보고서', icon: '1.png', url: '#', order: 12 }
    ];

    for (const icon of defaultIcons) {
      insertIcon.run(icon.name, `/img/${icon.icon}`, icon.url, icon.order);
    }
    console.log('✅ 기본 아이콘 링크 데이터 추가됨');
  }

  // 기본 타임라인 배경 이미지 확인 및 추가
  const bgCount = db.prepare('SELECT COUNT(*) as count FROM timeline_backgrounds').get();
  
  if (bgCount.count === 0) {
    const insertBg = db.prepare(`
      INSERT INTO timeline_backgrounds (image_url, display_order) 
      VALUES (?, ?)
    `);

    const backgroundImages = ['a1.jpg', 'a2.jpg', 'a3.jpg', 'a4.jpg', 'a5.jpg', 'a6.jpg', 'a7.jpg', 'a8.jpg', 'a9.jpg'];
    
    for (let i = 0; i < backgroundImages.length; i++) {
      insertBg.run(`/img/${backgroundImages[i]}`, i + 1);
    }
    console.log('✅ 기본 타임라인 배경 이미지 추가됨');
  }

  console.log('✅ 모든 테이블이 성공적으로 생성되었습니다!');
} catch (error) {
  console.error('❌ 오류 발생:', error);
} finally {
  db.close();
}