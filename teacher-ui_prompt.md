# iRead 교수자 UI 디자인·구현 프롬프트

## 문서 목적

이 문서는 현재 `apps/teacher`에 구현된 iRead 교수자용 Vue 애플리케이션을 재현하거나 일관되게 확장하기 위한 기준 프롬프트다. 교수자 UI는 `apps/learner`와 독립된 데스크톱 관리 애플리케이션이다. 학습자 앱의 캐릭터 중심 화면, 아동용 훈련 인터랙션과 `--learner-*` 토큰을 이 프로젝트에 섞지 않는다.

현재 구현을 기준으로 다음 영역을 포함한다.

- 교수자 로그인, 회원가입, 아이디 찾기와 비밀번호 재설정
- 아동 목록 검색·필터·페이지 이동과 등록·수정·삭제
- 사이드바 기반 아동 전환과 기능 탐색
- 학습 현황, 읽기 정확도, 학습 이벤트와 기록·소통
- 아동별 커리큘럼, 다음 회차 편집과 교안 미리보기
- 훈련 이력, 읽기 속도, 검사 비교와 시선 분석
- 보고서 생성, 버전 관리, 발행과 공유 링크 관리
- 보호자용 공유 보고서 열람과 피드백
- 교수자 프로필 관리

### 현행 구현 기준

- 앱은 Vue 3, TypeScript, Vite와 Vue Router로 구성되어 있다.
- 공통 UI는 `src/components/ui`의 Button, Card, Input, Select, Table, Tabs, Dialog, DropdownMenu 등의 primitive를 사용한다.
- 이 UI primitive 체계는 Tailwind CSS 4, Reka UI, class-variance-authority와 tailwind-merge를 기반으로 한다.
- 데이터 시각화는 모듈 방식 ECharts와 공통 `ChartPanel`을 사용한다.
- 화면 데이터, 로그인, 저장, 발행과 공유는 현재 `mockData.ts` 및 로컬 상태로 동작하는 목업이다.
- 일부 라우트는 아동 ID별 데이터를 사용하지만 훈련·검사·수정 화면의 일부 값은 공통 데모 데이터를 사용한다. 실제 서버 연동이 완료된 것으로 표현하지 않는다.
- 코드의 타입과 파일명에는 `Student*`가 남아 있지만 현재 사용자에게 보이는 용어는 일관되게 `아동`을 사용한다.

---

## Domain Context

### 서비스 도메인

iRead 교수자 UI는 읽기 교육과 학습 중재를 수행하는 교수자·교사를 위한 아동 관리 및 교육 데이터 대시보드다. EdTech 관리 도구, 읽기 학습 분석, 시선 추적 분석과 보호자 커뮤니케이션 UX 패턴을 결합한다.

### 핵심 사용자

- 여러 아동의 읽기 상태와 최근 참여를 관리하는 교수자
- 진단·훈련 결과와 시선 데이터를 근거로 다음 커리큘럼을 판단하는 사용자
- 아동별 교안을 수정하고 다음 회차의 훈련 순서와 횟수를 정하는 사용자
- 보호자 의견과 아동에게 전달할 응원을 검토하는 사용자
- 보고서를 발행하고 공유 링크의 열람·만료·폐기 상태를 관리하는 사용자

### 도메인 UX 인사이트

1. 첫 화면에서 아동의 현재 학습, 최근 학습일, 주간 참여 상태와 누적 시간을 비교할 수 있어야 한다.
2. 아동을 바꾸더라도 같은 업무 화면을 유지해 비교와 연속 작업이 가능해야 한다.
3. 읽기 정확도, 속도와 시선 정보는 기간·단위·판단 근거를 함께 보여 줘야 한다.
4. 교수자 내부 메모, 보호자 의견, 아동 전달 응원의 공개 범위를 명확히 구분해야 한다.
5. AI 추천 커리큘럼은 근거와 편집 수단을 제공하되 최종 결정은 교수자가 수행해야 한다.
6. 저장, 삭제, 발행, 링크 폐기와 재발급처럼 영향이 큰 행동은 결과와 범위를 확인시켜야 한다.
7. 보호자에게 공유되는 보고서는 교수자 편집 화면과 분리된 읽기 전용 경험이어야 한다.

### 신뢰 신호

- 현재 아동의 이름, 학교와 나이를 사이드바에서 지속적으로 표시
- 차트의 기간, 단위, 범례, 목표선과 비교 기준
- 학습 이벤트의 발생 맥락, 시스템 대응, 확인 상태와 후속 지도 상태
- `교수자만 확인`, `아동에게 전달`, `보호자에게 공유` 라벨
- 보고서의 버전, 발행 시점, 링크 만료일, 최초·최근 열람과 폐기 상태
- 저장 완료 토스트와 파괴적 행동 확인 대화상자
- 보호자 공유 링크의 마스킹 표시와 인증·열람 기록

### 차별점

일반적인 출결·성적 중심 관리 도구와 달리 iRead 교수자 UI는 음운 인식, 파닉스, 유창성, 어휘와 이해력의 변화에 읽기 속도와 시선 체류·되돌아보기 정보를 결합한다. 학습 이벤트, 다음 커리큘럼, 아동 응원과 보호자 보고서를 한 아동의 연속된 지도 흐름으로 연결한다.

---

## User Journey

### 전체 여정

```text
[로그인 또는 계정 복구]
  → [아동 목록 검색·필터]
  → [확인이 필요한 아동 선택]
  → [학습 현황·이벤트·시선 데이터 판단]
  → [커리큘럼·교안·훈련/검사 이력 검토]
  → [내부 메모·아동 응원·보호자 메시지 처리]
  → [보고서 초안 생성·발행]
  → [공유 링크 생성·열람 상태 관리]
  → [보호자 피드백 확인]
```

### 1. 인증과 계정 복구

- User Goal: 교수자 계정으로 로그인하거나 계정 정보를 복구한다.
- Key Info: 아이디, 비밀번호, 비밀번호 보기, 회원가입, 아이디 찾기, 비밀번호 찾기.
- Current Flow:
  - `/login`에서 로그인하면 목업 대시보드로 이동한다.
  - `/signup`은 계정 정보와 교수자 정보를 구분하고 비밀번호 일치 여부를 검사한다.
  - `/find-id`는 이름·이메일 확인 후 마스킹된 아이디를 보여 준다.
  - `/reset-password`는 본인 확인 → 새 비밀번호 설정 → 완료의 단계 흐름을 제공한다.
- Friction: 실제 인증 성공으로 오해하거나 복구 단계에서 현재 상태를 잃는 것.
- Design Solution: 목업 상태를 과장하지 않고 단계 제목, 진행 표시, 오류와 완료 행동을 명확히 한다.

### 2. 아동 목록 탐색

- User Goal: 담당 아동을 찾고 주의가 필요한 대상을 빠르게 선택한다.
- Key Info: 아동, 현재 학습, 최근 학습, 이번 주 상태, 누적 학습, 관리 메뉴.
- Current Flow:
  - 이름 또는 학교 검색
  - 6~12세 나이 필터
  - 전체 기간, 최근 7일, 최근 30일 필터
  - 전체 아동, 검색 결과, 확인 필요 인원 요약
  - 주간 참여율 50% 미만을 `확인 필요`로 표시
  - 10명 단위 페이지 이동
- Design Solution: 요약 카드와 데이터 표를 분리하고 행 전체가 아닌 아동 셀과 명시적 관리 메뉴를 행동 진입점으로 사용한다.

### 3. 사이드바에서 아동 전환

- User Goal: 현재 업무를 유지한 채 다른 아동으로 빠르게 전환한다.
- Key Info: 현재 아동 이름, 나이, 학교, 최근 본 아동, 전체 아동, 검색.
- Current Flow: 아동 관련 라우트에서 다른 아동을 선택하면 현재 라우트 이름을 유지한 채 `:id`만 바꾼다.
- Friction: 아동을 바꾼 뒤 다른 기능으로 이동하거나 이전 아동 데이터가 남는 것.
- Design Solution: 224px 고정 사이드바의 `StudentSwitcher`가 현재 아동과 전환을 담당하고, 각 View는 라우트 ID를 기준으로 데이터를 다시 계산한다.

### 4. 학습 현황 판단

- User Goal: 최근 변화와 확인할 작업을 한 화면에서 파악한다.
- Key Info:
  - 현재 단계와 최근 학습일
  - 확인할 학습 이벤트, 읽지 않은 보호자 의견, 승인 대기 응원
  - 최근 읽기 정확도, 목표 80%, 훈련 변경과 교사 메모 지점
  - 변화 해석과 다음 권장 훈련
  - 최근 학습 기록과 시스템 이벤트
- Design Solution: 상단 사실 요약 → 분석 차트와 해석 → 최근 이벤트 → 기록과 소통 순으로 판단 흐름을 구성한다.

### 5. 기록과 소통

- User Goal: 내부 기록, 아동 응원과 보호자 메시지를 공개 범위에 맞게 처리한다.
- Current Tabs:
  - 교수자 내부 메모
  - 아동에게 전할 응원
  - 보호자 메시지
- Key Actions:
  - 이벤트와 보호자 의견을 내부 메모 초안에 추가
  - 내부 메모 작성·수정
  - 응원을 즉시 전달하거나 다음 로그인에 예약
  - 예약된 교수자 응원 수정·삭제
  - 보호자 의견 읽음 처리
  - 보호자 응원 문구 수정, 승인 및 전달 예약, 보류 사유 기록
- Safety: 작성 중 다른 탭으로 이동할 때 확인 대화상자를 표시하고 초안은 아동별로 유지한다.

### 6. 커리큘럼과 교안 관리

- User Goal: 전체 훈련에서 다음 회차 훈련을 고르고 순서·횟수·자료를 편집한다.
- Key Info:
  - 전체 훈련 목록과 달성률
  - 선택한 훈련의 상태와 추천 여부
  - 다음 회차 순서와 시행 횟수
  - 아동별 교안과 아동 화면 미리보기
- Current Flow:
  - 훈련 선택
  - 다음 회차에 추가하거나 기존 횟수 1회 증가
  - 수정 모드에서 드래그 순서 변경, 횟수 증감과 삭제
  - 교안 Dialog에서 훈련명, 영역, 낱말·문장·질문 자료, 정답과 힌트 편집
  - 자료 재정렬, 추가·삭제와 아동 화면 미리보기
  - 저장되지 않은 교안 변경을 닫을 때 취소 확인

### 7. 훈련 이력과 시선 분석

- User Goal: 훈련별 결과와 읽기 속도, 어려움이 나타난 구간을 검토한다.
- Key Info:
  - 훈련 기록의 학습일, 커리큘럼, 결과와 학습 판단
  - 읽기 속도 추이와 기간 시작 대비 변화
  - 선택 훈련의 요약과 활동별 정확도
  - 평균 시선 체류, 되돌아보기, 읽기 이탈과 구간별 강도
- Current Actions: 훈련 선택, 기간 표시, CSV와 JSON 원시 데이터 다운로드.
- Current Limitation: 기간 선택과 상세 수치는 목업 데이터이며 서버 조회 결과가 아니다.

### 8. 테스트 이력 비교

- User Goal: 선택 검사와 최대 2개의 비교 검사를 함께 보고 내부 해석을 기록한다.
- Key Info:
  - 시선 고정, 시선 도약, 읽기 속도, 정답률, 풀이 속도와 유창성
  - 선택·비교 검사와 검사 평균
  - 종합 점수, 강점, 보완 영역, 권장 과정과 다음 검사
  - 선택 검사 시선 분석
- Current Actions: 검사 날짜 선택, 비교 검사 추가, 해석 메모 저장.
- Design Solution: 막대와 평균선을 함께 사용하고 교수자 전용 메모의 공개 범위를 명시한다.

### 9. 보고서 생성·발행·공유

- User Goal: 기존 보고서를 찾거나 새 보고서를 만들어 보호자에게 안전하게 공유한다.
- Current State Flow:

```text
setting
  → draft
  → published
  → shared
  → share-ended
```

- Setting: 저장된 보고서 검색, 버전·기간·상태 확인, 새 보고서와 조회 기간 설정.
- Draft: 900px 문서 미리보기, 교수자 의견 편집, 내부 메모 불러오기, 임시 저장과 발행.
- Published: 내용과 버전을 고정하고 공유 만료일을 설정한다.
- Shared: 마스킹된 링크, 복사, 보호자 화면 보기, 공유 현황과 링크 관리.
- Link Management: 재발급 시 기존 링크 폐기, 링크 폐기, 공유 이력 보존.
- New Draft: 현재 공유 링크와 보고서 버전을 덮어쓰지 않고 새 버전을 만든다.
- Print: 사이드바와 조작 UI를 숨기고 보고서 문서만 인쇄·PDF 저장한다.

### 10. 보호자 공유 보고서

- User Goal: 전달받은 링크로 보고서를 읽고 교수자에게 피드백을 보낸다.
- Route: `/shared-report/:token`
- Key Info:
  - 보고서 버전, 기간, 공유 기한과 코드
  - 아동 정보, 학습 요약, 영역별 변화와 시선 분석
  - 교수자 의견
  - 최대 500자의 보호자 피드백
- Current Flow: 데모 token에 따라 보고서 버전을 표시하고 피드백 전달을 로컬 비동기 상태로 시뮬레이션한다.
- Boundary: 이 화면은 `TeacherLayout` 밖에 있으며 교수자 사이드바나 편집 도구를 표시하지 않는다.

### 11. 아동·교수자 정보 관리

- User Goal: 아동, 보호자와 교수자 프로필 정보를 정확히 관리한다.
- Current Flow:
  - `StudentForm`을 등록·수정 화면에서 재사용
  - 아동 사진, 이름, 생년월일, 성별, 연락처와 학교
  - 보호자 이름, 관계, 연락처, 이메일과 주소
  - 필수값과 변경 여부에 따른 저장 버튼 활성화
  - 수정 화면의 위험 영역과 삭제 확인
  - 교수자 사진, 소속, 성별, 이메일, 연락처와 주소 관리
- Current Limitation: 저장 결과와 삭제는 로컬 목업 상태 및 화면 이동으로 표현된다.

---

## Emotional Direction

### 감정 비율

- 55% Professional: 구조적인 사이드바, 표, 카드, 차트와 문서
- 30% Trust: 공개 범위, 버전, 저장·발행·공유 상태의 명확성
- 10% Calm: 밝은 배경, 얇은 테두리, 절제된 그림자와 넉넉한 섹션 간격
- 5% Warmth: 아동과 보호자를 존중하는 용어와 안내 문구

### 시각적 해석

- 밝은 `--content-background` 위에 흰색 Card를 배치한다.
- 주요 행동과 선택은 블루 계열 primary, 정상은 그린, 검토 필요는 앰버, 파괴적 행동은 레드로 표현한다.
- 카드 그림자는 거의 평면에 가까운 `0 1px 2px` 수준으로 유지한다.
- 아동용 캐릭터, 둥근 장식 글꼴, 하늘 배경과 큰 바운스 모션을 사용하지 않는다.
- 수치에는 tabular figures를 적용해 열과 비교 값이 안정적으로 정렬되게 한다.
- 페이지마다 `PageHeader`로 제목과 설명을 제공하되 별도의 전역 상단 헤더를 추가하지 않는다.

### 문구 톤

- 사용자에게 보이는 대상 명칭은 `학생`이 아니라 `아동`으로 통일한다.
- 데이터에는 기간, 단위와 비교 기준을 함께 쓴다.
- 내부 상태와 외부 공유 결과를 단정적으로 섞지 않는다.
- 권장: “확인 필요”, “교수자만 확인”, “다음 로그인 전달로 예약”, “링크 폐기”
- 지양: “AI가 결정했습니다”, “공유되었습니다”처럼 실제 외부 처리가 완료된 것으로 오해되는 목업 문구

---

## Design Specifications

### Identity

```text
Service Name: iRead Teacher
One-liner: 읽기 변화와 시선을 근거로 다음 학습을 설계하는 교수자 도구
Category: 교육 데이터 대시보드 · 아동 관리 · 읽기 중재
Positioning: 학습 변화, 시선 분석, 커리큘럼, 소통과 보고서를 한 아동 맥락으로 연결
Primary Goal: 교수자가 확인할 이슈를 판단하고 다음 학습을 편집한다.
Secondary Goal: 아동·보호자 메시지와 보고서 공유 수명주기를 안전하게 관리한다.
Brand Personality: 전문적인, 신뢰할 수 있는, 배려 깊은
```

### Design System

#### Token Architecture

`apps/teacher/src/assets/main.css`의 현재 토큰과 `src/components/ui`의 `data-slot` 기반 스타일을 단일 기준으로 사용한다. 유사한 Hex 색상이나 별도 버튼 체계를 새로 만들지 않는다.

```text
Primary:            oklch(0.6723 0.1606 244.995)
Primary Dark:       oklch(0.57 0.165 245)
Foreground:         oklch(0.1884 0.0128 248.51)
Muted Foreground:   oklch(0.5 0.012 248.51)
Border/Input:       oklch(0.9317 0.0118 231.659)
Content Background: #F7F9FA
Card/Sidebar:       oklch(1 0 0)
Success:            oklch(0.7064 0.1822 151.712)
Warning:            oklch(0.8214 0.16 82.5337)
Destructive:        oklch(0.6188 0.2376 25.7658)
Active Selection:   primary 10% + white
```

#### Chart Palette

`src/features/teacher/chartTheme.ts`의 `iread-twitter` 테마를 사용한다.

```text
Blue:      #1D9BF0
Green:     #00BA7C
Amber:     #F59E0B
Red:       #F4212E
Ink:       #0F1419
Secondary: #536471
Muted:     #8899A6
Grid:      #EFF3F4
Border:    #CFD9DE
```

차트마다 새로운 팔레트를 만들지 않고 blue, green, amber, red의 의미를 유지한다.

#### Typography

```text
Font: Pretendard Variable, Pretendard, system-ui, sans-serif
Base: 14px / line-height 1.5
Page Title: 24px / weight 700
Section Title: 약 17px / weight 700
Body: 14px / weight 400
Control/Label: weight 600
Numeric: font-variant-numeric: tabular-nums
Heading Letter Spacing: -0.025em
Body Letter Spacing: -0.01em
```

#### Spacing and Layout

```text
Desktop Minimum: 1180px
Shell Columns: 224px sidebar + minmax(0, 1fr)
Sidebar: sticky, 100vh
Content Padding: 28px 36px 48px
Page Section Gap: 24px
Surface Header Padding: 20px 24px
Control Height: 약 40px
Small Control Height: 약 34px
Radius: 8px / 10px / 14px
Card Shadow: 0 1px 2px oklch(0.1884 0.0128 248.51 / 0.06)
Report Preview Base Width: 900px
```

- 현재 UI는 데스크톱 우선이며 `html`과 `body`에 `min-width: 1180px`을 사용한다.
- 작은 화면을 임의로 모바일 카드 UI로 바꾸지 않고 현재는 가로 스크롤로 구조를 보존한다.
- 모바일 지원은 사이드바, 표, 차트, 교안 Dialog와 보고서 미리보기를 함께 재설계하는 별도 범위다.

#### Component Style

```text
Button: UI primitive의 default/outline/secondary/ghost/link/destructive variant
Card: 흰색 표면, 얇은 border, 10px 전후 radius, 매우 약한 shadow
Input/Textarea: 보이는 Label, focus ring, validation/disabled 상태
Select/Dropdown: Reka UI 기반 overlay, keyboard navigation
Table: 명시적 header, row hover, 빈 결과 행, action dropdown
Tabs: 기록과 소통처럼 같은 문맥의 뷰 전환에만 사용
Dialog: 교안 편집과 확인 작업, focus 관리, 취소 경고
Badge: 검토·전달·발행·공유 상태
Toast: 로컬 저장·처리 결과의 짧은 피드백
```

---

## Key Components

### Authentication and Recovery

- Purpose: 로그인, 가입과 계정 복구의 진입 경험을 제공한다.
- Views: `TeacherLoginView`, `TeacherSignupView`, `TeacherFindIdView`, `TeacherResetPasswordView`.
- States: Default, focus, password visible, validation error, step active/complete, result.
- Rule: 인증 화면은 교수자 사이드바 밖에 있고 실제 인증 서버가 연결된 것으로 표현하지 않는다.

### Teacher Shell and Sidebar

- Purpose: 전역 탐색, 현재 아동 전환과 교수자 계정 행동을 한 위치에 유지한다.
- Structure: `TeacherLayout`은 `TeacherSidebar`와 `teacher-content`의 2열 Grid다.
- Contents:
  - iRead 브랜드
  - `StudentSwitcher`
  - 아동 목록, 학습 현황, 커리큘럼 관리, 훈련 이력, 테스트 이력, 보고서, 아동 정보 관리
  - 교수자 프로필과 로그아웃
- States: Active route, switcher open, search/no result, current/recent/all child, profile hover/focus.
- Rule: 현재 활성 UI에는 전역 `TeacherHeader`와 상단 `StudentTabs`를 추가하지 않는다. 각 View의 `PageHeader`와 사이드바가 위치 정보를 담당한다.

### Child List Dashboard

- Purpose: 담당 아동을 비교하고 상세·수정·삭제 행동으로 진입한다.
- Contents: 검색, 나이/기간 Select, 전체/검색/확인 필요 요약, 6열 데이터 Table, DropdownMenu, 페이지 이동.
- States: Populated, filtered, no result, dropdown open, delete confirm, first/middle/last page.
- Rule: `확인 필요`는 현재 목업에서 주간 참여율 50% 미만 기준이다.

### Child Context Switcher

- Purpose: 같은 기능 위치를 유지하면서 아동을 변경한다.
- Contents: 현재 아동, 검색, 최근 본 아동 최대 5명, 전체 아동, 목록 관리 링크.
- States: Closed, open, searching, no result, current disabled, outside click/Escape close.
- Rule: 아동 관련 라우트 이름을 유지한 채 ID를 변경한다.

### Learning Overview

- Purpose: 최근 변화, 확인할 작업과 다음 권장 행동을 연결한다.
- Contents: 현재 단계, 최근 학습, action count, 정확도 차트, 목표선, 이벤트 marker, 변화 해석, 권장 훈련, 최근 기록.
- States: Action required, all reviewed, event detail, event reviewed, add-to-note, toast.

### Learning Events

- Purpose: 발음 교정, 음성 인식 어려움, 기기·통신 오류, 안전 제한과 생성 실패를 검토한다.
- States: Needs review, reviewed, follow-up needed.
- Contents: 이야기·장면, 재시도, 최종 성공, fallback 사용, 학습 완료/이탈과 시스템 대응.
- Actions: 확인 완료, 내부 메모에 추가.

### Communication Panel

- Purpose: 내부 메모, 아동 응원과 보호자 메시지를 공개 범위별로 처리한다.
- States:
  - Panel: loading, ready, error
  - Note: empty, draft, editing, saving
  - Encouragement: pending approval, scheduled, delivered, seen by child, on hold, archived
  - Guardian comment: unread, read, archived
- Rule: `source`, `audience`, `status`를 별도 데이터로 유지하고 UI 라벨로 함께 표시한다.

### Curriculum Workspace

- Purpose: 전체 훈련을 검토하고 다음 회차 순서와 횟수를 편집한다.
- Contents: 전체 훈련 목록, 선택한 훈련 상세, 달성 판단, 다음 회차 목록, 저장 상태.
- States: Selected, recommended, edit mode, dragging, count changed, remove confirm, dirty, saved, empty.
- Rule: 수정 모드가 아닐 때 재정렬과 삭제 컨트롤을 노출하지 않는다.

### Lesson Material Editor

- Purpose: 아동별 훈련 자료를 Dialog 안에서 편집하고 아동 화면을 미리 본다.
- Contents:
  - 훈련명과 영역
  - 낱말·읽기 문장·질문 자료
  - 표시 문구, 내용, 정답과 힌트
  - 자료 추가·삭제·순서 이동
  - 아동 안내와 페이지 미리보기
- States: Open, clean, dirty, empty material, selected page, discard confirm.
- Rule: 저장되지 않은 변경이 있을 때 Dialog를 바로 닫지 않는다.

### Training History

- Purpose: 훈련별 결과와 읽기 속도, 활동별 정확도와 시선을 검토한다.
- Contents: 기록 목록, 읽기 속도 선 차트, 선택 훈련 상세, CSV/JSON 다운로드, `GazeAnalysisPanel`.
- States: Session selected, period selected, download action.
- Current Boundary: 데이터와 기간 조회는 목업이며 다운로드 파일도 선택한 데모 세션에서 생성한다.

### Test History

- Purpose: 선택 검사와 비교 검사 결과를 분석하고 내부 메모를 저장한다.
- Contents: 최대 2개 비교 검사, grouped bar + average line 차트, 종합 요약, 시선 분석, 내부 메모.
- States: One comparison, two comparisons, add disabled, comment dirty/saved.

### Gaze Analysis Panel

- Purpose: 시선 체류, 되돌아보기와 이탈을 교수자 판단 정보로 요약한다.
- Used In: 훈련 이력, 테스트 이력, 교수자 보고서와 보호자 공유 보고서.
- Contents: 3개 지표, 문장 구간별 강도, 확인 필요 구간과 지도 인사이트.
- Variants: Default, compact.
- Rule: 현재 데이터는 정적인 데모 분석임을 실제 추적 결과처럼 과장하지 않는다.

### Report Workspace

- Purpose: 저장된 보고서 검색부터 새 버전의 발행·공유 종료까지 관리한다.
- States: Setting, draft, published, shared, share-ended, busy action.
- Contents:
  - 저장된 보고서 검색과 상태 Badge
  - 조회 기간과 포함 내용
  - 900px 기준 자동 축소 미리보기
  - 학습 요약, 영역별 변화, 차트, 최근 훈련, 시선 분석, 교수자 의견
  - 임시 저장, 발행, 새 초안, 만료일, 링크 생성·복사·재발급·폐기
  - 버전, 발행 시점, 최초/최근 열람, 보호자 의견, PDF 저장과 인증 기록
- Rules:
  - 발행하면 해당 버전의 내용을 고정한다.
  - 새 초안은 기존 공유 버전을 덮어쓰지 않는다.
  - 링크 재발급은 기존 링크를 폐기하고 이력을 보존한다.
  - 파괴적 링크 행동은 `ConfirmDialog`로 확인한다.

### Guardian Shared Report

- Purpose: 보호자가 편집 도구 없이 공유된 학습 결과를 읽고 의견을 전달한다.
- Contents: 공유 안내, 버전, 기간, 요약, 영역 변화, 시선 분석, 교수자 의견, 500자 피드백.
- States: Verified mock badge, feedback empty, sending, submitted, write another.
- Rule: `TeacherLayout`과 교수자 내부 메모·관리 행동을 절대 노출하지 않는다.

### Child and Teacher Forms

- Purpose: 아동·보호자·교수자 정보를 일관되게 편집한다.
- Shared Components: `StudentForm`, `SettingsSection`, `ProfileImageEditor`, `FormActions`.
- States: Pristine, dirty, required incomplete, savable, saved, delete confirm.
- Rule: 폼의 변경 여부와 필수 입력을 함께 만족할 때 저장을 활성화한다.

### Common and UI Primitives

- `ChartPanel`: 모듈 ECharts, `iread-twitter` 테마, ResizeObserver, option watch와 dispose.
- `ConfirmDialog`: primary/danger 확인 행동.
- `SaveToast`: inline 또는 floating 결과 알림.
- `src/components/ui`: Button, Card, Badge, Input, Label, Select, Table, Tabs, Dialog, DropdownMenu, Textarea 등.
- Rule: 새 화면은 자체 버튼·입력·카드 구현보다 기존 primitive와 variant를 우선 재사용한다.

---

## Interactions

### Motion Direction

업무 상태를 설명하는 짧은 전환만 사용한다. 아동용 UI의 큰 바운스, 캐릭터 축하와 장식 모션을 가져오지 않는다.

```text
Button/Control Feedback: 160ms ease
Dialog/Popover: 180~250ms ease-out
Toast: 약 200ms ease-out
Chart Initial/Update: 180ms cubicOut
Report Mock Async Action: 420ms
Reduced Motion: 비필수 transition과 chart animation 제거
```

### Interaction Specifications

#### 아동 전환

```text
Trigger: StudentSwitcher에서 다른 아동 선택
Action: 현재 아동 관련 route name을 유지하고 :id 변경
Feedback: popover 닫기, 새 아동 정보 반영
Purpose: 업무 문맥을 유지한 빠른 비교
```

#### 확인할 이벤트 처리

```text
Trigger: 학습 이벤트 확인 완료 또는 메모 추가
Action: 상태 변경 또는 내부 메모 초안 생성
Feedback: SaveToast와 action count 갱신
Purpose: 미처리 작업을 추적 가능한 지도 기록으로 전환
```

#### 커리큘럼 재정렬

```text
Trigger: 수정 모드에서 훈련 drag
Action: 다음 회차 배열 순서 변경
Feedback: drag elevation, 삽입 위치, dirty 상태
Purpose: 교수자가 추천 순서를 직접 조정
```

#### 저장

```text
Trigger: 유효한 변경 사항 저장
Action: 로컬 snapshot 또는 mock 상태 갱신
Feedback: 버튼 비활성화와 SaveToast
Purpose: 목업 안에서도 변경 결과를 명확히 확인
```

#### 보고서 상태 전환

```text
Trigger: 생성, 발행, 링크 생성, 재발급 또는 폐기
Action: setting → draft → published → shared → share-ended
Feedback: 상태 제목, 버튼 집합, 버전과 공유 현황 변경
Purpose: 보고서와 링크 수명주기를 실수 없이 관리
```

#### 파괴적 행동

```text
Trigger: 아동 삭제, 추천 훈련 삭제, 편집 취소, 링크 폐기/재발급
Action: ConfirmDialog 표시
Feedback: 대상과 결과를 구체적으로 설명
Purpose: 되돌리기 어려운 목업 행동의 오조작 방지
```

#### 보호자 피드백

```text
Trigger: 1~500자 의견 제출
Action: 420ms 로컬 비동기 처리
Feedback: 전달 중 버튼과 완료 메시지
Purpose: 보호자 의견이 교수자에게 전달되는 흐름 시연
```

---

## Accessibility and Data Communication Rules

- 사용자에게 보이는 용어는 `아동`으로 통일하되 기존 `Student*` 코드 이름은 호환성을 위해 무리하게 일괄 변경하지 않는다.
- 클릭 동작은 Button, 이동은 RouterLink 또는 링크를 사용한다.
- 모든 입력에 보이는 Label을 연결하고 placeholder를 label 대용으로 쓰지 않는다.
- Select, DropdownMenu, Tabs와 Dialog는 기존 Reka UI 기반 primitive의 키보드 동작을 보존한다.
- `focus-visible`은 ring 토큰을 사용해 명확히 표시한다.
- Table은 열 제목과 데이터 관계를 유지하고 빈 결과를 하나의 명시적 행으로 보여 준다.
- 차트에는 `role="img"`와 내용을 설명하는 `aria-label`을 제공하고 기간·단위·요약 문구를 함께 둔다.
- 색만으로 검토 필요, 전달, 발행과 공유 상태를 구분하지 않고 Badge와 문구를 함께 사용한다.
- Dialog는 열릴 때 포커스를 내부로 이동하고 닫힌 뒤 호출 요소로 복귀시킨다.
- 내부 메모, 보호자 공유와 아동 전달의 audience를 데이터와 화면에서 함께 구분한다.
- 공유 링크 전체 값은 관리 목적 이외에 그대로 노출하지 않고 화면에는 마스킹된 주소를 사용한다.
- 인쇄 시 사이드바, 버튼과 편집 컨트롤을 숨기고 문서의 정보 순서를 유지한다.
- `prefers-reduced-motion`에서 비필수 모션을 줄인다.

---

## Implementation Prompt

아래 블록을 AI 웹 개발 도구에 그대로 전달할 수 있다.

```text
기존 저장소의 apps/teacher Vue 애플리케이션을 현재 구현과 디자인 시스템에 맞게 수정하거나 확장해 주세요.

[기술과 프로젝트 경계]
- Vue 3 Composition API, <script setup lang="ts">, TypeScript, Vite와 현재 Vue Router 구성을 유지하세요.
- Tailwind CSS 4, Reka UI, class-variance-authority 기반의 src/components/ui primitive를 우선 재사용하세요.
- 차트는 모듈 ECharts와 공통 ChartPanel, iread-twitter chart theme를 사용하세요.
- layouts, views, components/common, components/teacher, components/ui, features/teacher/types.ts와 mockData.ts 구조를 보존하세요.
- apps/learner의 라우트, 캐릭터, --learner-* 토큰과 의존성을 합치지 마세요.
- 실제 API, 인증, 저장 또는 외부 공유가 연결된 것처럼 가장하지 마세요. 현재는 mockData와 로컬 상태 기반 목업입니다.
- 사용자에게 보이는 용어는 “아동”으로 통일하고 기존 Student* 파일명과 타입은 호환성을 위해 유지할 수 있습니다.

[필수 라우트]
- /login: 교수자 로그인, 비밀번호 보기, 계정 복구 링크
- /signup: 계정 정보와 교수자 정보 회원가입
- /find-id: 이름·이메일 확인과 마스킹 아이디 결과
- /reset-password: 본인 확인→새 비밀번호→완료
- /shared-report/:token: TeacherLayout 밖의 보호자용 보고서와 피드백
- /teacher/dashboard: 아동 목록, 검색, 나이/기간 필터, 요약, 표, 페이지 이동
- /teacher/students/new: 아동·보호자 정보 등록
- /teacher/students/:id/edit: 아동 정보 수정과 삭제 위험 영역
- /teacher/students/:id: 학습 현황, 이벤트, 차트, 기록과 소통
- /teacher/students/:id/curriculum: 훈련 선택, 다음 회차, 횟수, 교안 편집
- /teacher/students/:id/training-history: 훈련 결과, 속도, 다운로드와 시선 분석
- /teacher/students/:id/test-history: 검사 비교, 시선 분석과 내부 메모
- /teacher/students/:id/report: 보고서 설정, 버전, 발행과 링크 관리
- /teacher/settings: 교수자 사진, 기본 정보와 연락처

[전역 구조]
- TeacherLayout은 224px sticky TeacherSidebar와 main content의 2열 Grid로 유지하세요.
- main content padding은 28px 36px 48px, 페이지 section gap은 24px을 기준으로 하세요.
- TeacherSidebar 안에서 현재 아동 전환, 7개 아동 관리 메뉴, 교수자 프로필과 로그아웃을 제공합니다.
- 아동 전환 시 현재 아동 관련 route name을 유지하고 :id만 변경하세요.
- 현재 활성 화면에는 별도의 전역 TeacherHeader나 상단 StudentTabs를 추가하지 마세요.
- 각 페이지 제목과 설명은 PageHeader에서 제공합니다.
- 최소 폭 1180px의 데스크톱 정책을 유지하세요.

[디자인 시스템]
- main.css의 OKLCH semantic token과 Tailwind theme mapping을 사용하세요.
- primary oklch(0.6723 0.1606 244.995), content background #F7F9FA, white card, 얇은 border를 기준으로 하세요.
- Pretendard Variable, 14px base, tabular numeric, 24px page title을 유지하세요.
- radius 8/10/14px과 0 1px 2px의 절제된 card shadow를 사용하세요.
- Button, Card, Input, Label, Select, Table, Tabs, Dialog, DropdownMenu, Badge, Textarea는 components/ui에서 가져오세요.
- 학습자 앱의 둥근 장식 글꼴, 캐릭터, 하늘 배경과 바운스 모션을 사용하지 마세요.

[현재 기능과 상태]
- 대시보드는 이름/학교 검색, 나이 6~12세, 최근 7/30일 필터, 주간 참여율 50% 미만 확인 필요, 10명 페이지 이동을 지원합니다.
- StudentSwitcher는 검색, 최근 본 아동, 전체 아동과 Escape/외부 클릭 닫기를 지원합니다.
- 학습 현황은 action count, 읽기 정확도, 목표선, 이벤트 marker, 변화 해석, 권장 훈련과 최근 기록을 연결합니다.
- 기록과 소통은 교수자 내부 메모, 아동 응원, 보호자 메시지의 source/audience/status를 구분합니다.
- 커리큘럼은 아동별 데이터, 다음 회차 추가, 수정 모드 재정렬, 횟수 조절, 삭제와 교안 Dialog를 지원합니다.
- 훈련 이력은 선택 세션, 속도 차트, 활동별 정확도, CSV/JSON 다운로드와 시선 분석을 포함합니다.
- 테스트 이력은 선택 검사, 최대 2개 비교 검사, 평균선, 시선 분석과 교수자 전용 메모를 포함합니다.
- 보고서는 setting/draft/published/shared/share-ended 상태를 유지합니다.
- 보고서 새 초안은 기존 공유 버전을 덮어쓰지 않고 링크 재발급은 기존 링크를 폐기합니다.
- 보호자 공유 화면은 요약, 영역 변화, 시선 분석, 교수자 의견과 500자 피드백을 제공합니다.

[목업 경계]
- 로그인과 계정 복구는 화면 흐름 시뮬레이션입니다.
- 일부 View의 날짜·차트·시선 수치는 정적 데모 데이터입니다.
- 저장, 발행, 공유, 피드백은 로컬 상태와 짧은 지연으로 시뮬레이션합니다.
- 공유 Badge나 인증 상태를 실제 보안 검증으로 설명하지 마세요.
- 서버 연동을 추가하지 않는 한 새 UI도 이 목업 경계를 명시적으로 유지하세요.

[접근성과 인쇄]
- 보이는 label, 키보드 focus-visible, Table header, aria-label과 명확한 빈 상태를 제공하세요.
- DropdownMenu, Select, Dialog와 Tabs의 기존 키보드·포커스 동작을 보존하세요.
- 색과 Badge/문구를 함께 사용해 상태를 전달하세요.
- ChartPanel에는 목적과 단위를 설명하는 aria-label을 제공하세요.
- 보고서 인쇄에서는 사이드바, 버튼과 편집 UI를 숨기고 문서만 출력하세요.
- prefers-reduced-motion에서 비필수 transition과 chart animation을 줄이세요.

[완료 기준]
- apps/learner와 apps/teacher의 코드·디자인 경계가 유지됩니다.
- 화면 라벨은 “아동”으로 일관되고 현재 아동 맥락을 잃지 않습니다.
- 현재 활성 구조인 사이드바 탐색을 유지하고 미사용 상단 헤더·탭을 새로 노출하지 않습니다.
- 현재 OKLCH/Tailwind token과 components/ui primitive를 재사용합니다.
- 시선 분석, CSV/JSON 다운로드, 보고서 버전·링크 상태와 보호자 피드백이 누락되지 않습니다.
- 목업 기능을 실제 서버 처리로 오해하게 만들지 않습니다.
- lint, 타입 검사와 프로덕션 빌드가 통과합니다.
```

---

## Iterative Refinement Prompts

### 1. 현재 구현 일치 점검

```text
apps/teacher의 실제 라우터와 활성 View import를 기준으로 문서와 화면을 대조하세요. 미사용 TeacherHeader, StudentSummaryHeader, StudentTabs와 MetricCard를 현재 활성 UI처럼 추가하지 말고, 224px 사이드바와 PageHeader 구조를 유지하세요.
```

### 2. 용어 통일

```text
사용자에게 보이는 “학생” 표기를 찾아 현재 서비스 용어인 “아동”으로 수정하세요. 기존 Student* 파일명과 TypeScript 타입은 기능 변경 위험이 있으므로 사용자 라벨과 별도로 판단하세요.
```

### 3. 디자인 토큰 정리

```text
과거 Hex primary/slate 값과 직접 만든 버튼·입력 스타일을 찾아 현재 main.css의 OKLCH semantic token, Tailwind theme mapping과 components/ui variant로 교체하세요. chartTheme.ts의 색상 체계는 별도로 유지하세요.
```

### 4. 아동 전환 데이터 일치

```text
StudentSwitcher에서 아동을 변경했을 때 현재 route name을 유지하고, 학습 현황·커리큘럼·보고서의 route id 기반 데이터가 같은 아동을 가리키는지 검증하세요. 공통 데모 데이터를 쓰는 화면은 실제 아동별 조회처럼 오해되지 않게 경계를 표시하세요.
```

### 5. 보고서 상태 기계 점검

```text
보고서의 setting, draft, published, shared, share-ended 상태별로 허용되는 버튼과 편집 가능 여부를 점검하세요. 발행 버전 불변, 새 초안 분리, 링크 만료·재발급·폐기와 이력 보존 규칙을 검증하세요.
```

### 6. 시선 분석 일관성

```text
GazeAnalysisPanel이 훈련 이력, 테스트 이력, 교수자 보고서와 보호자 보고서에서 같은 지표 의미를 유지하는지 확인하세요. 교수자용 판단 문구와 보호자용 쉬운 설명을 구분하고 데모 데이터를 실제 측정값으로 과장하지 마세요.
```

### 7. 접근성과 overlay 점검

```text
StudentSwitcher, DropdownMenu, Select, Tabs, 교안 Dialog와 ConfirmDialog를 키보드로 검증하세요. Escape, 외부 클릭, focus trap/return, aria-expanded, role, label과 저장 알림을 보완하되 Reka UI primitive의 기본 동작을 훼손하지 마세요.
```

### 8. 보고서 인쇄·공유 점검

```text
900px 보고서 미리보기와 인쇄 결과를 비교하세요. 사이드바와 화면 전용 행동을 숨기고 표·차트·시선 분석·의견이 페이지 경계에서 잘리지 않게 하세요. 보호자 공유 화면에는 내부 메모와 링크 관리 행동이 노출되지 않아야 합니다.
```

### 9. 목업 상태 점검

```text
로그인, 저장, 발행, 공유, 인증과 보호자 피드백에서 실제 서버 처리가 완료된 것처럼 보이는 표현을 점검하세요. API를 연결하지 않는 범위에서는 로컬 mock 상태임을 코드와 안내에서 일관되게 유지하세요.
```

---

## Quality Checklist

- [ ] 현재 `apps/teacher/src/router/index.ts`의 모든 라우트를 반영한다.
- [ ] 로그인·가입뿐 아니라 아이디 찾기와 비밀번호 재설정을 포함한다.
- [ ] 보호자용 `/shared-report/:token` 화면과 피드백 흐름을 포함한다.
- [ ] 현재 활성 레이아웃인 224px 사이드바와 페이지별 `PageHeader`를 반영한다.
- [ ] 미사용 전역 헤더와 상단 아동 탭을 활성 구조로 오해하지 않는다.
- [ ] 사용자 라벨은 `아동`으로 일관된다.
- [ ] OKLCH 시맨틱 토큰, Tailwind CSS와 `components/ui` primitive를 반영한다.
- [ ] 대시보드 검색·필터·요약·표·페이지 이동 기준이 현재 코드와 일치한다.
- [ ] 아동 전환 시 현재 기능 라우트를 유지하는 흐름을 반영한다.
- [ ] 학습 이벤트와 내부 메모·아동 응원·보호자 메시지의 상태를 구분한다.
- [ ] 커리큘럼 재정렬, 횟수 조정과 교안 Dialog를 포함한다.
- [ ] 훈련 CSV/JSON 다운로드와 시선 분석을 포함한다.
- [ ] 테스트 비교 검사와 교수자 전용 해석 메모를 포함한다.
- [ ] 보고서의 setting→draft→published→shared→share-ended 상태를 반영한다.
- [ ] 새 초안, 버전 불변, 링크 만료·재발급·폐기 규칙을 반영한다.
- [ ] 인쇄 시 보고서 문서만 남는 구조를 반영한다.
- [ ] 현재 목업 데이터와 실제 서버 기능의 경계를 명시한다.
- [ ] 구현 프롬프트를 별도 설명 없이 복사해 사용할 수 있다.

