import React from 'react'
import styled from 'styled-components/native'
import { useRouter, Router } from 'expo-router'
import BackButton from './BackButton'
import { hp } from '../helpers/common'
import { theme } from '../constants/theme'

// Styled Components
const Container = styled.View<{ mb: number }>`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  gap: 10px;
  margin-bottom: ${(props) => props.mb}px;
`;

const Title = styled.Text`
  font-size: ${hp(2.7)}px;
  font-weight: ${theme.fonts.semibold};
  color: ${theme.colors.textDark};
`;

const BackButtonContainer = styled.View`
  position: absolute;
  left: 0;
`;

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  mb?: number;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  mb = 10
}) => {
  const router = useRouter();

  return (
    <Container mb={mb}>
      {showBackButton && (
        <BackButtonContainer>
          <BackButton router={router} />
        </BackButtonContainer>
      )}
      <Title>{title || ""}</Title>
    </Container>
  )
}

export default Header