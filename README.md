# 아이리드 UI 목업

학습자용과 교수자용 화면은 서로 독립된 Vue 애플리케이션으로 관리합니다.

| 앱 | 경로 | 실행 |
| --- | --- | --- |
| 학습자 UI | `apps/learner/` | `cd apps/learner && npm install && npm run dev` |
| 교수자 UI | `apps/teacher/` | `cd apps/teacher && npm install && npm run dev` |

두 앱은 각 디렉터리의 `package.json`, 라우터, 빌드 설정을 독립적으로 사용합니다. 한 앱의 의존성이나 라우트를 다른 앱에 합치지 않습니다.

## 검증

```bash
cd apps/learner
npm run build

cd ../teacher
npm run lint
npm run build
```

## 저장소 구조

```text
apps/
├─ learner/              # 학습자용 Vue 앱
└─ teacher/              # 교수자용 Vue 앱
docs/
└─ design/               # 팀이 공유하는 디자인 가이드
design-resources/         # 로컬 원본 에셋·QA 산출물(Git 제외)
```

`.claude`, `.codex`, `.cursor` 같은 도구별 로컬 설정과 빌드 결과·캐시·로그는 루트 `.gitignore`에서 제외합니다.
