// Node.js 18+ 내장 fetch 사용

// 카테고리 생성 함수
async function createCategory(name, type = 'both', sortOrder = 0) {
  try {
    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        type,
        sort_order: sortOrder
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 카테고리 '${name}' 생성 완료:`, data);
      return data;
    } else {
      const error = await response.json();
      console.error(`❌ 카테고리 '${name}' 생성 실패:`, error);
      return null;
    }
  } catch (error) {
    console.error(`❌ 카테고리 '${name}' 생성 중 오류:`, error);
    return null;
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 카테고리 생성 시작...\n');

  // 갤러리 카테고리 생성
  await createCategory('갤러리', 'both', 1);
  
  // 자료실 카테고리 생성
  await createCategory('자료실', 'file', 2);

  console.log('\n✨ 카테고리 생성 완료!');
}

// 스크립트 실행
main().catch(console.error);