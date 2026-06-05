# 이율곡 · Growth Marketer Portfolio

> 그로스 마케터 이율곡의 포트폴리오 사이트.
> "고객을 읽고, 시스템으로 풉니다" — 가설 → 실험 → 측정 → 다시 가설로 도는 루프를
> 26개월간 단독 운영한 성과를 능력 중심 서사로 재구성했습니다.
> (그로스 마케팅 메인 / 퍼포먼스 마케팅 서브 타깃)

🔗 **Live**: [https://yulgoklee.github.io/yulgok-marketing/](https://yulgoklee.github.io/yulgok-marketing/)

---

## ✨ 주요 특징

- **🎯 판단 중심 스토리텔링** — 숫자보다 "어디서부터 볼지 고른 판단"을 서사 축으로
- **📊 정적 비교 시각화** — 전국 평균 vs 본인 비교막대, SVG 사다리꼴 퍼널 등 직관적 도식
- **🎨 가로 슬라이드 대시보드** — 10장 전스크린 슬라이드, 키보드·휠·클릭 탐색
- **📱 완전 반응형** — 데스크톱 슬라이드 모드 / 모바일 세로 스크롤 자동 전환
- **⚡ Vanilla Stack** — 프레임워크·빌드도구 없이 정적 파일만으로 작동

---

## 📐 구조

```
yulgok-marketing/
├── index.html      # 메인 페이지 (10슬라이드 전체 콘텐츠)
├── styles.css      # 스타일시트 (다크 테마, 슬라이드 레이아웃, 반응형)
├── script.js       # 슬라이드 덱 내비게이션 + D3.js 데이터 보관
└── README.md       # 이 파일
```

---

## 🛠 기술 스택

| 영역 | 사용 기술 |
|------|----------|
| Markup | HTML5 + SVG |
| Style | CSS3 (Custom Properties, Grid, Flexbox) |
| Script | JavaScript ES6+ (Vanilla) |
| Visualization | D3.js v7 (데이터 보관용), 정적 SVG/CSS 시각화 |
| Typography | Space Grotesk · Pretendard Variable · JetBrains Mono |
| Hosting | GitHub Pages |

**의존성 0개** — 모든 외부 자원은 CDN 로드 (Google Fonts, jsdelivr, d3js.org).

---

## 🚀 로컬에서 실행하기

### 옵션 1: 브라우저에서 직접 열기

`index.html`을 더블클릭하면 작동합니다.

### 옵션 2: 로컬 서버 (권장)

```bash
# Python 3 (가장 간단)
python3 -m http.server 8000

# 또는 Node.js
npx serve

# 또는 VS Code Live Server 확장
```

브라우저에서 `http://localhost:8000` 접속.

---

## 📤 GitHub Pages 배포

이미 [yulgok-marketing](https://github.com/yulgoklee/yulgok-marketing) 저장소에 배포되어 있습니다.

배포 흐름: `Settings → Pages → Branch: main / (root) → Save` → 1~2분 후 URL 활성화.

---

## 🎨 디자인 시스템

### 색상 (Design Lock — 변경 금지)

```css
--bg: #0A0E14;              /* 배경 (가장 진함) */
--bg-elev-1: #0F1419;       /* 카드 배경 */
--accent: #00D9A3;          /* 단일 강조색 (민트) */
--amber: #F2C94C;           /* 보조 강조 (amber, 드물게) */
--text: #E6EDF3;            /* 주요 텍스트 */
```

강조색은 민트(`--accent`) 하나. 새 색 추가 금지.

### 폰트

| 역할 | 패밀리 | 로드 |
|------|--------|------|
| Display | Space Grotesk | Google Fonts |
| Body | Pretendard Variable | jsdelivr CDN |
| Mono | JetBrains Mono | Google Fonts |

---

## 📊 슬라이드 구성 (10장)

| # | ID | 제목 | 내용 |
|---|----|----|------|
| ① | `#overview` | 고객을 읽고, 시스템으로 풉니다 | +433% 증거 라인 · 카운터 애니메이션 |
| ② | `#snapshot` | 한눈에 | 프로필 · 핵심 지표 3 · 역량 카드 2×2 |
| ③ | `#loop` | 캠페인이 아니라, 루프로 일합니다 | 가설→실험→설계→측정→반복 플로우 · AARRR 띠 |
| ④ | `#funnel` | 실제로 이렇게 굴렸다 | SVG 사다리꼴 퍼널 · 인지/관심/고려/전환 스테이지 · 채널 레이어 |
| ⑤ | `#cases` | 매출이 안 나올 때, 무엇부터 봤나 | 판단 흐름 4단계 + 전국 3건 vs 저 16건 비교막대 |
| ⑥ | `#quality` | '많이'가 아니라 '맞는 사람'을 데려왔다 | 리드·등록 단가 before→after · 리텐션 14%→39% |
| ⑦ | `#decision` | 잘 되던 채널도, 본질에 안 맞으면 끊습니다 | 카카오 채널 손절 가설/발견/결정 · 이식성 선언 |
| ⑧ | `#performance` | 예산이 아니라, 머리로 만든 효율입니다 | 문의 ~2만원 · 등록 ~50만원 단위경제성 |
| ⑨ | `#about` | 개발·일본어·AI — 이건 도구다 | 도구 활용 선언 · AI 파이프라인 소개 |
| ⑩ | `#contact` | 함께 일하고 싶습니다 | 이메일 · 전화 · 노션 CTA |

### 슬라이드 내비게이션

| 방법 | 동작 |
|------|------|
| 키보드 `← →` | 이전/다음 슬라이드 |
| 마우스 휠 / 트랙패드 | 좌우 1칸 (관성 잠금으로 2칸 점프 방지) |
| 하단 점 클릭 | 해당 슬라이드로 바로 이동 |
| `< 1024px` | 세로 스크롤로 자동 전환 |

---

## 🔢 핵심 수치 (검증 기준)

| 수치 | 값 | 맥락 |
|------|-----|------|
| 역주행 성장 | +433% | 전국 18개 지점 동일 조건, 2년차 월평균 기준 |
| 문의 획득단가 | ~2만원 | 개인 사비 광고비, 월 10~30만원 상한 |
| 등록 단위경제성 | ~50만원 | 등록 1건당 매출 기준 |
| 직접 제작 콘텐츠 | 1,143건 | 네이버 블로그, AI 파이프라인 활용 26개월 |
| 리텐션 | 14% → 39% | 추가매출 비중, 1년차 → 2년차 |
| 등록률 | 68% | 방문 상담 → 등록 전환율 |

※ ROAS 배수(`25x`) · 생산성 배수(`7.5배`) 등 외부 검증이 어려운 계산값은 의도적으로 제거했습니다.

---

## 🔧 커스터마이징

### 연락처 변경

`index.html`에서 `#contact` 섹션을 검색하여 수정하세요.

### 색상 변경

`styles.css` 상단 `:root` 변수를 수정하세요.

```css
:root {
  --accent: #00D9A3;  /* 강조색 */
}
```

### 슬라이드 내비게이션 민감도

`script.js`의 `wheelLocked` 잠금 타이머(기본 120ms)와 임계값(기본 90)을 조정하세요.

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
