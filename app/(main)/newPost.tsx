import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
import { getSupabaseFileUrl } from "../../services/imageService";
import { Video } from "expo-av";
import { createOrUpdatePost } from "../../services/postService";
import { RichEditor } from "react-native-pell-rich-editor";

// Interfacce per i tipi
interface PostParams {
  id?: string;
  body?: string;
  file?: string;
  [key: string]: any;
}

// Definizione dell'interfaccia MediaFile
interface MediaFile {
  uri: string;
  type: "image" | "video" | "livePhoto" | "pairedVideo";
  width?: number;
  height?: number;
  [key: string]: any;
}

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

const NewPost: React.FC = () => {
  const post = useLocalSearchParams<PostParams>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const bodyRef = useRef<string>("");
  const editorRef = useRef<RichEditor | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<MediaFile | string | null>(null);

  useEffect(() => {
    if(post && post.id){
      bodyRef.current = post.body || "";
      setFile(post.file || null);
      setTimeout(() => {
        editorRef.current?.setContentHTML(post.body || "");
      }, 300);
    }
  }, []);

  const onPick = async (isImage: boolean): Promise<void> => {
    let mediaConfig: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };
    if (!isImage) {
      mediaConfig = {
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.7,
      };
    }
    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    console.log("file: ", result.assets?.[0]);
    if (!result.canceled && result.assets?.[0]) {
      // Converti l'asset in un oggetto MediaFile
      const asset = result.assets[0];
      // Assicurati che il tipo sia compatibile con PostFile
      const fileType = asset.type === 'image' || asset.type === 'video' ? asset.type : 'image';
      setFile({
        uri: asset.uri,
        type: fileType,
        width: asset.width,
        height: asset.height,
        // Aggiungi altre proprietà se necessario
      });
    }
  };

  const isLocalFile = (file: MediaFile | string | null): boolean | null => {
    if (!file) return null;
    if (typeof file === "object") return true;

    return false;
  };

  const getFileType = (file: MediaFile | string | null): string | null => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return (file as MediaFile).type || null;
    }

    // check image or video for remote file
    if (typeof file === 'string' && file.includes("postImages")) {
      return "image";
    }

    return "video";
  };

  const getFileUri = (file: MediaFile | string | null): string | null => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return (file as MediaFile).uri;
    }

    return getSupabaseFileUrl(file as string)?.uri;
  };

  const onSubmit = async (): Promise<void> => {
    if(!bodyRef.current && !file){
      Alert.alert(t('post'), t('pleaseChooseImageOrAddBody'));
      return;
    }

    // Crea l'oggetto dati con il tipo corretto
    let data = {
      file: file,
      body: bodyRef.current,
      userId: user?.id,
    } as any; // Utilizziamo any per evitare problemi di tipo

    if(post && post.id){
      data.id = post.id;
    }

    setLoading(true);
    let res = await createOrUpdatePost(data);
    setLoading(false);
    if(res.success){
      setFile(null);
      bodyRef.current = "";
      editorRef.current?.setContentHTML("");
      router.back();
    }else{
      Alert.alert(t('post'), res.msg || "Error creating post");
    }
  };

  return (
    <ScreenWrapper bg="white">
      <Container>
        <Header title={post && post.id ? t('editPost') : t('createPost')} />
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
              <PublicText>{t('public')}</PublicText>
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
              {getFileType(file) === "video" ? (
                <Video
                  style={{flex: 1}}
                  source={{uri: getFileUri(file) || ''}}
                  useNativeControls
                  // @ts-ignore - Ignora l'errore di tipo per resizeMode
                  resizeMode="contain"
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) || '' }}
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
            <AddImageText>{t('addToYourPost')}</AddImageText>
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
          title={post && post.id ? t('update') : t('post')}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </Container>
    </ScreenWrapper>
  );
};

export default NewPost;
