import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native"; 
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components/native"; 
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../context/AuthContext";
import RichTextEditor from "../../components/RichTextEditor";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "../../assets/icons";
import Button from "../../components/Button";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { getSupabaseFileUrl } from "../../services/imageService";
import { Video } from "expo-av";
import { createOrUpdatePost } from "../../services/postService";

// Styled Components
const Container = styled.View`
  flex: 1;
  margin-bottom: 30px;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  gap: 15px;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const UserName = styled.Text`
  font-size: ${hp(2.2)}px;
  font-weight: ${theme.fonts.semibold};
  color: ${theme.colors.text};
`;

const PublicText = styled.Text`
  font-size: ${hp(1.7)}px;
  font-weight: ${theme.fonts.medium};
  color: ${theme.colors.textLight};
`;

const TextEditorContainer = styled.View`
  /* Add styles if needed */
`;

const MediaContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-width: 1.5px;
  padding: 12px;
  padding-left: 18px;
  padding-right: 18px;
  border-radius: ${theme.radius.xl}px;
  border-color: ${theme.colors.gray};
`;

const MediaIconsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`;

const AddImageText = styled.Text`
  font-size: ${hp(1.9)}px;
  font-weight: ${theme.fonts.semibold};
  color: ${theme.colors.text};
`;

const FileContainer = styled.View`
  height: ${hp(30)}px;
  width: 100%;
  border-radius: ${theme.radius.xl}px;
  overflow: hidden;
`;

const CloseIcon = styled.Pressable`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 7px;
  border-radius: 50px;
  background-color: rgba(225,0,0,0.5);
`;

const NewPost = () => {
  const post = useLocalSearchParams();
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(file);

  useEffect(() => {
    if(post && post.id){
      bodyRef.current = post.body;
      setFile(post.file || null);
      setTimeout(() => {
        editorRef.current?.setContentHTML(post.body);
      }, 300);
    }
  }, []);

  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };
    if (!isImage) {
      mediaConfig = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
      };
    }
    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    console.log("file: ", result.assets[0]);
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const isLocalFile = (file) => {
    if (!file) return null;
    if (typeof file === "object") return true;

    return false;
  };

  const getFileType = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type;
    }

    // check image or video fro remote file
    if (file.includes("postImages")) {
      return "image";
    }

    return "video";
  };

  const getFileUri = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }

    return getSupabaseFileUrl(file)?.uri;
  };

  const onSubmit = async () => {
    if(!bodyRef.current && !file){
      Alert.alert('Post', 'Please choose an image of add post body');
      return;
    }

    let data ={
      file,
      body: bodyRef.current,
      userId: user?.id,
    }

    if(post && post.id){
      data.id = post.id;
    }

    // create post
    setLoading(true);
    let res = await createOrUpdatePost(data);
    setLoading(false);
    if(res.success){
      setFile(null);
      bodyRef.current = "";
      editorRef.current?.setContentHTML("");
      router.back();
    }else{
      Alert.alert('Post', res.msg);
    }

  };

  return (
    <ScreenWrapper bg="white">
      <Container>
        <Header title="Create Post" />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* avatar */}
          <HeaderContainer>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />
            <View style={{ gap: 2 }}>
              <UserName>{user && user.name}</UserName>
              <PublicText>public</PublicText>
            </View>
          </HeaderContainer>

          <TextEditorContainer>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body) => (bodyRef.current = body)}
            />
          </TextEditorContainer>

          {file && (
            <FileContainer>
              {getFileType(file) == "video" ? (
                <Video 
                  style={{flex: 1}}
                  source={{uri: getFileUri(file)}}
                  useNativeControls
                  resizeMode="cover"
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              )}
              <CloseIcon onPress={() => setFile(null)}>
                <Icon name="delete" size={20} color="white" />
              </CloseIcon>
            </FileContainer>
          )}

          <MediaContainer>
            <AddImageText>Add to your post</AddImageText>
            <MediaIconsContainer>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </MediaIconsContainer>
          </MediaContainer>
        </ScrollView>
        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={post && post.id ? "Update" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </Container>
    </ScreenWrapper>
  );
};

export default NewPost;
