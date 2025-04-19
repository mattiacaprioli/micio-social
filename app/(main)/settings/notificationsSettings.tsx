import React, { useState } from "react";
import { Switch } from "react-native";
import styled from "styled-components/native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import Header from "../../../components/Header";
import { wp, hp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";
import { useTranslation } from 'react-i18next';

// Interfacce per i tipi
interface NotificationOption {
  label: string;
  value: boolean;
  toggle: () => void;
}

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: white;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const Card = styled.View`
  margin-top: ${hp(2)}px;
  background-color: ${theme.colors.darkLight};
  border-radius: ${theme.radius.xxl}px;
  padding-top: ${hp(1.5)}px;
  padding-bottom: ${hp(1.5)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  border-width: 0.5px;
  border-color: ${theme.colors.dark};
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
  gap: ${hp(2)}px;
`;

const Item = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: ${hp(1)}px;
  padding-bottom: ${hp(1)}px;
  padding-left: ${wp(3)}px;
  padding-right: ${wp(3)}px;
  border-radius: ${theme.radius.lg}px;
  background-color: white;
`;

const ItemText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${theme.colors.textDark};
  font-weight: 500;
`;

const NotificationsSettings: React.FC = () => {
  const [followersEnabled, setFollowersEnabled] = useState<boolean>(true);
  const [likesEnabled, setLikesEnabled] = useState<boolean>(true);
  const [commentsEnabled, setCommentsEnabled] = useState<boolean>(true);
  const { t } = useTranslation();

  const toggleFollowers = (): void => setFollowersEnabled((previousState) => !previousState);
  const toggleLikes = (): void => setLikesEnabled((previousState) => !previousState);
  const toggleComments = (): void => setCommentsEnabled((previousState) => !previousState);

  const settingsOptions: NotificationOption[] = [
    {
      label: t("newFollowers"),
      value: followersEnabled,
      toggle: toggleFollowers,
    },
    {
      label: t("likes"),
      value: likesEnabled,
      toggle: toggleLikes,
    },
    {
      label: t("comments"),
      value: commentsEnabled,
      toggle: toggleComments,
    },
  ];

  return (
    <ScreenWrapper bg="white">
      <Container>
        <Header title={t("notifications")} />
        <Card>
          {settingsOptions.map((option, index) => (
            <Item key={index}>
              <ItemText>{option.label}</ItemText>
              <Switch
                trackColor={{ false: theme.colors.dark, true: theme.colors.primary }}
                thumbColor={option.value ? theme.colors.primary : theme.colors.textLight}
                onValueChange={option.toggle}
                value={option.value}
              />
            </Item>
          ))}
        </Card>
      </Container>
    </ScreenWrapper>
  );
};

export default NotificationsSettings;
