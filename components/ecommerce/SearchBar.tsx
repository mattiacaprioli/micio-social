import React from "react";
import styled from "styled-components/native";
import Icon from "../../assets/icons";
import { hp, wp } from "../../helpers/common";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Container = styled.View`
  margin-horizontal: ${wp(4)}px;
  margin-vertical: ${hp(1)}px;
`;

const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.colors.card};
  border: 1px solid ${(props) => props.theme.colors.cardBorder};
  border-radius: ${wp(3)}px;
  padding: ${hp(0.1)}px ${wp(3)}px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: ${wp(4)}px;
  color: ${(props) => props.theme.colors.text};
  margin-left: ${wp(3)}px;
`;

const ClearButton = styled.TouchableOpacity`
  padding: ${wp(1)}px;
`;

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Cerca prodotti...",
  onFocus,
  onBlur,
}) => {
  return (
    <Container>
      <SearchContainer>
        <Icon
          name="search"
          size={wp(5)}
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
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {value.length > 0 && (
          <ClearButton onPress={() => onChangeText('')}>
            <Icon
              name="x"
              size={wp(5)}
              color="#666"
            />
          </ClearButton>
        )}
      </SearchContainer>
    </Container>
  );
};

export default SearchBar;