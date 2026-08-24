# Paddle Live 전환 체크리스트

## 현재 코드 범위

- 공개 상품 설명·기능·월간/연간 가격 페이지: `/pricing`
- 공개 이용약관: `/terms`
- 공개 환불정책: `/refund`
- 공개 개인정보처리방침: `/privacy`
- 사업자명·대표자·사업자등록번호·주소·전화·이메일 푸터 표시
- Paddle.js Checkout 및 결제 전 자동갱신·약관·환불정책 동의
- 서버 생성 거래 ID를 이용한 Checkout 실행
- Paddle 서명 검증 및 중복 웹훅 방지
- 최초 결제, 갱신, 결제 실패, 해지 상태 동기화

## Sandbox 검증

- [ ] 월간 상품 결제 완료
- [ ] 연간 상품 결제 완료
- [ ] 결제 완료 후 구독 기능 즉시 활성화
- [ ] `transaction.completed` 중복 전송 시 결제 이력 중복 없음
- [ ] `transaction.payment_failed` 수신 시 실패 상태·이력 반영
- [ ] 구독 해지 후 Paddle 구독 상태와 서비스 종료일 동기화
- [ ] 해지 이후 다음 결제 없음
- [ ] 구매 확인 메일·영수증·구독 관리 링크 확인

## Paddle Live 대시보드 작업

- [ ] 사업자·대표자 신원 확인 제출 및 승인
- [ ] `membershipflow.site` 도메인 심사 제출 및 승인
- [ ] 정산 계좌와 세금 정보 등록
- [ ] Live 제품 생성
- [ ] Live 월간·연간 가격 생성
- [ ] Live API key 생성
- [ ] Live client-side token 생성
- [ ] Live webhook destination 생성
- [ ] Live webhook secret 확인
- [ ] 카드 명세서 표시명(statement descriptor) 확인

## Live 환경값 교체

백엔드:

- `PADDLE_API_KEY`
- `PADDLE_API_BASE_URL=https://api.paddle.com`
- `PADDLE_MONTHLY_PRICE_ID`
- `PADDLE_YEARLY_PRICE_ID`
- `PADDLE_WEBHOOK_SECRET`

프론트엔드:

- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- `NEXT_PUBLIC_PADDLE_ENV=production`

Sandbox 키·토큰·가격 ID를 Live 환경에 재사용하지 않는다. 환경값 교체 후 main 이미지 재빌드가 필요하다.

## 배포 후 공개 검증

- [ ] `https://membershipflow.site/pricing` 비로그인 접근
- [ ] `https://membershipflow.site/terms` 비로그인 접근
- [ ] `https://membershipflow.site/refund` 비로그인 접근
- [ ] `https://membershipflow.site/privacy` 비로그인 접근
- [ ] 네 페이지에서 상품·가격·자동갱신·환불·사업자·고객지원 정보 확인
- [ ] HTTPS 인증서와 canonical URL 확인
- [ ] 소액 실제 결제 1건
- [ ] 실제 해지 1건
- [ ] 실제 환불 1건
- [ ] Paddle 대시보드, MembershipFlow DB, 사용자 화면의 상태 일치 확인

## 완료 판단

코드·정책 페이지 배포만으로 Paddle 승인을 보장하지 않는다. Paddle의 사업자·도메인 심사 승인과 Sandbox 전체 결제 흐름 검증을 완료한 뒤 Live 결제를 활성화한다.
