import React from "react";
import styled from "styled-components/native";
import Icon from "../../assets/icons";
import { hp, wp } from "../../helpers/common";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const Container = styled.View`
  margin-horizontal: 16px;
  margin-vertical: 8px;
`;

const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.colors.card};
  border: 1px solid ${(props) => props.theme.colors.cardBorder};
  border-radius: 12px;
  padding: 12px 16px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
  margin-left: 12px;
`;

const ClearButton = styled.TouchableOpacity`
  padding: 4px;
`;

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Cerca prodotti...",
}) => {
  return (
    <Container>
      <SearchContainer>
        <Icon
          name="search"
          size={20}
          color="#666"
        />
        <SearchInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {value.length > 0 && (
          <ClearButton onPress={() => onChangeText('')}>
            <Icon
              name="x"
              size={20}
              color="#666"
            />
          </ClearButton>
        )}
      </SearchContainer>
    </Container>
  );
};

export default SearchBar;