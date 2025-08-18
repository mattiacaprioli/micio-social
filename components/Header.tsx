import React from 'react'
import styled from 'styled-components/native'
import { useRouter, Router } from 'expo-router'
import BackButton from './BackButton'
import { hp } from '../helpers/common'
import { Theme } from '../constants/theme'
import { useTheme } from '../context/ThemeContext'
import { useTheme as useStyledTheme } from 'styled-components/native'

// Styled Components
const Container = styled.View<{ mb: number }>`
  position: relative;
  top: 0;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: ${(props) => props.theme.colors.background};
  height: ${hp(5.5)}px;
  z-index: 10;
`;

const Title = styled.Text<{ theme: Theme }>`
  font-size: ${hp(2.7)}px;
  font-weight: ${props => props.theme.fonts.semibold};
  color: ${props => props.theme.colors.textDark};
`;

const BackButtonContainer = styled.View`
  position: absolute;
  left: 12;
`;

const RightButtonContainer = styled.View`
  position: absolute;
  right: 12;
`;

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightButton?: React.ReactNode;
  mb?: number;
  theme?: Theme;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  rightButton,
  mb = 10
}) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  return (
    <Container mb={mb}>
      {showBackButton && (
        <BackButtonContainer>
          <BackButton router={router} />
        </BackButtonContainer>
      )}
      <Title>{title || ""}</Title>
      {rightButton && (
        <RightButtonContainer>
          {rightButton}
        </RightButtonContainer>
      )}
    </Container>
  )
}

export default Header