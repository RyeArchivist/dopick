# DoPick
Cloudflare Pages + D1 기반 프로필 링크용 상품/AI 광고 사이트.

## 포함 기능
- 상품번호/키워드/카테고리 검색
- 쿠팡 파트너스 링크
- 유튜브 쇼츠 연결
- 상품 요청 / AI 광고 제작 문의
- 관리자 상품 등록, 공개/숨김
- 상품번호 자동 증가
- 요청함
- 가격 안내: 첫 제작 1편 무료 / 기본 1편 5만원 / 1+1 2편 6만원

## 배포
1. 이 폴더를 새 GitHub 저장소에 업로드
2. Cloudflare Dashboard > Workers & Pages > Create > Pages > Connect to Git
3. Framework preset: None / Build command 비움 / Output directory: /
4. D1 데이터베이스 `dopick-db` 생성
5. D1 Console에서 `schema.sql` 실행
6. Pages > Settings > Bindings > D1 database binding
   - Variable name: DB
   - Database: dopick-db
7. Pages > Settings > Variables and Secrets
   - ADMIN_KEY = 본인만 아는 긴 비밀번호
8. 관리자 주소: `/admin.html`

## 다음 개선 추천
- 상품 수정/삭제 UI
- 유튜브 링크에서 제목/썸네일 자동 수집 Worker
- 클릭 통계
- 상품 상세 페이지
- 이메일/텔레그램 문의 알림
- 쿠팡 파트너스 고지문 상시 표시
