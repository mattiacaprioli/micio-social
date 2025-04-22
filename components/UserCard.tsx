import React from "react";
import styled from "styled-components/native";
import { TouchableOpacity, View } from "react-native";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import { UserWithBasicInfo } from "../services/userService";

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
  background-color: white;
  border-radius: ${theme.radius.lg}px;
  border-width: 0.5px;
  border-color: ${theme.colors.gray};
`;

const UserInfo = styled.View`
  flex: 1;
  margin-left: ${wp(3)}px;
`;

const UserName = styled.Text`
  font-size: ${hp(1.8)}px;
  font-weight: ${theme.fonts.medium};
  color: ${theme.colors.text};
`;

const UserBio = styled.Text`
  font-size: ${hp(1.5)}px;
  color: ${theme.colors.textLight};
  margin-top: ${hp(0.5)}px;
`;

const UserCard: React.FC<UserCardProps> = ({ user, onPress, currentUserId }) => {
  return (
    <Container onPress={() => onPress(user.id)}>
      <Avatar
        uri={user.image}
        size={hp(6)}
        rounded={theme.radius.xl}
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
