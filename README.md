# 아이리드 UI 목업

학습자용과 교수자용 화면은 서로 독립된 Vue 애플리케이션으로 관리합니다.

| 앱 | 경로 | 실행 |
| --- | --- | --- |
| 학습자 UI | `vue-project/` | `cd vue-project && npm install && npm run dev` |
| 교수자 UI | `t-ui/` | `cd t-ui && npm install && npm run dev` |

두 앱은 각 디렉터리의 `package.json`, 라우터, 빌드 설정을 독립적으로 사용합니다. 한 앱의 의존성이나 라우트를 다른 앱에 합치지 않습니다.

## 검증

```bash
cd vue-project
npm run build

cd ../t-ui
npm run lint
npm run build
```
