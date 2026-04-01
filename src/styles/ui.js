import styled, { css } from "styled-components";

export const PageContainer = styled.section`
  padding: 10px 0 14px;

  @media (max-width: 640px) {
    padding: 8px 0 12px;
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: 14px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.md};
  }

  @media (max-width: 640px) {
    padding: 12px;
    border-radius: ${({ theme }) => theme.radius.md};
  }
`;

export const Title = styled.h2`
  margin: 0 0 16px;
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.2;
  letter-spacing: -0.01em;

  @media (max-width: 640px) {
    margin-bottom: 12px;
  }
`;

export const SubTitle = styled.h3`
  margin: 0 0 12px;
  font-size: clamp(18px, 2.2vw, 24px);
  letter-spacing: -0.01em;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const fieldBase = css`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 11px 13px;
  background: #fff;
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
  }
`;

export const Input = styled.input`
  ${fieldBase}
`;

export const TextArea = styled.textarea`
  ${fieldBase}
  resize: vertical;
`;

export const Select = styled.select`
  ${fieldBase}
`;

export const HelperText = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${({ theme, danger }) => (danger ? theme.colors.danger : theme.colors.muted)};
`;

export const Button = styled.button`
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 11px 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: white;
  background: ${({ theme, variant }) => {
    if (variant === "secondary") return "#64748b";
    if (variant === "danger") return theme.colors.danger;
    if (variant === "sky") return theme.colors.secondary;
    return theme.colors.primary;
  }};
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.22);

  &:hover {
    transform: translateY(-1px);
    opacity: 0.96;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

export const GhostButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: none;
`;
