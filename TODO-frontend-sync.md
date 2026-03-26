# CMS → 프론트엔드 연동 TODO

## 현재 상태 요약
- CMS(관리자)에서 데이터를 입력했지만 공개 페이지에 반영되지 않는 항목 정리
- 프로덕션: https://seoul-pearl.vercel.app
- 레포: snunexsoft/seoul (nextjs-app/)

---

## [P0] 링크게시판 API 수정 — 완료 ✅
- `localhost:10000` → 상대경로 변경 완료 (커밋: b470483)

## [P0] 탄소중립연구자 네트워크 서브메뉴 DB 추가 — 완료 ✅
- 연구자 소개, 연구 프로젝트, 협력 프로그램, 탄소중립 기술, 기후과학 연구

---

## [P1] 페이지 라우트 미구현 (4개) — 미착수
서브메뉴 URL에 해당하는 Next.js 페이지가 없음 → 404
- [ ] `/researcher-network` — 연구자 소개 페이지
- [ ] `/research-projects` — 연구 프로젝트 페이지
- [ ] `/collaboration` — 협력 프로그램 페이지
- [ ] `/climate-research` — 기후과학 연구 페이지

## [P1] carbon-tech 페이지 "링크게시판" x 4 탭 수정 — 미착수
- 현재: 같은 이름 4개 하드코딩
- 수정 필요: 제거 또는 의미있는 탭명으로 변경

## [P2] 게시글 상세/다운로드 라우트 누락 — 미착수
- [ ] `/api/post/:identifier` — 서버에 라우트 없음 (PostView.jsx가 호출)
- [ ] `/api/posts/:id/download` — 서버에 라우트 없음 (첨부파일 다운로드)
- [ ] `/post/:slug` — App.jsx에 라우트 미등록 (BoardView에서 게시글 클릭 시 이동)

## [P2] 인포그래픽 게시판 slug 불일치 — 미착수
- 프론트엔드 코드: `/api/boards/infographic/posts` 호출
- 실제 DB 게시판 slug: `info`
- 확인 필요: 서버에 `/api/boards/infographic/posts` 전용 라우트가 있는지, 아니면 slug 수정 필요

## [P2] 게시판 페이지 연결 확인 — 미착수
CMS 메뉴에 등록된 게시판 URL이 공개 페이지에서 접근 가능한지:
- [ ] `/board/green_campus_group` — 친환경 학생 활동 (2개 게시글)
- [ ] `/board/green-report` — 그린레포트 (8개 게시글)
- [ ] `/board/research` — 지속가능보고서 (0개 게시글)
- [ ] `/board/emission_reduce` — 온실가스 감축활동 (2개 게시글)
- [ ] `/board/info` — 인포그래픽 (3개 게시글)

## [P3] 데이터 부재 항목 — 클라이언트 입력 필요
- [ ] 에너지 데이터 (2025~2026년) — API가 0 반환
- [ ] 온실가스 데이터 — 2023~2024년 일부만 존재
- [ ] research 게시판 — 게시글 0개
- [ ] 링크 게시글 URL — 전부 example.com (테스트 데이터)

## [P3] Header 동적 메뉴 + 캐시 — 참고
- Next.js Header.tsx: DB에서 동적 로딩 (정상)
- localStorage 1시간 캐시 있음
- 메뉴 변경 후 즉시 반영 안 될 수 있음 (캐시 만료 후 반영)
