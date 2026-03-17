import React, { useEffect, useState } from "react";
import { View, TextInput, Image, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ThemeWrapper from "../../components/ThemeWrapper";
import Button from "../../components/Button";
import PrimaryModal from "../../components/PrimaryModal";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../context/AuthContext";
import { createStory } from "../../services/storyService";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";

const Container = styled.View`
  flex: 1;
  background-color: black;
`;

const PreviewImage = styled(Image)`
  flex: 1;
`;

const BottomBar = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${wp(4)}px;
  padding-bottom: ${hp(4)}px;
  gap: ${hp(1.5)}px;
  background-color: rgba(0, 0, 0, 0.5);
`;

const CaptionInput = styled(TextInput)`
  color: white;
  font-size: ${hp(2)}px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  padding: ${hp(1)}px ${wp(3)}px;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: ${hp(5)}px;
  left: ${wp(4)}px;
  width: ${hp(5)}px;
  height: ${hp(5)}px;
  border-radius: ${hp(2.5)}px;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const NewStory: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { modalRef, showError } = useModal();
  const theme = useStyledTheme();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    openPicker();
  }, []);

  const openPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      router.back();
      return;
    }

    setImageUri(result.assets[0].uri);
  };

  const onShare = async () => {
    if (!imageUri || !user?.id) return;

    setLoading(true);
    const res = await createStory({
      userId: user.id,
      imageUri,
      caption: caption.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      router.back();
    } else {
      showError(res.msg ?? "Failed to share story", "Error");
    }
  };

  if (!imageUri) return null;

  return (
    <ThemeWrapper>
      <Container>
        <PreviewImage source={{ uri: imageUri }} resizeMode="cover" />

        <CloseButton onPress={() => router.back()}>
          <Icon name="arrowLeft" size={hp(2.5)} color="white" />
        </CloseButton>

        <BottomBar>
          <CaptionInput
            placeholder="Add a caption…"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={caption}
            onChangeText={setCaption}
            multiline
          />
          <Button
            title="Share Story"
            loading={loading}
            onPress={onShare}
            hasShadow={false}
            buttonStyle={{ height: hp(5.5) }}
          />
        </BottomBar>

        <PrimaryModal ref={modalRef} />
      </Container>
    </ThemeWrapper>
  );
};

export default NewStory;
