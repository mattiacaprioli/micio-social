import { View } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
}

interface ContainerProps {
  $paddingTop: number;
  $bg: string;
}

const Container = styled.View<ContainerProps>`
  flex: 1;
  padding-top: ${props => props.$paddingTop}px;
  background-color: ${props => props.$bg};
`;

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, bg = 'white' }) => {
  const { top } = useSafeAreaInsets()
  const paddingTop = top > 0 ? top + 5 : 30

  return (
    <Container $paddingTop={paddingTop} $bg={bg}>
      {children}
    </Container>
  )
}

export default ScreenWrapper