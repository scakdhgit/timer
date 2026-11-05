# 스마트 타이머 — GitHub Pages용

이 대화에서 제작한 v5.0 웹 화면을 기준으로 만든 별도 배포본입니다. Windows 앱과 원래 HTML은 변경하지 않았습니다.

## 업로드

1. GitHub 저장소의 루트에 `index.html`, `assets` 폴더, `.nojekyll`을 함께 올립니다.
2. 저장소 **Settings → Pages → Deploy from a branch**에서 업로드한 브랜치와 **/(root)**를 선택합니다.
3. 발급된 HTTPS 주소를 엽니다. 저장소 이름이 붙는 `/repository/` 경로에서도 동작하도록 상대 경로를 사용합니다.

`node_modules`, Windows 실행 파일, 개발 테스트 파일을 올릴 필요는 없습니다. `clock-pages-upload.zip`은 배포 파일만 포함합니다.

로컬 실행도 가능합니다. ZIP **전체를 압축 해제**한 뒤 `index.html`을 더블클릭하세요. `assets` 폴더를 같은 위치에 두어야 합니다. 로컬 파일에서는 `assets/music-data.js`에 담긴 음악 데이터를 사용해 `fetch(file://)` 제한을 피하고, 웹 주소에서는 MP3 파일을 읽습니다.

## 음악

- 기본 곡은 사용자가 제공한 케어멜로디 MP3의 앞 10분입니다. 음량을 낮추거나 재인코딩하지 않고 원본 음량 그대로 잘라 반복 재생합니다. 외부 스트리밍·API 키가 필요하지 않습니다.
- 하단에서 위쪽으로 열리는 **활동 음악 선택란**에서 곡을 변경하고, **음악 추가**로 MP3 등의 파일을 여러 개 선택할 수 있습니다. 추가한 파일은 서버로 전송되지 않으며 새로고침하면 다시 선택해야 합니다.
- 추가 파일은 개당 60MB 이하이며, 앞 10분(짧은 곡은 전체)을 반복합니다. 실행 중 변경하면 새 곡으로 전환하고, 정지 중에는 곡만 준비합니다.
- 타이머/스톱워치 실행 중에만 재생됩니다. 일시정지·초기화·알람에서는 정지합니다.
- 타이머는 남은 5초에 도달하기 직전 0.2초 동안 줄어들고, 5초부터는 음악이 들리지 않습니다. 예비 알림을 끄면 종료 시점까지 재생합니다.
- 예비 알림이 켜져 있을 때만 5초 이하로 시작하면 음악이 나오지 않습니다. 실행 중 시간을 추가해 다시 5초를 넘기면 재개합니다.
- 볼륨은 0~100%이며 첫 기본값은 100%(원본 음량)입니다. 추가 음원에도 자동 음량 감소를 적용하지 않습니다. 알람 음량은 기존대로입니다.
- 활동 음악은 페이지를 열거나 새로고침할 때 기본으로 꺼집니다. 음량만 브라우저 저장소에 보관합니다. 브라우저/사이트 음소거와 시스템 볼륨은 별도로 적용됩니다.
- 첫 화면 터치, 시작 버튼 또는 음악 체크박스 조작이 오디오 활성화에 필요합니다.

## 호환성 및 제한

| 항목 | 결과 |
|---|---|
| GitHub Pages 정적 호스팅 | 서버 없이 가능. 폰트·CSS·음악 모두 함께 제공 |
| 일반 타이머/스톱워치·음악 | 최신 Web Audio 지원 브라우저에서 사용 가능. 최초 사용자 조작 필요 |
| 조작 가능한 PIP | Document Picture-in-Picture 지원 브라우저에서만 가능. 보안 컨텍스트(HTTPS) 필요 |
| PIP 미지원 환경 | 안내 표시 후 기본 화면 사용. 빈 비디오 PIP로 대체하지 않음 |
| 특정 모니터·좌표 복원 | Windows 앱과 달리 웹에서 강제 지정 불가. 브라우저의 위치 기억에 따름 |
| 브라우저/기기 종료·절전 | 백그라운드 알람 보장 불가 |
| 백그라운드 타이머 | 실제 종료 시각으로 표시 보정. 음악의 5초 전 종료는 Web Audio에 예약. 탭이 정지/폐기되면 알람 지연 가능 |
| 설치 앱 전용 배지 | 일반 웹 탭에서는 표시되지 않을 수 있음 |

Chromium 기반 실행 테스트 결과는 `test-result.json`에 기록합니다. Safari/Firefox/모바일·실제 GitHub 배포는 별도 확인이 필요합니다.

공식 자료:
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://developer.mozilla.org/en-US/docs/Web/API/Window/documentPictureInPicture
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay

## 개발

원본 v5.0에서 재생성: `node build-pages.cjs` (상위 `clock-windows/assets`의 로컬 스타일·폰트를 사용).
기본 음악 파일: `assets/activity-caremelody-10min.mp3`.
기존 합성 음악은 배포 대상에서 제외했습니다. `make-music.cjs`는 이전 합성 음악을 생성하는 참고 코드입니다.


## 음악 폴더 자동 등록 (새 배포 방식)
1. ZIP의 index.html, assets, scripts, .github, .nojekyll을 저장소 루트에 올립니다.
2. Settings → Pages → Source를 GitHub Actions로 바꿉니다.
3. 기본 브랜치의 assets/music 폴더에 MP3를 업로드하고 Commit changes를 누릅니다.
4. Actions의 Publish timer and music이 완료되면 페이지를 새로고침합니다.
파일명이 곡 이름이 됩니다. 파일을 삭제하면 다음 배포에서 목록에서도 빠집니다.
페이지에서 음악 추가로 선택한 로컬 파일은 여전히 임시입니다. 영구 목록은 GitHub에 업로드하세요.
기존 업로드 설명의 Deploy from a branch 대신 GitHub Actions를 사용해야 자동 등록됩니다.
`n음악 목록 맨 위의 음악 랜덤재생을 선택하면 등록 곡 중 무작위 재생합니다. 각 곡은 최대 10분 재생 후 다음 곡으로 넘어가며, 곡이 여러 개면 같은 곡을 연속 선택하지 않습니다.
