import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES 모듈에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 데이터베이스 경로
const dbPath = join(__dirname, 'database.db');

console.log('🚀 카테고리 생성 시작...');
console.log('📍 DB 경로:', dbPath);

try {
  const db = new Database(dbPath);
  
  // WAL 모드 설정
  db.pragma('journal_mode = WAL');
  
  console.log('✅ 데이터베이스 연결 성공\n');

  // 기존 카테고리 확인
  const existingCategories = db.prepare('SELECT * FROM categories').all();
  console.log('📋 기존 카테고리:', existingCategories.length ? existingCategories : '없음');
  console.log('');

  // 카테고리 데이터
  const categories = [
    {
      name: '갤러리',
      slug: 'gallery',
      type: 'both',
      sort_order: 1
    },
    {
      name: '자료실',
      slug: 'archive',
      type: 'file',
      sort_order: 2
    }
  ];

  // 카테고리 추가
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO categories (name, slug, type, sort_order, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);

  for (const category of categories) {
    try {
      // 중복 확인
      const existing = db.prepare('SELECT * FROM categories WHERE slug = ?').get(category.slug);
      
      if (existing) {
        console.log(`⚠️  카테고리 '${category.name}' (${category.slug})는 이미 존재합니다`);
      } else {
        const result = insertStmt.run(
          category.name,
          category.slug,
          category.type,
          category.sort_order
        );
        
        if (result.changes > 0) {
          console.log(`✅ 카테고리 '${category.name}' (${category.slug}) 생성 완료`);
        }
      }
    } catch (error) {
      console.error(`❌ 카테고리 '${category.name}' 생성 실패:`, error.message);
    }
  }

  // 최종 카테고리 목록 출력
  console.log('\n📊 전체 카테고리 목록:');
  const allCategories = db.prepare('SELECT * FROM categories ORDER BY sort_order, created_at').all();
  console.table(allCategories.map(cat => ({
    ID: cat.id,
    이름: cat.name,
    슬러그: cat.slug,
    타입: cat.type,
    정렬순서: cat.sort_order
  })));

  db.close();
  console.log('\n✨ 카테고리 생성 작업 완료!');

} catch (error) {
  console.error('❌ 데이터베이스 오류:', error);
  process.exit(1);
}