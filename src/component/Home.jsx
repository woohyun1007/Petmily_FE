import styled from "styled-components";
import { Link } from "react-router-dom";
import { Card, PageContainer, Title } from "../styles/ui";

const Hero = styled(Card)`
    position: relative;
    overflow: hidden;
    padding: 34px;
    background: ${({ theme }) => theme.gradients.hero};
    color: white;
    border: none;
    box-shadow: ${({ theme }) => theme.shadow.lg};

    &::after {
        content: "";
        position: absolute;
        width: 240px;
        height: 240px;
        right: -40px;
        top: -70px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.16);
    }
`;

const HeroTitle = styled(Title)`
    margin-bottom: 10px;
    color: white;
`;

const HeroDesc = styled.p`
    margin: 0;
    max-width: 720px;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.95);
`;

const Description = styled.p`
    margin: 6px 0 0;
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 14px;
`;

const Grid = styled.div`
    margin-top: 16px;
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));

    @media (max-width: 960px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
`;

const FeatureTitle = styled.h3`
    margin: 0;
    font-size: 17px;
    color: ${({ theme }) => theme.colors.text};
`;

const Go = styled(Link)`
    display: inline-flex;
    margin-top: 10px;
    font-size: 13px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
`;

const QuickActions = styled(Card)`
    margin-top: 14px;
    background: ${({ theme }) => theme.colors.surfaceSoft};
`;

const ActionRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const ActionButton = styled(Link)`
    padding: 10px 14px;
    border-radius: ${({ theme }) => theme.radius.pill};
    background: white;
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    font-weight: 700;
    box-shadow: ${({ theme }) => theme.shadow.sm};

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
        border-color: #cdd8ff;
    }
`;

const Home = () => {
    return (
        <PageContainer>
                        <Hero>
                                <HeroTitle>Petmily에 오신 걸 환영해요 🐾</HeroTitle>
                                <HeroDesc>
                                    반려동물 돌봄 구인·구직부터 커뮤니티까지,
                                    우리 동네 기반으로 빠르게 연결되는 펫 라이프 플랫폼.
                                </HeroDesc>
                        </Hero>

                        <Grid>
                            <Card>
                                <FeatureTitle>돌봄이 구인</FeatureTitle>
                                <Description>검증된 위치 인증 기반으로 믿을 수 있는 돌봄이를 찾아보세요.</Description>
                                <Go to="/posts?category=CARE_REQUEST">게시판 바로가기 →</Go>
                            </Card>

                            <Card>
                                <FeatureTitle>돌봄이 구직</FeatureTitle>
                                <Description>내 위치와 가능한 시간대를 설정하고 빠르게 매칭을 시작하세요.</Description>
                                <Go to="/posts?category=CARE_OFFER">게시판 바로가기 →</Go>
                            </Card>

                            <Card>
                                <FeatureTitle>커뮤니티</FeatureTitle>
                                <Description>일상, 질문, 꿀팁을 공유하며 반려생활 정보를 함께 나눠요.</Description>
                                <Go to="/posts?category=COMMUNITY">게시판 바로가기 →</Go>
                            </Card>
                        </Grid>

                        <QuickActions>
                            <Title style={{ fontSize: "20px", marginBottom: "10px" }}>빠른 시작</Title>
                            <ActionRow>
                                <ActionButton to="/posts/create">새 글 작성</ActionButton>
                                <ActionButton to="/posts?category=CARE_REQUEST">구인글 보기</ActionButton>
                                <ActionButton to="/posts?category=CARE_OFFER">구직글 보기</ActionButton>
                                <ActionButton to="/pets">반려동물 관리</ActionButton>
                            </ActionRow>
                        </QuickActions>
        </PageContainer>
    );
};

export default Home;    