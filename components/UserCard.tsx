import React from "react";
import styled from "styled-components/native";
import { TouchableOpacity, View } from "react-native";
import { hp, wp } from "../helpers/common";
import { useTheme as useStyledTheme } from "styled-components/native";
import Avatar from "./Avatar";
import { UserWithBasicInfo } from "../services/userService";
import { useTheme } from "../context/ThemeContext";

interface UserCardProps {
  user: UserWithBasicInfo;
  onPress: (userId: string) => void;
  currentUserId?: string;
}

// Styled Components
const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${hp(1.5)}px ${wp(3)}px;
  margin-bottom: ${hp(1)}px;
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.lg}px;
  border-width: 0.5px;
  border-color: ${props => props.theme.colors.gray};
`;

const UserInfo = styled.View`
  flex: 1;
  margin-left: ${wp(3)}px;
`;

const UserName = styled.Text`
  font-size: ${hp(1.8)}px;
  font-weight: ${props => props.theme.fonts.medium};
  color: ${props => props.theme.colors.text};
`;

const UserBio = styled.Text`
  font-size: ${hp(1.5)}px;
  color: ${props => props.theme.colors.textLight};
  margin-top: ${hp(0.5)}px;
`;

const UserCard: React.FC<UserCardProps> = ({ user, onPress, currentUserId }) => {
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  return (
    <Container onPress={() => onPress(user.id)}>
      <Avatar
        uri={user.image}
        size={hp(6)}
        rounded={theme.radius.xl}
        isDarkMode={isDarkMode}
      />
      <UserInfo>
        <UserName>{user.name}</UserName>
        {user.bio && (
          <UserBio numberOfLines={1} ellipsizeMode="tail">
            {user.bio}
          </UserBio>
        )}
      </UserInfo>
    </Container>
  );
};

export default UserCard;
