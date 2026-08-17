# 🐾 Petmily_FE

반려동물 보호자와 돌봄이를 지역 기반으로 연결하고, 반려생활 정보를 공유할 수 있는 **Petmily 웹 서비스의 Frontend 프로젝트**입니다.

React 기반으로 사용자 인터페이스를 구현하고 Spring Boot REST API와 연동했으며,
회원 인증부터 반려동물 관리, 게시판, 위치 기반 돌봄 게시글 조회 기능을 제공합니다.

---

## 📌 프로젝트 소개

Petmily는 반려동물 보호자와 돌봄이가 필요한 사용자들을 연결하기 위한 서비스입니다.

단순한 커뮤니티 게시판을 넘어 사용자의 실제 위치를 기반으로 돌봄 구인·구직 게시글을 작성하고, 지도에서 주변 게시글을 확인할 수 있도록 구현했습니다.

Frontend에서는 사용자 인터페이스뿐만 아니라 **인증 상태 관리, API 요청 공통화, CSRF 처리, 인증 만료에 따른 토큰 재발급, 위치 정보 처리** 등을 담당합니다.

---

## 🛠 Tech Stack

### Frontend

* React 19
* JavaScript
* React Router DOM
* Styled Components

### API / Data

* Axios
* Day.js

### Build

* Vite

### External API

* Kakao OAuth
* Kakao Maps JavaScript API
* Browser Geolocation API

### Backend

* Spring Boot REST API

---

## 🏗 Architecture

```text
┌─────────────────────────────┐
│           Browser           │
│                             │
│ React / React Router        │
│ Styled Components           │
└──────────────┬──────────────┘
               │
               │ Axios
               │ withCredentials
               ▼
┌─────────────────────────────┐
│      Axios Interceptor      │
│                             │
│ CSRF Token 처리             │
│ 인증 만료 처리              │
│ Access Token 재발급 요청    │
│ 실패 요청 자동 재시도       │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│    Spring Boot Backend      │
│                             │
│ Spring Security             │
│ JWT / HttpOnly Cookie       │
│ JPA / Hibernate             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│            MySQL            │
└─────────────────────────────┘
```

---

## ✨ 주요 기능

### 👤 회원 및 인증

* 회원가입
* 이메일 인증
* 일반 로그인
* Kakao OAuth 로그인
* 로그아웃
* 로그인 상태 유지
* 회원 정보 조회
* 닉네임 수정
* 비밀번호 변경
* 회원 탈퇴
* 인증 여부에 따른 페이지 접근 제어

React Context를 통해 전역 인증 상태를 관리하고, 로그인 여부에 따라 접근 가능한 Route를 구분했습니다.

```text
비로그인 사용자
 ├─ 회원가입
 ├─ 로그인
 └─ 게시글 조회

로그인 사용자
 ├─ 게시글 작성 / 수정
 ├─ 내 정보
 ├─ 비밀번호 변경
 ├─ 반려동물 관리
 └─ 로그아웃
```

---

## 🔐 인증 및 CSRF 처리

Petmily는 Backend에서 발급한 인증 정보를 **HttpOnly Cookie 기반**으로 전달받도록 구성했습니다.

Axios 인스턴스에 `withCredentials: true`를 적용하여 API 요청 시 인증 Cookie가 함께 전달되도록 했습니다.

또한 Cookie 기반 인증에서 발생할 수 있는 CSRF 공격에 대응하기 위해 CSRF Token을 별도로 처리합니다.

### CSRF 요청 흐름

```text
POST / PATCH / DELETE 요청
        ↓
Axios Request Interceptor
        ↓
CSRF Token 확인
        ↓
Token이 없거나 만료됨
        ↓
GET /api/auth/csrf
        ↓
CSRF Token 발급
        ↓
X-XSRF-TOKEN Header 설정
        ↓
API 요청
```

발급받은 CSRF Token은 일정 시간 캐싱하여 매 요청마다 CSRF API를 호출하지 않도록 구성했습니다.

---

## 🔄 인증 만료 및 자동 재발급

API 응답에서 인증 만료가 확인되면 Axios Response Interceptor에서 인증 재발급을 처리합니다.

```text
API 요청
   ↓
401 / 인증 관련 403 발생
   ↓
CSRF Token 확보
   ↓
POST /api/auth/reissue
   ↓
Access Token 재발급
   ↓
기존 요청 자동 재시도
```

재발급까지 실패한 경우 로컬에 저장한 사용자 식별 정보를 제거하여 잘못된 로그인 상태가 유지되지 않도록 처리했습니다.

이를 통해 각 Component에서 토큰 만료 처리 로직을 반복해서 작성하지 않고 **Axios 계층에서 인증 관련 로직을 공통 처리**하도록 구성했습니다.

---

## 🟡 Kakao OAuth 로그인

일반 로그인 외에도 Kakao OAuth 로그인을 지원합니다.

```text
Kakao 로그인 선택
       ↓
Kakao OAuth 인증 페이지
       ↓
사용자 인증
       ↓
Callback
       ↓
Backend 인증 처리
       ↓
GET /api/auth
       ↓
사용자 인증 상태 확인
       ↓
React AuthContext 업데이트
```

OAuth 로그인 진행 여부는 `sessionStorage`를 이용해 관리하고, 인증 완료 후 사용자 정보를 조회하여 React의 인증 상태에 반영합니다.

---

## 📧 이메일 인증 회원가입

회원가입 과정에서 이메일 인증 절차를 적용했습니다.

```text
이메일 입력
    ↓
인증번호 발송
POST /api/auth/email/send
    ↓
인증번호 입력
    ↓
인증번호 검증
POST /api/auth/email/verify
    ↓
회원가입 진행
POST /api/users
```

이메일 인증이 완료된 후 회원가입을 진행하도록 구성했습니다.

---

## 🐶 반려동물 관리

사용자는 자신의 반려동물을 등록하고 관리할 수 있습니다.

### 주요 기능

* 내 반려동물 목록 조회
* 반려동물 등록
* 반려동물 정보 수정
* 반려동물 삭제
* 이미지가 포함된 반려동물 정보 전송
* 돌봄 구인글 작성 시 등록한 반려동물 선택

이미지를 포함한 데이터를 서버로 전달하기 위해 `FormData`를 사용합니다.

```text
React PetForm
     ↓
FormData 생성
     ↓
반려동물 정보 + 이미지
     ↓
Spring Boot API
```

---

## 📝 게시판

게시판은 목적에 따라 다음 카테고리로 구분했습니다.

| Category     | 설명     |
| ------------ | ------ |
| CARE_REQUEST | 돌봄이 구인 |
| CARE_OFFER   | 돌봄이 구직 |
| COMMUNITY    | 자유게시판  |
| QNA          | Q&A    |

### 게시글 기능

* 게시글 목록 조회
* 게시글 상세 조회
* 게시글 작성
* 게시글 수정
* 게시글 삭제
* 제목 및 내용 검색
* 정렬
* 모집 상태 필터링
* Pagination
* 댓글 작성 / 수정 / 삭제

---

## 🔍 게시글 검색 및 정렬

게시글 목록 상태를 URL Query Parameter와 연동했습니다.

```text
/posts
 ?category=CARE_REQUEST
 &page=0
 &keyword=검색어
 &sort=modifiedAt,desc
 &status=WAITING
```

검색이나 정렬 조건이 변경되면 Query Parameter를 갱신하고 해당 조건으로 Backend API를 다시 호출합니다.

### 지원 정렬

* 최신순
* 조회수순
* 가격 낮은순
* 가격 높은순

돌봄 게시판에서는 추가로 모집 상태에 따라 게시글을 필터링할 수 있습니다.

* 전체
* 모집중
* 완료

---

## 📍 위치 기반 돌봄 게시글

돌봄 구인·구직 게시글은 위치 정보를 기반으로 작성할 수 있습니다.

Browser Geolocation API를 이용해 사용자의 현재 위치를 가져오고, Kakao Maps API를 통해 좌표를 실제 지역 정보로 변환합니다.

```text
위치 인증
   ↓
Browser Geolocation API
   ↓
Latitude / Longitude
   ↓
Kakao Maps Geocoder
   ↓
시/도 · 시/군/구 · 읍/면/동 변환
   ↓
게시글 위치 정보 저장
```

위치 인증 결과로 다음 정보를 게시글에 저장하도록 구성했습니다.

* latitude
* longitude
* province
* city
* district

---

## 🗺️ Kakao Maps 게시글 조회

돌봄 구인·구직 게시글은 일반 목록뿐만 아니라 지도에서도 확인할 수 있습니다.

```text
돌봄 게시판
    ↓
지도보기
    ↓
Kakao Maps SDK Load
    ↓
게시글 목록 API 요청
    ↓
위도 / 경도 확인
    ↓
Kakao Map Marker 생성
```

게시글의 위치 정보를 기반으로 지도에 Marker를 생성하고, Marker를 선택하여 해당 게시글로 이동할 수 있도록 구현했습니다.

현재 위치를 가져올 수 있는 경우 사용자의 위치를 기준으로 지도를 표시하고, 위치 정보를 가져오지 못한 경우에도 기본 위치를 사용해 지도를 표시하도록 처리했습니다.

---

## 💬 댓글

게시글 상세 페이지에서 댓글 기능을 제공합니다.

* 댓글 목록 조회
* 댓글 작성
* 본인 댓글 수정
* 본인 댓글 삭제

현재 로그인한 사용자의 ID와 댓글 작성자 ID를 비교하여 본인이 작성한 댓글에만 수정 및 삭제 기능이 표시되도록 구현했습니다.

---

## 🚧 작성 중 페이지 이탈 방지

회원가입, 게시글 작성/수정, 회원정보 수정, 반려동물 등록 등 사용자가 데이터를 입력하는 페이지에서 실수로 페이지를 이동해 입력 내용이 사라지는 문제를 방지했습니다.

공통 Hook인 `useNavigationGuard`를 구현하여 React Router 내부 이동과 브라우저 종료/새로고침을 모두 처리합니다.

```text
사용자 입력
   ↓
isDirty = true
   ↓
페이지 이동 시도
   ↓
Navigation Guard
   ↓
"작성 중인 내용이 사라집니다."
   ↓
이동 / 취소 선택
```

반복되는 이탈 방지 로직을 Custom Hook으로 분리하여 여러 Form Component에서 재사용합니다.

---

## ⚠️ API Error Handling

API 오류 메시지를 공통 처리하기 위해 `getApiErrorMessage()`를 구현했습니다.

Backend 응답 구조에 따라 다음 값을 확인하여 사용자에게 전달할 오류 메시지를 결정합니다.

```text
response.data
 ├─ message
 ├─ error
 ├─ detail
 └─ errors
```

이를 통해 모든 오류를 단순한 `서버 오류`로 표시하지 않고 Backend에서 전달한 구체적인 오류 메시지를 화면에 표시할 수 있도록 구성했습니다.

---

## 📂 Project Structure

```text
src/
├── component/
│   ├── common/
│   │   └── LocationAuthModal.jsx
│   │
│   ├── pets/
│   │   ├── PetForm.jsx
│   │   ├── PetList.jsx
│   │   └── PetManagement.jsx
│   │
│   ├── posts/
│   │   ├── CommentSection.jsx
│   │   ├── PostCreate.jsx
│   │   ├── PostDetail.jsx
│   │   ├── PostList.jsx
│   │   ├── PostMap.jsx
│   │   ├── PostPage.jsx
│   │   └── PostUpdate.jsx
│   │
│   ├── users/
│   │   ├── KakaoCallback.jsx
│   │   ├── Login.jsx
│   │   ├── MyInfo.jsx
│   │   ├── MyInfoUpdate.jsx
│   │   ├── PasswordUpdate.jsx
│   │   └── Signup.jsx
│   │
│   ├── Home.jsx
│   └── Navbar.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│   └── useNavigationGuard.jsx
│
├── styles/
│   ├── GlobalStyle.js
│   ├── theme.js
│   └── ui.js
│
├── utils/
│   └── auth.js
│
├── api.js
├── App.jsx
└── main.jsx
```

---

## 🔗 Backend Repository

Petmily의 Backend는 별도의 Spring Boot 프로젝트로 구성되어 있습니다.

👉 **Petmily_BE:** `Backend GitHub Repository URL`

---

## 📖 상세 개발 기록

README에서는 프로젝트의 전체 구조와 주요 기능을 중심으로 설명하고,
구현 과정에서 발생한 문제와 해결 과정은 Notion에 별도로 정리했습니다.

### 주요 기술 기록

* HttpOnly Cookie 기반 JWT 인증
* CSRF Token 처리
* Axios Interceptor 기반 인증 공통화
* Access Token 자동 재발급
* React 인증 상태 관리
* Kakao OAuth 연동
* 이메일 인증
* Kakao Maps 위치 인증
* 위치 기반 게시글 지도 표시
* API Error Handling
* Navigation Guard 구현

👉 **Notion:** `Petmily 개발 기록 URL`

---

## 🚀 실행 방법

### 1. Repository Clone

```bash
git clone <repository-url>
cd Petmily_FE
```

### 2. Dependency 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일에 Backend API와 Kakao OAuth 관련 환경 변수를 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
VITE_KAKAO_REDIRECT_URI=YOUR_KAKAO_REDIRECT_URI
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. Production Build

```bash
npm run build
```

---

## 👨‍💻 Developer

**김우현**

React와 Spring Boot를 이용하여 Frontend와 Backend가 실제로 연동되는 웹 서비스를 구현하고, 단순 UI 구현을 넘어 **인증·보안·API 통신·위치 기반 기능까지 전체 웹 서비스 흐름을 직접 설계하고 구현하는 것**을 목표로 개발했습니다.
