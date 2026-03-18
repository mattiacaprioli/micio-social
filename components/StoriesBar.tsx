import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import styled from "styled-components/native";
import { hp, wp } from "@/helpers/common";
import { fetchFeedStories } from "@/services/storyService";
import { UserStoryGroup } from "@/services/types";
import StoryAvatar from "@/components/StoryAvatar";

interface StoriesBarProps {
  currentUserId: string;
  currentUserImage: string | null;
  onStoryPress: (group: UserStoryGroup, groupIndex: number) => void;
  onAddStoryPress: () => void;
  onGroupsLoaded: (groups: UserStoryGroup[]) => void;
  refetchSignal: number;
}

const BarContainer = styled.View`
  height: ${hp(12)}px;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  justify-content: center;
`;

const StoriesBar: React.FC<StoriesBarProps> = ({
  currentUserId,
  currentUserImage,
  onStoryPress,
  onAddStoryPress,
  onGroupsLoaded,
  refetchSignal,
}) => {
  const [groups, setGroups] = useState<UserStoryGroup[]>([]);

  useEffect(() => {
    if (!currentUserId) return;
    fetchFeedStories(currentUserId).then((res) => {
      if (res.success && res.data) {
        // Ensure current user slot always exists at index 0
        let fetched = res.data;
        const hasCurrentUser = fetched.some((g) => g.userId === currentUserId);
        if (!hasCurrentUser) {
          fetched = [
            {
              userId: currentUserId,
              userName: "Your Story",
              userImage: currentUserImage,
              stories: [],
              hasUnseenStory: false,
            },
            ...fetched,
          ];
        }
        setGroups(fetched);
        onGroupsLoaded(fetched);
      } else {
        // Always show at least the "add story" slot
        const fallback: UserStoryGroup[] = [
          {
            userId: currentUserId,
            userName: "Your Story",
            userImage: currentUserImage,
            stories: [],
            hasUnseenStory: false,
          },
        ];
        setGroups(fallback);
        onGroupsLoaded(fallback);
      }
    });
  }, [currentUserId, refetchSignal]);

  return (
    <BarContainer>
      <FlatList
        data={groups}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => {
          const isCurrentUser = item.userId === currentUserId;
          return (
            <StoryAvatar
              group={item}
              isCurrentUser={isCurrentUser}
              onPress={() => {
                if (isCurrentUser && item.stories.length === 0) {
                  onAddStoryPress();
                } else {
                  onStoryPress(item, index);
                }
              }}
            />
          );
        }}
      />
    </BarContainer>
  );
};

export default StoriesBar;
