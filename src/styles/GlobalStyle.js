import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100%;
  }

  body {
    font-family: "Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: ${({ theme }) => theme.colors.text};
    background:
      radial-gradient(900px 420px at 0% -10%, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0) 60%),
      radial-gradient(760px 380px at 100% -10%, rgba(14, 165, 233, 0.14) 0%, rgba(14, 165, 233, 0) 60%),
      ${({ theme }) => theme.colors.bg};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.18s ease;
  }

  button, input, textarea, select {
    font: inherit;
  }

  input, textarea, select {
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.md};
    padding: 11px 13px;
    background: #fff;
    color: ${({ theme }) => theme.colors.text};
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
  }

  button {
    cursor: pointer;
    border: none;
    border-radius: ${({ theme }) => theme.radius.md};
    padding: 10px 14px;
    font-weight: 700;
    transition: transform 0.14s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }

  button:active {
    transform: translateY(1px);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
  }

  th, td {
    border-bottom: 1px solid #eef2f7;
    padding: 10px;
  }

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
  }

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c7d2fe;
    border-radius: 999px;
    border: 2px solid #eef2ff;
  }
`;

export default GlobalStyle;
