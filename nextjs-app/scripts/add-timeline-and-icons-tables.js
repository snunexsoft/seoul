const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addTimelineAndIconsTables() {
  try {
    console.log('Adding timeline background images and icon links tables...');

    // 타임라인 배경 이미지 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timeline_backgrounds (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(500) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ timeline_backgrounds table created');

    // 아이콘 링크 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS icon_links (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        icon_url VARCHAR(500) NOT NULL,
        link_url VARCHAR(500) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ icon_links table created');

    // 기본 아이콘 링크 데이터 삽입
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
      await pool.query(`
        INSERT INTO icon_links (name, icon_url, link_url, display_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [icon.name, `/img/${icon.icon}`, icon.url, icon.order]);
    }

    console.log('✅ Default icon links added');

    // 기본 타임라인 배경 이미지 추가
    const backgroundImages = ['a1.jpg', 'a2.jpg', 'a3.jpg', 'a4.jpg', 'a5.jpg', 'a6.jpg', 'a7.jpg', 'a8.jpg', 'a9.jpg'];
    
    for (let i = 0; i < backgroundImages.length; i++) {
      await pool.query(`
        INSERT INTO timeline_backgrounds (image_url, display_order)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [`/img/${backgroundImages[i]}`, i + 1]);
    }

    console.log('✅ Default timeline background images added');

    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

addTimelineAndIconsTables();