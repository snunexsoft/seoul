-- 타임라인 배경 이미지 테이블
CREATE TABLE IF NOT EXISTS timeline_backgrounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 아이콘 링크 테이블
CREATE TABLE IF NOT EXISTS icon_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 아이콘 링크 데이터 삽입
INSERT OR IGNORE INTO icon_links (name, icon_url, link_url, display_order) VALUES
('온실가스 배출량', '/img/1.png', '/greenhouse-gas', 1),
('온실가스 감축활동', '/img/2.png', '#', 2),
('온실가스 맵', '/img/3.png', '#', 3),
('에너지', '/img/4.png', '/energy', 4),
('태양광 발전', '/img/5.png', '/solar-power', 5),
('전력사용량', '/img/6.png', '#', 6),
('친환경 학생 활동', '/img/8.png', '#', 7),
('그린리더십', '/img/9.png', '#', 8),
('그린레포트', '/img/10.png', '#', 9),
('인포그래픽', '/img/11.png', '/infographic', 10),
('자료실', '/img/12.png', '#', 11),
('지속가능성 보고서', '/img/1.png', '#', 12);

-- 기본 타임라인 배경 이미지 추가
INSERT OR IGNORE INTO timeline_backgrounds (image_url, display_order) VALUES
('/img/a1.jpg', 1),
('/img/a2.jpg', 2),
('/img/a3.jpg', 3),
('/img/a4.jpg', 4),
('/img/a5.jpg', 5),
('/img/a6.jpg', 6),
('/img/a7.jpg', 7),
('/img/a8.jpg', 8),
('/img/a9.jpg', 9);