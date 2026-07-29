# iRead 통합 API 명세서

> 기준일: 2026-07-26  
> 출처: iRead Notion API 명세 DB  
> 총 엔드포인트: 116개

---

## 1. 공통 규칙

- Base path는 `/api`입니다.
- 관리자 앱은 `/api/admin`, 학습 앱은 `/api/app`을 사용합니다.
- 로그인·토큰은 `/api/auth`를 사용합니다.
- 모든 보호 API는 `Authorization: Bearer <accessToken>`을 사용합니다.
- 교수자 소유 관계와 아동 접근 범위는 서버에서 검증합니다.
- 클라이언트가 `teacherId`를 보내 소유권을 지정하지 않습니다.
- 음성 업로드는 `multipart/form-data`를 사용합니다.
- 서버 내부 파일 경로는 응답하지 않습니다.
- `검수 필요`, `보류`, `중복 검토` 메모가 있는 API는 구현 전에 계약을 확정합니다.

### 권장 상태 코드

| 코드 | 용도 |
|---:|---|
| 200 | 조회·수정 성공 |
| 201 | 자원 생성 성공 |
| 204 | 응답 본문 없는 성공 |
| 400 | 형식·필수값 오류 |
| 401 | 인증 실패·만료 |
| 403 | 다른 교수자·아동 자원 접근 |
| 404 | 자원 없음 |
| 409 | 중복·상태 충돌 |
| 413 | 파일 크기 초과 |
| 415 | 지원하지 않는 미디어 형식 |
| 422 | 비즈니스 검증 실패 |
| 500 | 서버 오류 |
| 502 | AI·STT·TTS 외부 처리 오류 |

### 권장 오류 형식

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "요청한 데이터를 찾을 수 없습니다.",
    "details": {}
  },
  "meta": {
    "timestamp": "2026-07-26T12:00:00+09:00"
  }
}
```

---

## 2. 전체 엔드포인트

### auth

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `POST` | `/api/auth/admin/find-id` | 관리자 앱 | 미구현 | name(body); email(body) | maskedLoginId; verificationStatus | 교수자 이름과 가입 이메일 일치 시 loginId 마스킹 반환 |
| `POST` | `/api/auth/admin/login` | 관리자 앱 | 미구현 | loginId(body); password(body) | teacherId; loginId; email; name; organization; profileImage; accessToken; expiresIn; loginStatus; adminRefreshToken(cookie) | 관리자 앱 전용 인증, audience=admin-app |
| `POST` | `/api/auth/admin/logout` | 관리자 앱 | 미구현 | Authorization(header); adminRefreshToken(cookie) | 204 No Content | refresh session 폐기 및 cookie 만료 |
| `POST` | `/api/auth/admin/password-reset` | 관리자 앱 | 미구현 | loginId; email; verificationCode; newPassword | verificationStatus; resetStatus | 일회용 검증 코드 사용 |
| `POST` | `/api/auth/admin/refresh` | 관리자 앱 | 미구현 | adminRefreshToken(cookie) | accessToken; expiresIn | refresh token rotation |
| `POST` | `/api/auth/admin/sign-up` | 관리자 앱 | 구현 | loginId; email; password; name; organization; profileImage(optional) | teacherId; loginId; email; signUpStatus | loginId/email UNIQUE, 비밀번호 해시 저장 |
| `POST` | `/api/auth/app/logout` | 학습 앱 | 미구현 | Authorization(header); learningRefreshToken(cookie) | 204 No Content | 학습 refresh session 폐기 |
| `POST` | `/api/auth/app/refresh` | 학습 앱 | 미구현 | learningRefreshToken(cookie) | accessToken; expiresIn | refresh token rotation |
| `POST` | `/api/auth/app/student-login` | 학습 앱 | 미구현 | Authorization(header); studentId(body) | studentId; accessToken; expiresIn; loginStatus; learningRefreshToken(cookie) | teacherSessionToken 기반 연결 아동 선택, BIGINT ID는 string 직렬화 |
| `POST` | `/api/auth/app/teacher-login` | 학습 앱 | 미구현 | loginId; password | teacherId; teacherSessionToken; linkedStudents; expiresIn; loginStatus | 아동 선택 전용 인증, audience=learning-bootstrap |

### gaze

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `GET` | `/api/app/gaze/device/status` | 학습 앱 | 미구현 | studentId | connected; deviceName; deviceStatus; message | 요청·응답 필드명 검수 필요 |
| `POST` | `/api/app/gaze/sessions` | 학습 앱 | 미구현 | studentId; contentType; testId; calibrationStatus | gazeSessionId; contentType; collectionStatus; calibrationStatus; startedAt | 보류: API 호출 복잡도와 기존 합의 재검토 |
| `POST` | `/api/app/gaze/sessions/{gazeSessionId}/analysis-results` | 학습 앱 | 미구현 | gazeSessionId(path); studentId; totalDwellTime; fixationCount; regressionCount; averageFixationTime | gazeAnalysisId; createdAt | 필드명·단위 검수 필요 |
| `PATCH` | `/api/app/gaze/sessions/{gazeSessionId}/end` | 학습 앱 | 미구현 | gazeSessionId(path); studentId; testId; endStatus | gazeSessionId; collectionStatus; endedAt | 보류 |
| `PATCH` | `/api/app/gaze/sessions/{gazeSessionId}/failed` | 학습 앱 | 미구현 | gazeSessionId(path); studentId | gazeSessionId; collectionStatus=FAILED | 보류 |
| `POST` | `/api/app/story/{studentId}/{storyId}/gaze-analysis` | 학습 앱 | 미구현 | studentId(path); storyId(path); gazeSessionId(body) | sentenceDwellTimes; regressions; analysisResult | 검수 필요 |

### mypage

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `GET` | `/api/app/mypage/character` | 학습 앱 | 구현 | studentCode | characters[{characterId,name,imageUrl,storyId,storyTitle,acquiredAt}] | 생성된 이야기에서 실제 획득한 친구만 반환. 0명이면 빈 배열. 안내·모션 캐릭터는 기리 토끼로 고정 |
| `GET` | `/api/app/mypage/growth/statistics` | 학습 앱 | 미구현 | studentId(query) | growthAreas; achievementStats; growthRates | 검수 필요 |
| `GET` | `/api/app/mypage/growth/status` | 학습 앱 | 미구현 | studentId(query) | growthStatus; loadStatus | 검수 필요 |

### report

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `POST` | `/api/admin/report` | 관리자 앱 | 구현 | studentId; startDate; endDate; teacherMemo(optional) | reportId; createdAt | 동기 생성, snapshot_data와 teacher_memo 저장, 초안·게시·외부 공유 상태 없음 |
| `GET` | `/api/admin/report/selection` | 관리자 앱 | 미구현 | studentId; startDate; endDate; reportId | selectedReport; validationResult | 검수 필요 |
| `GET` | `/api/admin/report/{reportId}` | 관리자 앱 | 구현 | reportId(path) | reportId; startDate; endDate; createdAt; learningDays; totalTrainingTime; completedTrainingCount; averageAccuracy; averageReadingSpeed; growthByPeriod; achievementByDomain; frequentErrorWords; improvedPatterns; persistentDifficulties; teacherMemo | snapshot_data와 teacher_memo 조회 |
| `POST` | `/api/admin/report/{reportId}/gaze-analysis` | 관리자 앱 | 미구현 | reportId(path); gazeAnalysisId | reportId | 토큰으로 소유 관계 검증 |
| `PATCH` | `/api/admin/report/{reportId}/teacher-memo` | 관리자 앱 | 미구현 | reportId(path); teacherMemo | reportId; teacherMemo; createdAt | updatedAt 사용 여부 검수 |

### settings

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `GET` | `/api/admin/navigation/sidebar` | 관리자 앱 | 미구현 | studentId(query) | sidebarMenus; currentStudent; accountSummary | 검수 필요, teacherId 입력 금지 |

### story

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `GET` | `/api/app/story/{studentId}` | 학습 앱 | 구현 | studentId(path) | stories[{storyId,teacherId,templateId,sessionNumber,createdAt,lastReadAt,progress,status}]; templates[{templateId,title,coverImageUrl}] | 중앙 이어 읽기는 IN_PROGRESS 중 lastReadAt DESC, lastReadAt이 없으면 createdAt DESC. progress는 0~100 |
| `GET` | `/api/app/story/{studentId}/library` | 학습 앱 | 미구현 | studentId(path); status(query) | stories[{storyId,templateId,sessionNumber,createdAt,lastReadAt,progress,status}]; selectionGuide | DELETED는 목록에서 제외. 읽는 중·완독 목록 모두 lastReadAt DESC, 없으면 createdAt DESC |
| `GET` | `/api/app/story/{studentId}/{storyId}/guide` | 학습 앱 | 미구현 | studentId(path); storyId(path) | guideSteps; completionStatus | 검수 필요 |
| `GET` | `/api/app/story/{studentId}/{storyId}/lines` | 학습 앱 | 구현 | studentId(path); storyId(path) | storyLines[{lineId,previousLineId,storyId,text,order,readAt}] | 토큰으로 소유 관계 검증 |
| `GET` | `/api/app/story/{studentId}/{storyId}/lines/{lineId}` | 학습 앱 | 구현 | studentId(path); storyId(path); lineId(path) | lineId; previousLineId; storyId; imageUrl; requiresBranchInput; text; order; createdAt; readAt | requiresBranchInput=true이면 음성 AI 분기 |
| `PATCH` | `/api/app/story/{studentId}/{storyId}/lines/{lineId}/read` | 학습 앱 | 미구현 | studentId(path); storyId(path); lineId(path) | lineId; readAt; storyId; lastReadAt | 페이지를 모두 읽은 뒤 호출. story_lines.read_at은 최초 완독 시각을 보존하고 stories.last_read_at은 재독할 때마다 서버 시각으로 갱신 |
| `POST` | `/api/app/story/{studentId}/{storyId}/lines/{lineId}/branches` | 학습 앱 | 구현 | studentId(path); storyId(path); lineId(path); audioFile(multipart) | transcript; generationJobId; generationStatus=QUEUED | 원본 음성과 STT 결과를 저장한 뒤 비동기 생성 작업 시작. 서버가 현재 progress를 AI 요청에 포함. 아동 UI는 transcript 확인 없이 생성 대기로 전환 |
| `GET` | `/api/app/story/{studentId}/{storyId}/generation-jobs/{generationJobId}` | 학습 앱 | 미구현 | studentId(path); storyId(path); generationJobId(path) | generationJobId; generationStatus; nextLineId(optional); generatedContent(optional); imageUrl(optional); progress; storyStatus; awardedCharacter(optional){characterId,name,imageUrl,imageStatus,storyId}; errorCode(optional) | 화면 이탈·앱 종료 후에도 작업 ID로 복원. 본문과 이미지가 모두 준비된 COMPLETED 상태에서만 다음 장 공개. 마지막 분기는 엔딩 이미지 반환 |
| `GET` | `/api/app/story/{studentId}/{storyId}/navigation` | 학습 앱 | 미구현 | studentId(path); storyId(path); lineId(query); direction(query) | line; progress; nextLineId; previousLineId | 검수 필요 |
| `GET` | `/api/app/story/{studentId}/{storyId}/resume` | 학습 앱 | 구현 | studentId(path); storyId(path) | storyId; lastReadAt; progress; status; storyLines[{lineId,previousLineId,order,readAt}] | 이어보기. progress는 stories에 저장된 0~100 값 |
| `POST` | `/api/app/story/{studentId}/{storyId}/speech` | 학습 앱 | 미구현 | studentId(path); storyId(path); lineId; audioFile | transcript; accuracy; readingStatus | 검수 필요, 내부 파일 경로 비노출 |
| `POST` | `/api/app/story/{studentId}/{storyId}/tts` | 학습 앱 | 미구현 | studentId(path); storyId(path); lineId | audioUrl; playbackLimit; duration | 검수 필요 |
| `GET` | `/api/app/story/{studentId}/templates/{storyTemplateId}` | 학습 앱 | 구현 | studentId(path); storyTemplateId(path) | templateId; title; coverImageUrl; content | 이야기 세션 경로와 구분 |
| `GET` | `/api/app/story/{studentId}/templates/{storyTemplateId}/detail-state` | 학습 앱 | 미구현 | studentId(path); storyTemplateId(path) | storyDetail; readingEntryPath | 검수 필요 |
| `POST` | `/api/app/story/{studentId}/templates/{storyTemplateId}/sessions` | 학습 앱 | 구현 | studentId(path); storyTemplateId(path) | storyId; teacherId; templateId; sessionNumber; createdAt; lastReadAt=null; progress=0; status=IN_PROGRESS | 신규 읽기 세션 생성. sessionNumber는 동일 studentId+templateId의 storyId 순번 |

### student

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `POST` | `/api/admin/student` | 관리자 앱 | 구현 | name; studentCode; birthday; gender; school; guardianName; guardianPhone; guardianEmail; address; profileImage | ok | teacherId 입력 금지 |
| `GET` | `/api/admin/student/actions` | 관리자 앱 | 미구현 | studentId; action | actionTarget; availableActions | UI 상태 API 여부 재검토 |
| `GET` | `/api/admin/student/filter` | 관리자 앱 | 미구현 | keyword; ageRange; learningPeriod | students; appliedFilters; totalCount | 목록 API query로 통합 검토 |
| `GET` | `/api/admin/student/list` | 관리자 앱 | 구현 | 없음 | students[{name,age,lastLearningAt,totalLearningTime,recentTraining}] | teacherId 입력 금지 |
| `GET` | `/api/admin/student/list-state` | 관리자 앱 | 미구현 | page; size | students; pagination; emptyState | UI 상태 API 여부 재검토 |
| `GET` | `/api/admin/student/selection` | 관리자 앱 | 미구현 | studentId | studentSummary; selectionStatus | UI 상태 API 여부 재검토 |
| `GET` | `/api/admin/student/summary` | 관리자 앱 | 미구현 | filters | totalStudents; searchResultCount; attentionRequiredCount | 검수 필요 |
| `DELETE` | `/api/admin/student/{studentId}` | 관리자 앱 | 구현 | studentId(path) | ok | 삭제 데이터 정책 확정 필요 |
| `GET` | `/api/admin/student/{studentId}` | 관리자 앱 | 구현 | studentId(path) | name; studentCode; birthday; gender; school; guardianName; guardianPhone; guardianEmail; address; createdAt; profileImage | 소유 관계 검증 |
| `PATCH` | `/api/admin/student/{studentId}` | 관리자 앱 | 구현 | studentId(path); name?; birthday?; gender?; school?; guardian?; guardianContact?; guardianEmail?; address?; imageUrl?; teacherMemo? | ok | 전달된 필드만 수정 |
| `GET` | `/api/admin/student/{studentId}/accuracy-trend` | 관리자 앱 | 구현 | studentId(path) | dailyAccuracy[{date,accuracy}] | 집계 기간 검수 |
| `GET` | `/api/admin/student/{studentId}/form` | 관리자 앱 | 미구현 | studentId(path) | studentInfo; guardianInfo; editableFields | UI 전용 API 여부 검토 |
| `PATCH` | `/api/admin/student/{studentId}/form-submit` | 관리자 앱 | 미구현 | studentId(path); childInfo; guardianInfo; profileImage | studentId; status; updatedAt | PATCH /student/{id}와 중복 검토 |
| `GET` | `/api/admin/student/{studentId}/learning-events` | 관리자 앱 | 미구현 | studentId(path); eventId | learningEvent; exceptionStatus; recommendedTraining | 검수 필요 |
| `GET` | `/api/admin/student/{studentId}/learning-summary` | 관리자 앱 | 미구현 | studentId(path) | studentId; currentStage; lastLearningAt; attentionRequiredCount | 추가 필요 |
| `GET` | `/api/admin/student/{studentId}/reading-accuracy-trend` | 관리자 앱 | 미구현 | studentId(path); period | accuracyTrend; changeRate; target | accuracy-trend와 중복 검토 |
| `GET` | `/api/admin/student/{studentId}/training-history` | 관리자 앱 | 구현 | studentId(path) | learningRecords[{date,learningType,category,accuracy}] | 요청값의 '훈련 기록' 제거 필요 |
| `GET` | `/api/app/student/{studentId}/growth` | 학습 앱 | 미구현 | studentId(path) | growthAreas[{areaId,name,learningCount,stage,updatedAt}]; cumulativeStats[{statId,wordId,studentId,masteryRate,totalAttempts,lastAttemptAt}] | 아동 화단은 learningCount와 stage만 사용하고 성취율은 노출하지 않음. 토큰 범위 검증 |

### teacher

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `GET` | `/api/admin/teacher/info` | 관리자 앱 | 구현 | 없음 | name; organization; email; gender; profileImage | 현재 인증 사용자 |
| `GET` | `/api/admin/teacher/profile/edit` | 관리자 앱 | 미구현 | 없음 | profileInfo; editableFields | UI 전용 API 여부 검토 |
| `PATCH` | `/api/admin/teacher/profile/save-state` | 관리자 앱 | 미구현 | profileInfo; profileImage | teacherId; status; updatedAt | REST 경로 재설계 검토 |
| `GET` | `/api/admin/teacher/profile/view` | 관리자 앱 | 미구현 | 없음 | teacherProfile | /info와 중복 검토 |

### test

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `GET` | `/api/admin/test/{studentId}/compare` | 관리자 앱 | 구현 | studentId(path); currentTestId; compareTestIds[] | stats[{current,readingTime,solvingTime,accuracy,gazeExitCount}]; results[{questionNumber,question,correctChoice,selectedChoice}] | 소유 관계 검증 |
| `GET` | `/api/admin/test/{studentId}/comparison-selection` | 관리자 앱 | 미구현 | studentId(path); baseTestId; compareTestIds | selectedTests; comparisonAvailability | UI 상태 API 여부 검토 |
| `GET` | `/api/admin/test/{studentId}/list` | 관리자 앱 | 구현 | studentId(path) | tests[{testId,date}] | 소유 관계 검증 |
| `GET` | `/api/admin/test/{studentId}/statistics` | 관리자 앱 | 미구현 | studentId(path); testId | domainScores; totalScore; comparison | 검수 필요 |
| `GET` | `/api/admin/test/{studentId}/{testId}/gaze-analysis` | 관리자 앱 | 미구현 | studentId(path); testId(path) | gazeSessionId; gazeAnalysisId; totalDwellTime; fixations; regressionCount; averageFixationTime | 필드 단위 검수 |
| `GET` | `/api/admin/test/{studentId}/{testId}/summary` | 관리자 앱 | 미구현 | studentId(path); testId(path) | testSummary; strengths; weaknesses; nextRecommendation | 검수 필요 |
| `GET` | `/api/app/test/{studentId}/audio-state` | 학습 앱 | 미구현 | studentId(path); testId; questionNumber | audioUrl; playbackCount; playbackState | UI 상태 API 여부 검토 |
| `GET` | `/api/app/test/{studentId}/intro` | 학습 앱 | 미구현 | studentId(path) | testId; studentId; testDate; status; questionCount | 응답 필드 검수 |
| `GET` | `/api/app/test/{studentId}/intro-navigation` | 학습 앱 | 미구현 | studentId(path); testId | intro; guide; nextRoute | UI 라우팅 API 여부 검토 |
| `PATCH` | `/api/app/test/{studentId}/question-navigation` | 학습 앱 | 미구현 | studentId(path); testId; questionNumber; currentResponse; direction | nextQuestionNumber; navigationStatus | 응답 저장과 이동 분리 검토 |
| `GET` | `/api/app/test/{studentId}/questions/display-state` | 학습 앱 | 미구현 | studentId(path); testId; questionNumber | question; targetPhrase; displayState | 문항 조회 API와 중복 |
| `GET` | `/api/app/test/{studentId}/questions/{questionNumber}` | 학습 앱 | 미구현 | studentId(path); testId; questionNumber(path) | testId; question; questionNumber; word; wordLength; imageId; imageUrl; audioId; audioUrl | 내부 저장 경로 비노출 |
| `POST` | `/api/app/test/{studentId}/questions/{questionNumber}/complete` | 학습 앱 | 미구현 | studentId(path); testId; status; questionNumber(path); result; accuracy | testId; status; result; accuracy | 문항 완료와 전체 완료 구분 |
| `POST` | `/api/app/test/{studentId}/questions/{questionNumber}/recordings` | 학습 앱 | 미구현 | studentId(path); testId; questionNumber(path); audioFile | testId; result | multipart, 내부 파일 경로 비노출 |
| `POST` | `/api/app/test/{studentId}/questions/{questionNumber}/responses` | 학습 앱 | 미구현 | studentId(path); testId; questionNumber(path); response | testId; result | 선택 응답 |
| `POST` | `/api/app/test/{studentId}/recording-state` | 학습 앱 | 미구현 | studentId(path); testId; questionNumber; audioFile | recordingId; duration; validationResult | recordings API와 중복 검토 |
| `PATCH` | `/api/app/test/{studentId}/selection-state` | 학습 앱 | 미구현 | studentId(path); testId; questionNumber; choiceId | selectedChoice; selectionState | responses API와 중복 검토 |
| `POST` | `/api/app/test/{studentId}/session-reset` | 학습 앱 | 미구현 | studentId(path); testId | sessionState; resetAt | 검수 필요 |
| `POST` | `/api/app/test/{studentId}/start` | 학습 앱 | 미구현 | studentId(path) | testId; testDate; status | 테스트 세션 생성 |
| `POST` | `/api/app/test/{studentId}/submission-status` | 학습 앱 | 미구현 | studentId(path); testId; responses | saveStatus; completionStatus; nextRoute | UI 상태 API 여부 검토 |

### training

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `GET` | `/api/admin/training/{studentId}` | 관리자 앱 | 구현 | studentId(path) | trainings[{trainingId,category,order,name,achievementRate}] | 소유 관계 검증 |
| `GET` | `/api/admin/training/{studentId}/curriculum-log` | 관리자 앱 | 구현 | studentId(path) | date; achievementRate; trainings[{trainingId,unitName,trainingName}] | 검수 필요 |
| `GET` | `/api/admin/training/{studentId}/history/filter` | 관리자 앱 | 미구현 | studentId(path); startDate; endDate | trainingLogs; totalCount | 목록 query로 통합 검토 |
| `GET` | `/api/admin/training/{studentId}/history/selection` | 관리자 앱 | 미구현 | studentId(path); trainingLogId | selectedTrainingLog | UI 상태 API 여부 검토 |
| `PATCH` | `/api/admin/training/{studentId}/{curriculumId}` | 관리자 앱 | 구현 | studentId(path); curriculumId(path); trainingIds[] | ok | 커리큘럼 저장 |
| `GET` | `/api/admin/training/{studentId}/{curriculumId}` | 관리자 앱 | 구현 | studentId(path); curriculumId(path) | trainings[{trainingId,unitName,trainingName}] | 차회 커리큘럼 조회 |
| `PATCH` | `/api/admin/training/{studentId}/{curriculumId}/curriculum-editor` | 관리자 앱 | 미구현 | studentId(path); curriculumId(path); trainingItems; materials | curriculumId; trainingItems; updatedAt | 기존 PATCH와 통합 검토 |
| `GET` | `/api/admin/training/{studentId}/{curriculumId}/editor-selection` | 관리자 앱 | 미구현 | studentId(path); curriculumId(path); trainingId | selectedTraining; editableMaterials | UI 전용 API 여부 검토 |
| `GET` | `/api/admin/training/{studentId}/{curriculumId}/statistics` | 관리자 앱 | 구현 | studentId(path); curriculumId(path) | trainings[{trainingId,name,date,accuracy,previousDate,previousAccuracy}] | 소유 관계 검증 |
| `GET` | `/api/admin/training/{studentId}/{curriculumId}/training-log` | 관리자 앱 | 구현 | studentId(path); curriculumId(path) | trainings[{trainingId,name,startedAt,endedAt,itemResults,accuracy,wrongItems}] | 검수 필요 |
| `GET` | `/api/admin/training/{studentId}/{trainingId}/detail` | 관리자 앱 | 미구현 | studentId(path); trainingId(path) | trainingDetail; achievement; recommendedDuration; childPreview | 검수 필요 |
| `POST` | `/api/admin/training/{studentId}/{trainingId}/expected-word` | 관리자 앱 | 구현 | studentId(path); trainingId(path); word | ok | 목표 단어 추가 |
| `GET` | `/api/admin/training/{studentId}/{trainingId}/expected-word` | 관리자 앱 | 구현 | studentId(path); trainingId(path) | words[{wordId,word}] | 목표 단어 목록 |
| `DELETE` | `/api/admin/training/{studentId}/{trainingId}/expected-word/{wordId}` | 관리자 앱 | 구현 | studentId(path); trainingId(path); wordId(path) | ok | 목표 단어 삭제 |
| `POST` | `/api/admin/training/{studentId}/{trainingId}/export` | 관리자 앱 | 미구현 | studentId(path); trainingId(path); format | fileName; downloadUrl; expiresAt | 검수 필요 |
| `GET` | `/api/admin/training/{studentId}/{trainingId}/gaze-analysis` | 관리자 앱 | 미구현 | studentId(path); trainingId(path) | gazeSessionId; gazeAnalysisId; totalDwellTime; fixations; regressionCount; averageFixationTime | 검수 필요 |
| `GET` | `/api/admin/training/{studentId}/{trainingId}/result-detail` | 관리자 앱 | 미구현 | studentId(path); trainingId(path) | trainingSummary; itemResults; gazeAnalysis | 검수 필요 |
| `GET` | `/api/app/training/{studentId}/current-curriculum` | 학습 앱 | 미구현 | studentId(path) | curriculumId; studyDate(nullable); status; currentOrder; trainings[{trainingId,trainingTemplateId,order,unitName,name,status}] | 날짜별 사전 일정이 아닌 다음 학습 회차 조회. 완료 전 studyDate는 null, 완료 시 실제 completedAt의 서비스 날짜. PREPARING은 자동 재조회, REST는 휴식 화면 |
| `GET` | `/api/app/training/{studentId}/{trainingId}/audio-state` | 학습 앱 | 미구현 | studentId(path); trainingId(path); questionNumber | audioUrl; playbackCount; playbackState | UI 상태 API 여부 검토 |
| `POST` | `/api/app/training/{studentId}/{trainingId}/complete` | 학습 앱 | 미구현 | studentId(path); trainingId(path); trainingLogId; endedAt; status; result; accuracy | trainingLogId; endedAt; status; result; accuracy; progressId; achievementRate | 완료와 진행률 갱신 |
| `GET` | `/api/app/training/{studentId}/{trainingId}/intro` | 학습 앱 | 미구현 | studentId(path); trainingId(path); trainingLogId | trainingLogId; trainingTemplateId; curriculumId; order; status; name; dataType; generatedData | 검수 필요 |
| `GET` | `/api/app/training/{studentId}/{trainingId}/intro-navigation` | 학습 앱 | 미구현 | studentId(path); trainingId(path) | intro; guide; nextRoute | UI 라우팅 API 여부 검토 |
| `PATCH` | `/api/app/training/{studentId}/{trainingId}/question-navigation` | 학습 앱 | 미구현 | studentId(path); trainingId(path); questionNumber; currentResponse; direction | nextQuestionNumber; navigationStatus | 응답 저장과 이동 분리 검토 |
| `GET` | `/api/app/training/{studentId}/{trainingId}/questions/display-state` | 학습 앱 | 미구현 | studentId(path); trainingId(path); questionNumber | question; targetPhrase; displayState | 문항 조회와 중복 |
| `GET` | `/api/app/training/{studentId}/{trainingId}/questions/{questionNumber}` | 학습 앱 | 미구현 | studentId(path); trainingId(path); trainingLogId; questionNumber(path) | trainingLogId; trainingData; generatedData; questionNumber; word; wordLength; imageId; imageUrl; audioId; audioUrl; videoId; videoUrl | 내부 저장 경로 비노출 |
| `POST` | `/api/app/training/{studentId}/{trainingId}/questions/{questionNumber}/recordings` | 학습 앱 | 미구현 | studentId(path); trainingId(path); trainingLogId; questionNumber(path); wordId; audioFile | logId; transcript; pronunciationScore; readingErrorType; success; createdAt | multipart, 내부 파일 경로 비노출 |
| `POST` | `/api/app/training/{studentId}/{trainingId}/questions/{questionNumber}/responses` | 학습 앱 | 미구현 | studentId(path); trainingId(path); trainingLogId; questionNumber(path); wordId; response | logId; trainingLogId; wordId; questionNumber; success | 선택 응답 |
| `POST` | `/api/app/training/{studentId}/{trainingId}/recording-state` | 학습 앱 | 미구현 | studentId(path); trainingId(path); questionNumber; audioFile | recordingId; duration; validationResult | recordings API와 중복 검토 |
| `PATCH` | `/api/app/training/{studentId}/{trainingId}/selection-state` | 학습 앱 | 미구현 | studentId(path); trainingId(path); questionNumber; choiceId | selectedChoice; selectionState | responses API와 중복 검토 |
| `POST` | `/api/app/training/{studentId}/{trainingId}/session-reset` | 학습 앱 | 미구현 | studentId(path); trainingId(path) | sessionState; resetAt | 검수 필요 |
| `POST` | `/api/app/training/{studentId}/{trainingId}/start` | 학습 앱 | 미구현 | studentId(path); trainingId(path); trainingLogId | trainingLogId; startedAt; status | 훈련 세션 시작 |
| `POST` | `/api/app/training/{studentId}/{trainingId}/submission-status` | 학습 앱 | 미구현 | studentId(path); trainingId(path); responses | saveStatus; completionStatus; nextRoute | UI 상태 API 여부 검토 |

### user

| Method | Path | 앱 | 상태 | 요청값 | 응답값 | 메모 |
|---|---|---|---|---|---|---|
| `GET` | `/api/app/user/home-navigation` | 학습 앱 | 미구현 | studentId(query) | todayLearning; greeting; navigationTargets | UI 탐색 API 여부 검토 |
| `PATCH` | `/api/app/user/session-navigation` | 학습 앱 | 미구현 | studentId; activityState; destination | temporarySaveStatus; navigationResult | 클라이언트 라우팅과 서버 저장 분리 검토 |

---

## 3. 구현 전 우선 정리할 API

### UI 상태 API 통합 검토

다음 API는 서버 자원보다 화면 상태·라우팅을 표현하므로 프론트엔드 상태로 처리하거나 기존 자원 API에 통합하는 것을 우선 검토합니다.

- `/api/admin/navigation/sidebar`
- `/api/admin/student/actions`
- `/api/admin/student/list-state`
- `/api/admin/student/selection`
- `/api/admin/teacher/profile/edit`
- `/api/admin/teacher/profile/view`
- `/api/app/test/{studentId}/audio-state`
- `/api/app/test/{studentId}/intro-navigation`
- `/api/app/test/{studentId}/questions/display-state`
- `/api/app/test/{studentId}/recording-state`
- `/api/app/test/{studentId}/selection-state`
- `/api/app/test/{studentId}/submission-status`
- 훈련 도메인의 동일한 `*-state`, `*-navigation` API
- `/api/app/user/home-navigation`
- `/api/app/user/session-navigation`

### 중복 가능 API

- `GET /student/{id}/accuracy-trend`와 `GET /student/{id}/reading-accuracy-trend`
- `PATCH /student/{id}`와 `PATCH /student/{id}/form-submit`
- `GET /teacher/info`와 `GET /teacher/profile/view`
- 테스트·훈련의 `recordings`와 `recording-state`
- 테스트·훈련의 `responses`와 `selection-state`
- 커리큘럼 `PATCH /{curriculumId}`와 `/curriculum-editor`

### 경로 충돌 검토

- 이야기 세션은 `/api/app/story/{studentId}/{storyId}` 계열을 사용합니다.
- 이야기 템플릿은 `/api/app/story/{studentId}/templates/{storyTemplateId}` 계열로 분리해 경로 충돌을 해소했습니다.

### 보류 API

- 시선 세션 생성·종료·실패 API는 로컬 Eye Tracker 모듈, FastAPI, Spring 간 책임을 확정한 뒤 구현합니다.

---

## 4. 구현 우선순위

### P0

- auth 전체
- student 기본 CRUD·목록
- training start/question/response/recording/complete
- test start/question/response/recording/complete
- gaze session과 분석 저장 계약 확정

### P1

- story STT·TTS·gaze·AI branch
- 관리자 훈련·테스트 상세 결과
- curriculum editor
- report 생성·조회·메모

### P2

- export
- 고급 통계
- UI 상태성 API 정리
