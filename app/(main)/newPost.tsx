import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Text,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../components/ThemeWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
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
  category?: string;
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
  font-weight: ${props => props.theme.fonts.semibold};
  color: ${props => props.theme.colors.text};
`;

const PublicText = styled.Text`
  font-size: ${hp(1.7)}px;
  font-weight: ${props => props.theme.fonts.medium};
  color: ${props => props.theme.colors.textLight};
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
  border-radius: ${props => props.theme.radius.xl}px;
  border-color: ${props => props.theme.colors.gray};
  margin-bottom: 15px;
`;

const MediaIconsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`;

const AddImageText = styled.Text`
  font-size: ${hp(1.9)}px;
  font-weight: ${props => props.theme.fonts.semibold};
  color: ${props => props.theme.colors.text};
`;

const FileContainer = styled.View`
  height: ${hp(30)}px;
  width: 100%;
  border-radius: ${props => props.theme.radius.xl}px;
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

// Componenti per la selezione della categoria
const CategoryContainer = styled.View`
  margin-bottom: 15px;
`;

const CategoryLabel = styled.Text`
  font-size: ${hp(1.9)}px;
  font-weight: ${props => props.theme.fonts.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 10px;
`;

const CategoryOptionsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

const CategoryOption = styled.TouchableOpacity<{ isSelected?: boolean }>`
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: ${props => props.theme.radius.md}px;
  background-color: ${props => props.isSelected ? props.theme.colors.primary : props.theme.colors.darkLight};
`;

const CategoryText = styled.Text<{ isSelected?: boolean }>`
  font-size: ${hp(1.6)}px;
  font-weight: ${props => props.theme.fonts.medium};
  color: ${props => props.isSelected ? 'white' : props.theme.colors.text};
`;

const NewPost: React.FC = () => {
  const post = useLocalSearchParams<PostParams>();
  const { user } = useAuth();
  const bodyRef = useRef<string>("");
  const editorRef = useRef<RichEditor | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<MediaFile | string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  // Categorie disponibili (manteniamo le stesse della home)
  const categories = [
    { id: 'funny', label: 'Funny' },
    { id: 'cute', label: 'Cute' },
    { id: 'amazing', label: 'Amazing' },
    { id: 'pets', label: 'Pets' },
    { id: 'nature', label: 'Nature' },
  ];

  useEffect(() => {
    if(post && post.id){
      bodyRef.current = post.body || "";
      setFile(post.file || null);
      setSelectedCategory(post.category);
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
      Alert.alert("Post", "Please add content or image");
      return;
    }

    // Crea l'oggetto dati con il tipo corretto
    let data = {
      file: file,
      body: bodyRef.current,
      userId: user?.id,
      category: selectedCategory,
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
      Alert.alert("Post", res.msg || "Error creating post");
    }
  };

  return (
    <ThemeWrapper>
      <Container>
        <Header title={post && post.id ? "Edit Post" : "New Post"} />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* avatar */}
          <HeaderContainer>
            <Avatar
              uri={user && 'image' in user ? user.image : undefined}
              size={hp(6.5)}
              rounded={theme.radius.xl}
              isDarkMode={isDarkMode}
            />
            <View style={{ gap: 2 }}>
              <UserName>{user && 'name' in user ? user.name : ''}</UserName>
              <PublicText>Public</PublicText>
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

          {/* Selezione della categoria */}
          <CategoryContainer>
            <CategoryLabel>Select Category</CategoryLabel>
            {/* Messaggio rimosso perché la colonna 'category' ora esiste nel database */}
            <CategoryOptionsContainer>
              {categories.map(category => (
                <CategoryOption
                  key={category.id}
                  isSelected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <CategoryText isSelected={selectedCategory === category.id}>{category.label}</CategoryText>
                </CategoryOption>
              ))}
            </CategoryOptionsContainer>
          </CategoryContainer>
        </ScrollView>
        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={post && post.id ? "Update" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </Container>
    </ThemeWrapper>
  );
};

export default NewPost;
