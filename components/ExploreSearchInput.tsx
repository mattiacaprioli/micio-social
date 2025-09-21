import React from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useRouter } from "expo-router";
import Icon from "../assets/icons";
import { hp, wp } from "../helpers/common";

interface ExploreSearchInputProps {
  placeholder?: string;
}

const Container = styled.View`
  margin-horizontal: ${wp(4)}px;
  margin-top: ${hp(1)}px;
  margin-bottom: ${hp(1.5)}px;
`;

const SearchContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.colors.darkLight};
  border-radius: ${(props) => props.theme.radius.xl}px;
  padding: ${hp(1.2)}px ${wp(4)}px;
  border-width: 1px;
  border-color: ${(props) => props.theme.colors.gray};
`;

const SearchIcon = styled.View`
  margin-right: ${wp(3)}px;
`;

const PlaceholderText = styled.Text`
  flex: 1;
  font-size: ${hp(1.8)}px;
  color: ${(props) => props.theme.colors.textLight};
  font-weight: ${(props) => props.theme.fonts.medium};
`;

const ExploreSearchInput: React.FC<ExploreSearchInputProps> = ({
  placeholder = "Search users..."
}) => {
  const theme = useStyledTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push("/(main)/search");
  };

  return (
    <Container>
      <SearchContainer onPress={handlePress} activeOpacity={0.8}>
        <SearchIcon>
          <Icon 
            name="search" 
            size={hp(2.2)} 
            color={theme.colors.textLight} 
          />
        </SearchIcon>
        <PlaceholderText>{placeholder}</PlaceholderText>
      </SearchContainer>
    </Container>
  );
};

export default ExploreSearchInput;
