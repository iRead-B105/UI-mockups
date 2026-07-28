# 아동용 UI 런타임 데이터 연결 가이드

아동·날짜·진행률처럼 사용자마다 바뀌는 값은 화면 컴포넌트에 직접 작성하지 않는다.

## 파일 역할

- `apps/learner/src/mocks/learnerRuntimeMock.ts`
  - 현재 백엔드 응답을 대신하는 단일 목업 데이터 원본
  - 이름, 날짜, 진행률, 이야기 세션, 성장 단계, 친구와 편지는 이 파일에서만 수정
- `apps/learner/src/services/learnerDataRepository.ts`
  - 화면과 데이터 소스를 분리하는 접근 경계
  - 백엔드 연결 시 화면 대신 이 파일의 함수 구현만 API 요청으로 교체

## API 교체 위치

| 저장소 함수 | 연결할 API·데이터 |
|---|---|
| `fetchLinkedStudents` | `POST /api/auth/app/teacher-login`의 `linkedStudents` |
| `saveSelectedStudentSession` | `POST /api/auth/app/student-login` 성공 응답 |
| `fetchCurrentCurriculum` | `GET /api/app/training/{studentId}/current-curriculum` |
| `fetchStoryLibrary` | `GET /api/app/story/{studentId}` |
| `getStoryDetail` | `GET /api/app/story/{studentId}/{storyId}/lines` |
| `fetchGrowthAreas` | `GET /api/app/student/{studentId}/growth` |
| `fetchStoryFriends` | `GET /api/app/mypage/character` |
| `getInitialDeviceStatus` | 아이트래커 SDK 및 마이크 권한 확인 |

## 작성 규칙

1. 날짜는 화면용 문자열이 아니라 ISO 날짜·시간으로 저장한다.
2. 날짜 표시는 컴포넌트에서 `Intl.DateTimeFormat`으로 변환한다.
3. 아동 이름이 들어가는 학습 문장에는 실제 이름 대신 `{studentName}`을 사용한다.
4. 훈련 종류, 버튼 문구, 색상처럼 사용자와 무관한 제품 설정은 런타임 목업에 넣지 않는다.
5. API 응답 DTO와 화면 모델의 차이는 저장소 함수 안에서 변환한다.
