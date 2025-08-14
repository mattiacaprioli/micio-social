import React, { useEffect, useState, useCallback } from "react";
import { FlatList, RefreshControl, Alert, View, Text } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useFocusEffect, useRouter } from "expo-router";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import { wp, hp } from "../../../helpers/common";
import Icon from "../../../assets/icons";
import Header from "../../../components/Header";
import Loading from "../../../components/Loading";
import { usePathname } from "expo-router";

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const Pets: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  return (
    <ThemeWrapper>
      <Container theme={theme}>
        <Header title="Pets" />

        <ContentContainer>
          <View>
            <Text>Pets</Text>
          </View>
        </ContentContainer>
      </Container>
    </ThemeWrapper>
  );
};

export default Pets;
