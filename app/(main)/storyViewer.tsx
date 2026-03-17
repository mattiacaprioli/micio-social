import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useAuth } from "../../context/AuthContext";
import { markStoryViewed } from "../../services/storyService";
import { UserStoryGroup, Story } from "../../services/types";
import { getSupabaseFileUrl } from "../../services/imageService";
import Avatar from "../../components/Avatar";
import { hp, wp } from "../../helpers/common";

const STORY_DURATION = 5000;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Container = styled.View`
  flex: 1;
  background-color: black;
`;

const ProgressBarsRow = styled.View`
  flex-direction: row;
  gap: 3px;
  padding-horizontal: ${wp(2)}px;
  margin-bottom: ${hp(1)}px;
`;

const ProgressBarBg = styled.View`
  flex: 1;
  height: 2.5px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.4);
  overflow: hidden;
`;

const CloseButton = styled.TouchableOpacity`
  padding: 8px;
`;

const TopOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding-top: ${hp(5.5)}px;
  padding-horizontal: ${wp(3)}px;
  z-index: 10;
`;

const UserRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const UserName = styled.Text`
  color: white;
  font-size: ${hp(1.9)}px;
  font-weight: 600;
  flex: 1;
`;

const NavLeft = styled.TouchableOpacity`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 33%;
  z-index: 5;
`;

const NavRight = styled.TouchableOpacity`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 67%;
  z-index: 5;
`;

interface RouteParams {
  groupsJson: string;
  startGroupIndex: string;
  [key: string]: string;
}

const StoryViewer: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<RouteParams>();

  const groups: UserStoryGroup[] = JSON.parse(params.groupsJson ?? "[]");
  const [groupIndex, setGroupIndex] = useState(
    parseInt(params.startGroupIndex ?? "0", 10)
  );
  const [storyIndex, setStoryIndex] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const viewedSet = useRef(new Set<string>());
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentGroup = groups[groupIndex];
  const currentStory: Story | undefined =
    currentGroup?.stories[storyIndex];

  const startProgress = useCallback(() => {
    progress.setValue(0);
    animationRef.current?.stop();
    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    animationRef.current.start(({ finished }) => {
      if (finished) handleNext();
    });
  }, [groupIndex, storyIndex]);

  useEffect(() => {
    if (!currentStory) return;
    startProgress();

    if (user?.id && !viewedSet.current.has(currentStory.id)) {
      viewedSet.current.add(currentStory.id);
      markStoryViewed(currentStory.id, user.id);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [groupIndex, storyIndex]);

  const handleNext = useCallback(() => {
    if (!currentGroup) return;

    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1);
      setStoryIndex(0);
    } else {
      router.back();
    }
  }, [groupIndex, storyIndex, groups, currentGroup]);

  const handlePrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((g) => g - 1);
      setStoryIndex(prevGroup.stories.length - 1);
    }
  }, [groupIndex, storyIndex, groups]);

  if (!currentGroup || !currentStory) {
    router.back();
    return null;
  }

  const imageUrl = getSupabaseFileUrl(currentStory.file).uri;

  return (
    <Container>
      <Image
        source={{ uri: imageUrl }}
        style={{ flex: 1 }}
        contentFit="cover"
      />

      {/* Nav touch areas */}
      <NavLeft onPress={handlePrev} activeOpacity={1} />
      <NavRight onPress={handleNext} activeOpacity={1} />

      {/* Top overlay */}
      <TopOverlay style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
        {/* Progress bars */}
        <ProgressBarsRow>
          {currentGroup.stories.map((_, idx) => (
            <ProgressBarBg key={idx}>
              {idx === storyIndex ? (
                <Animated.View
                  style={{
                    height: "100%",
                    backgroundColor: "white",
                    borderRadius: 2,
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  }}
                />
              ) : (
                <View
                  style={{
                    height: "100%",
                    backgroundColor: idx < storyIndex ? "white" : "transparent",
                    borderRadius: 2,
                  }}
                />
              )}
            </ProgressBarBg>
          ))}
        </ProgressBarsRow>

        {/* User row */}
        <UserRow>
          <Avatar
            uri={currentGroup.userImage}
            size={hp(4.5)}
            rounded={hp(4.5) / 2}
          />
          <UserName>{currentGroup.userName}</UserName>
          <CloseButton onPress={() => router.back()}>
            <Text style={{ color: "white", fontSize: hp(2.5) }}>✕</Text>
          </CloseButton>
        </UserRow>
      </TopOverlay>

      {/* Caption */}
      {currentStory.caption ? (
        <View
          style={{
            position: "absolute",
            bottom: hp(6),
            left: wp(4),
            right: wp(4),
            zIndex: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: hp(2),
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
              textAlign: "center",
            }}
          >
            {currentStory.caption}
          </Text>
        </View>
      ) : null}
    </Container>
  );
};

export default StoryViewer;
