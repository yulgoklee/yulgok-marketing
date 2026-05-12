# 이율곡 · Marketing Performance Dashboard

> 데이터 기반 마케팅 기획자 이율곡의 포트폴리오 사이트.
> 27개월간 단독 운영한 마케팅 성과를 인터랙티브 데이터 대시보드로 시각화했습니다.

🔗 **Live**: [https://yulgoklee.github.io/yulgok-marketing/](https://yulgoklee.github.io/yulgok-marketing/)

---

## ✨ 주요 특징

- **🎯 데이터 중심 스토리텔링** — 계열 평균 대비 +433%, 매출 +58% 성장 등 측정 가능한 성과 시각화
- **📊 D3.js 인터랙티브 차트** — 호버 툴팁, 카운터 애니메이션, 스크롤 트리거 등
- **🎨 다크 모드 데이터 대시보드** — Linear / Vercel 스타일의 분석적 톤
- **📱 완전 반응형** — 데스크톱, 태블릿, 모바일 모두 대응
- **⚡ Vanilla Stack** — 프레임워크·빌드도구 없이 정적 파일만으로 작동

---

## 📐 구조

```
yulgok-marketing/
├── index.html      # 메인 페이지 (전체 콘텐츠)
├── styles.css      # 스타일시트 (다크 테마, 반응형)
├── script.js       # D3.js 차트 + 인터랙션
└── README.md       # 이 파일
```

---

## 🛠 기술 스택

| 영역 | 사용 기술 |
|------|----------|
| Markup | HTML5 |
| Style | CSS3 (Custom Properties, Grid, Flexbox) |
| Script | JavaScript ES6+ (Vanilla) |
| Visualization | D3.js v7 |
| Typography | Space Grotesk · Pretendard Variable · JetBrains Mono |
| Hosting | GitHub Pages |

**의존성 0개** — 모든 외부 자원은 CDN 로드.

---

## 🚀 로컬에서 실행하기

### 옵션 1: 브라우저에서 직접 열기

`index.html`을 더블클릭하면 작동합니다.

### 옵션 2: 로컬 서버 (권장)

일부 인터랙션 (특히 IntersectionObserver)이 더 안정적으로 작동합니다.

```bash
# Python 3 (가장 간단)
python3 -m http.server 8000

# 또는 Node.js
npx serve

# 또는 VS Code Live Server 확장
```

브라우저에서 `http://localhost:8000` 접속.

---

## 📤 GitHub Pages 배포 방법

이미 [yulgok-marketing](https://github.com/yulgoklee/yulgok-marketing) 저장소에 배포되어 있습니다.
배포 흐름을 처음부터 다시 잡으려면:

### 1단계: 저장소 만들기

1. GitHub 로그인 후 우측 상단 `+` → `New repository`
2. Repository name 입력 (예: `yulgok-marketing`)
3. **Public** 설정 (무료 GitHub Pages는 Public만)
4. README 추가 옵션 체크 해제
5. `Create repository` 클릭

### 2단계: 파일 업로드

**방법 A: 웹에서 드래그 앤 드롭 (코딩 몰라도 OK)**

1. 저장소 페이지에서 `uploading an existing file` 클릭
2. `index.html`, `styles.css`, `script.js`, `README.md` 드래그
3. 하단 `Commit changes` 클릭

**방법 B: 터미널에서 Git 사용**

```bash
cd ~/Documents/GitHub/leeyulgok
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/yulgoklee/yulgok-marketing.git
git push -u origin main
```

### 3단계: GitHub Pages 활성화

1. 저장소 페이지 → `Settings` 탭
2. 좌측 메뉴 → `Pages`
3. **Source** 섹션:
   - Branch: `main` 선택
   - Folder: `/ (root)`
4. `Save` 클릭
5. 1~2분 후 상단에 URL 표시됨:
   - `https://yulgoklee.github.io/yulgok-marketing/`

### 4단계: 확인

URL 접속하여 사이트가 정상 작동하는지 확인.

---

## 🎨 디자인 시스템

### 색상

```css
--bg: #0A0E14;              /* 배경 (가장 진함) */
--bg-elev-1: #0F1419;       /* 카드 배경 */
--accent: #00D9A3;          /* 메인 액센트 (데이터 그린) */
--amber: #F2C94C;           /* 보조 액센트 (앰버) */
--text: #E6EDF3;            /* 주요 텍스트 */
```

### 폰트

- **Display**: Space Grotesk (제목, 큰 숫자)
- **Body**: Pretendard Variable (본문, 한글)
- **Mono**: JetBrains Mono (라벨, 메타정보)

### 간격 시스템

8px 베이스 (8, 16, 24, 32, 48, 64, 80, 120)

---

## 📊 사이트 구성

| 섹션 | 내용 |
|------|------|
| **01. Overview** | 핵심 KPI 4개 + 한 줄 소개 |
| **02. Performance** | 개인문의 추이 차트 + 1·2년차 비교 + 블로그 분석 + KPI Strip |
| **03. Strategy** | 5가지 핵심 역량 + 마케팅 퍼널 |
| **04. Crisis Response** | 네이버 알고리즘 변경 대응 케이스 스터디 |
| **05. AI Pipeline** | 4단계 멀티 모델 워크플로우 + 성과 |
| **06. Contact** | 연락처 |

---

## 🔧 커스터마이징

### 데이터 업데이트

`script.js` 상단의 `inquiryData`, `peerData`, `viewsData`, `comparisonData` 변수를 수정하세요.

### 색상 변경

`styles.css` 상단 `:root` 변수를 수정하세요.

```css
:root {
  --accent: #00D9A3;  /* 여기 변경 */
}
```

### 연락처 변경

`index.html`에서 `#contact` 섹션을 검색하여 수정하세요.

---

## 📝 면책 조항

이 포트폴리오는 개인 용도로 제작되었으며, 데이터는 SBS아카데미컴퓨터아트학원 수원점 재직 기간(2024.02 ~ 2026.05) 동안의 실제 마케팅 성과 데이터입니다. 회사 기밀 정보는 포함되지 않았습니다.

---

## 📬 Contact

- **Email**: dbfrhr20@naver.com
- **Phone**: 010-5548-9567
- **Location**: 경기도 수원시

---

© 2026 이율곡 · Yulgok Lee
