import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

console.log('Creating link_posts table...');

db.serialize(() => {
  // 링크 게시글 테이블 생성
  db.run(`
    CREATE TABLE IF NOT EXISTS link_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      link_url TEXT NOT NULL,
      image_url TEXT,
      main_category TEXT NOT NULL,
      sub_category TEXT NOT NULL,
      status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating link_posts table:', err);
    } else {
      console.log('✅ link_posts table created successfully');
    }
  });

  // 샘플 데이터 삽입
  const samplePosts = [
    {
      title: '탄소포집 및 활용 기술 연구 동향',
      content: '최신 탄소포집 기술의 발전 현황과 활용 방안에 대한 연구 결과를 공유합니다.',
      link_url: 'https://example.com/carbon-capture',
      image_url: '/img/placeholder.jpg',
      main_category: '탄소 포집, 저장 활용 및 처리',
      sub_category: '탄소 포집 기술'
    },
    {
      title: '친환경 건축 재료 개발 프로젝트',
      content: '지속가능한 건축을 위한 친환경 소재 개발에 대한 최신 연구 성과입니다.',
      link_url: 'https://example.com/green-materials',
      image_url: '/img/placeholder.jpg',
      main_category: '기타, 환경, 과정 등',
      sub_category: '환경 정책'
    },
    {
      title: '태양광 발전 효율성 개선 연구',
      content: '차세대 태양광 패널 기술을 통한 발전 효율성 향상 방안을 제시합니다.',
      link_url: 'https://example.com/solar-efficiency',
      image_url: '/img/placeholder.jpg',
      main_category: '무탄소 전력 공급',
      sub_category: '태양광 발전'
    },
    {
      title: '바이오매스 에너지 활용 기술',
      content: '바이오매스를 활용한 친환경 에너지 생산 기술의 최신 동향입니다.',
      link_url: 'https://example.com/biomass-energy',
      image_url: '/img/placeholder.jpg',
      main_category: '바이오매스 모빌 건설시스템',
      sub_category: '바이오매스 기술'
    },
    {
      title: '수소 에너지 저장 시스템',
      content: '수소를 활용한 에너지 저장 및 활용 시스템의 개발 현황을 소개합니다.',
      link_url: 'https://example.com/hydrogen-storage',
      image_url: '/img/placeholder.jpg',
      main_category: '화학적 에너지 기술 관리',
      sub_category: '수소 에너지'
    },
    {
      title: '열펌프 기술 혁신',
      content: '고효율 열펌프 기술을 통한 건물 냉난방 시스템의 혁신적 발전입니다.',
      link_url: 'https://example.com/heat-pump',
      image_url: '/img/placeholder.jpg',
      main_category: '청정 열 및 전기화',
      sub_category: '열펌프 기술'
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO link_posts (title, content, link_url, image_url, main_category, sub_category, status)
    VALUES (?, ?, ?, ?, ?, ?, 'published')
  `);

  samplePosts.forEach((post, index) => {
    insertStmt.run([
      post.title,
      post.content,
      post.link_url,
      post.image_url,
      post.main_category,
      post.sub_category
    ], (err) => {
      if (err) {
        console.error(`Error inserting sample post ${index + 1}:`, err);
      } else {
        console.log(`✅ Sample post ${index + 1} inserted: ${post.title}`);
      }
    });
  });

  insertStmt.finalize((err) => {
    if (err) {
      console.error('Error finalizing insert statement:', err);
    } else {
      console.log('✅ All sample posts inserted successfully');
    }
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  });
});