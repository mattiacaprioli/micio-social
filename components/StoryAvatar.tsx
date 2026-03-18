import React from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { hp, wp } from "@/helpers/common";
import Avatar from "@/components/Avatar";
import { UserStoryGroup } from "@/services/types";

interface StoryAvatarProps {
  group: UserStoryGroup;
  isCurrentUser?: boolean;
  onPress: () => void;
}

const Wrapper = styled.View`
  align-items: center;
  margin-horizontal: ${wp(1.5)}px;
`;

const Ring = styled.View<{ $seen: boolean }>`
  width: ${hp(7.5)}px;
  height: ${hp(7.5)}px;
  border-radius: ${hp(7.5) / 2}px;
  border-width: 2.5px;
  border-color: ${(props) =>
    props.$seen ? props.theme.colors.darkLight : props.theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const AddBadge = styled.View`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: ${hp(2.4)}px;
  height: ${hp(2.4)}px;
  border-radius: ${hp(1.2)}px;
  background-color: ${(props) => props.theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const AddBadgeText = styled.Text`
  color: white;
  font-size: ${hp(1.6)}px;
  line-height: ${hp(1.8)}px;
  font-weight: bold;
`;

const UserLabel = styled.Text`
  font-size: ${hp(1.4)}px;
  color: ${(props) => props.theme.colors.text};
  margin-top: 4px;
  text-align: center;
`;

const AvatarWrapper = styled.View`
  position: relative;
  width: ${hp(7.5)}px;
  height: ${hp(7.5)}px;
  justify-content: center;
  align-items: center;
`;

const StoryAvatar: React.FC<StoryAvatarProps> = ({
  group,
  isCurrentUser = false,
  onPress,
}) => {
  const theme = useStyledTheme();
  const showRing = group.stories.length > 0;
  const isSeen = showRing && !group.hasUnseenStory;
  const showAddBadge = isCurrentUser && group.stories.length === 0;

  const label = isCurrentUser
    ? "Your Story"
    : group.userName.length > 10
    ? group.userName.slice(0, 10) + "…"
    : group.userName;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Wrapper>
        {showRing ? (
          <Ring $seen={isSeen}>
            <Avatar
              uri={group.userImage}
              size={hp(6.2)}
              rounded={hp(6.2) / 2}
            />
          </Ring>
        ) : (
          <AvatarWrapper>
            <Avatar
              uri={group.userImage}
              size={hp(6.5)}
              rounded={hp(6.5) / 2}
            />
            {showAddBadge && (
              <AddBadge>
                <AddBadgeText>+</AddBadgeText>
              </AddBadge>
            )}
          </AvatarWrapper>
        )}
        <UserLabel numberOfLines={1}>{label}</UserLabel>
      </Wrapper>
    </TouchableOpacity>
  );
};

export default StoryAvatar;
