const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// PostgreSQL 연결 설정
const pgPool = new Pool({
  connectionString: 'postgres://neondb_owner:npg_hOR5FfXqWJB6@ep-ancient-paper-a1vxdgn4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// SQLite 연결
const sqliteDb = new sqlite3.Database('./server/database.db');

// Promise 래퍼 함수
const sqliteAll = (sql) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function migrateAllData() {
  try {
    console.log('🚀 전체 데이터 마이그레이션 시작...\n');

    // 1. users 테이블 - admin 비밀번호 업데이트
    console.log('📍 1. Users 테이블 업데이트 중...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pgPool.query('DELETE FROM users');
    await pgPool.query(
      'INSERT INTO users (id, username, password) VALUES ($1, $2, $3)',
      [1, 'admin', hashedPassword]
    );
    console.log('✅ Admin 비밀번호가 admin123으로 업데이트되었습니다.\n');

    // 2. hero_slides 테이블
    console.log('📍 2. Hero Slides 테이블 마이그레이션 중...');
    const heroSlides = await sqliteAll('SELECT * FROM hero_slides');
    await pgPool.query('DELETE FROM hero_slides');
    for (const slide of heroSlides) {
      await pgPool.query(
        'INSERT INTO hero_slides (id, title, subtitle, description, button_text, background_image, background_color, text_color, order_index, active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [
          slide.id,
          slide.title,
          slide.subtitle,
          slide.description,
          slide.button_text,
          slide.background_image,
          slide.background_color,
          slide.text_color || 'white',
          slide.order_index || 0,
          slide.active === 1,
          slide.created_at || new Date().toISOString(),
          slide.updated_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${heroSlides.length}개의 hero slides가 마이그레이션되었습니다.\n`);

    // 3. menus 테이블
    console.log('📍 3. Menus 테이블 마이그레이션 중...');
    const menus = await sqliteAll('SELECT * FROM menus');
    await pgPool.query('DELETE FROM menus');
    for (const menu of menus) {
      await pgPool.query(
        'INSERT INTO menus (id, name, url, type, parent_id, sort_order, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          menu.id,
          menu.name,
          menu.url,
          menu.type,
          menu.parent_id,
          menu.sort_order || 0,
          menu.is_active === 1,
          menu.created_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${menus.length}개의 메뉴가 마이그레이션되었습니다.\n`);

    // 4. boards 테이블
    console.log('📍 4. Boards 테이블 마이그레이션 중...');
    const boards = await sqliteAll('SELECT * FROM boards');
    await pgPool.query('DELETE FROM boards');
    for (const board of boards) {
      await pgPool.query(
        'INSERT INTO boards (id, name, slug, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          board.id,
          board.name,
          board.slug,
          board.description,
          board.created_at || new Date().toISOString(),
          board.updated_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${boards.length}개의 게시판이 마이그레이션되었습니다.\n`);

    // 5. categories 테이블
    console.log('📍 5. Categories 테이블 마이그레이션 중...');
    const categories = await sqliteAll('SELECT * FROM categories');
    await pgPool.query('DELETE FROM categories');
    for (const category of categories) {
      await pgPool.query(
        'INSERT INTO categories (id, name, board_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
        [
          category.id,
          category.name,
          category.board_id,
          category.created_at || new Date().toISOString(),
          category.updated_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${categories.length}개의 카테고리가 마이그레이션되었습니다.\n`);

    // 6. posts 테이블
    console.log('📍 6. Posts 테이블 마이그레이션 중...');
    const posts = await sqliteAll('SELECT * FROM posts');
    await pgPool.query('DELETE FROM posts');
    for (const post of posts) {
      await pgPool.query(
        'INSERT INTO posts (id, board_id, category_id, title, content, views, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          post.id,
          post.board_id,
          post.category_id,
          post.title,
          post.content,
          post.views || 0,
          post.created_at || new Date().toISOString(),
          post.updated_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${posts.length}개의 게시물이 마이그레이션되었습니다.\n`);

    // 7. history 테이블
    console.log('📍 7. History 테이블 마이그레이션 중...');
    const history = await sqliteAll('SELECT * FROM history');
    await pgPool.query('DELETE FROM history');
    for (const item of history) {
      await pgPool.query(
        'INSERT INTO history (id, year, month, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          item.id,
          item.year,
          item.month,
          item.content,
          item.created_at || new Date().toISOString(),
          item.updated_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${history.length}개의 연혁이 마이그레이션되었습니다.\n`);

    // 8. link_posts 테이블
    console.log('📍 8. Link Posts 테이블 마이그레이션 중...');
    const linkPosts = await sqliteAll('SELECT * FROM link_posts');
    await pgPool.query('DELETE FROM link_posts');
    for (const post of linkPosts) {
      await pgPool.query(
        'INSERT INTO link_posts (id, title, url, image_url, created_at) VALUES ($1, $2, $3, $4, $5)',
        [
          post.id,
          post.title,
          post.url,
          post.image_url,
          post.created_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${linkPosts.length}개의 링크 포스트가 마이그레이션되었습니다.\n`);

    // 9. energy_data 테이블
    console.log('📍 9. Energy Data 테이블 마이그레이션 중...');
    const energyData = await sqliteAll('SELECT * FROM energy_data');
    await pgPool.query('DELETE FROM energy_data');
    for (const data of energyData) {
      await pgPool.query(
        'INSERT INTO energy_data (building_name, year, month, electricity, gas, water, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          data.building_name,
          data.year,
          data.month,
          data.electricity || 0,
          data.gas || 0,
          data.water || 0,
          data.created_at || new Date().toISOString(),
          data.updated_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${energyData.length}개의 에너지 데이터가 마이그레이션되었습니다.\n`);

    // 10. solar_data 테이블
    console.log('📍 10. Solar Data 테이블 마이그레이션 중...');
    const solarData = await sqliteAll('SELECT * FROM solar_data');
    await pgPool.query('DELETE FROM solar_data');
    for (const data of solarData) {
      const location = data.location || data.building_name || 'Unknown Location';
      await pgPool.query(
        'INSERT INTO solar_data (location, building_name, year, month, generation, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          location,
          data.building_name,
          data.year,
          data.month,
          data.generation || 0,
          data.created_at || new Date().toISOString(),
          data.updated_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${solarData.length}개의 태양광 데이터가 마이그레이션되었습니다.\n`);

    // 11. files 테이블
    console.log('📍 11. Files 테이블 마이그레이션 중...');
    const files = await sqliteAll('SELECT * FROM files');
    await pgPool.query('DELETE FROM files');
    for (const file of files) {
      await pgPool.query(
        'INSERT INTO files (id, title, type, url, filename, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          file.id,
          file.title,
          file.type,
          file.url,
          file.filename,
          file.created_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${files.length}개의 파일이 마이그레이션되었습니다.\n`);

    // 12. pages 테이블
    console.log('📍 12. Pages 테이블 마이그레이션 중...');
    const pages = await sqliteAll('SELECT * FROM pages');
    await pgPool.query('DELETE FROM pages');
    for (const page of pages) {
      await pgPool.query(
        'INSERT INTO pages (id, name, slug, path, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          page.id,
          page.name,
          page.slug,
          page.path,
          page.content,
          page.created_at || new Date().toISOString(),
          page.updated_at || new Date().toISOString()
        ]
      );
    }
    console.log(`✅ ${pages.length}개의 페이지가 마이그레이션되었습니다.\n`);

    console.log('🎉 모든 데이터 마이그레이션이 완료되었습니다!');

  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
  } finally {
    await pgPool.end();
    sqliteDb.close();
  }
}

migrateAllData();