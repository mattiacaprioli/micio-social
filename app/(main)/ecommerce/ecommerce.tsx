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
  padding-top: ${hp(6)}px;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const Ecommerce: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title="Ecommerce" showBackButton={false} />
        </View>

        <Container theme={theme}>
          <ContentContainer>
          <View>
            <Text>Ecommerce</Text>
          </View>
          </ContentContainer>
        </Container>
      </View>
    </ThemeWrapper>
  );
};

export default Ecommerce;
