import React, { memo } from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { wp, hp } from '../helpers/common';
import { getSupabaseFileUrl } from '../services/imageService';
import { PostWithRelations } from '../services/postService';
import Icon from '../assets/icons';
import { useTheme as useStyledTheme } from 'styled-components/native';

interface PostGridItemProps {
  item: PostWithRelations;
  onPress: () => void;
  size?: number;
}

const GridItemContainer = styled.TouchableOpacity<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin: 0.5px;
  overflow: hidden;
  background-color: ${props => props.theme.colors.darkLight};
  position: relative;
`;

const PostImage = styled(Image)<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

const PostVideo = styled(Video)<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

const VideoOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
`;

const PlayButton = styled.View`
  width: ${hp(6)}px;
  height: ${hp(6)}px;
  border-radius: ${hp(3)}px;
  background-color: rgba(31, 28, 28, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
  shadow-color: rgba(0, 0, 0, 0.3);
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const NoImageContainer = styled.View<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.darkLight};
  padding: ${wp(3)}px;
  position: relative;
  overflow: hidden;
`;

const TextGradientOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.primary}08;
  opacity: 0.6;
`;

const ColorAccent = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  width: 40%;
  height: 40%;
  background-color: ${props => props.theme.colors.rose}15;
  border-bottom-left-radius: ${wp(8)}px;
`;

const ColorAccent2 = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30%;
  height: 30%;
  background-color: ${props => props.theme.colors.primary}10;
  border-top-right-radius: ${wp(6)}px;
`;

const TextContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

const NoImageText = styled.Text`
  color: ${props => props.theme.colors.text};
  font-size: ${hp(1.5)}px;
  text-align: center;
  line-height: ${hp(2)}px;
  font-weight: ${props => props.theme.fonts.semibold};
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
`;

const QuoteIcon = styled.View`
  position: absolute;
  top: ${hp(1)}px;
  left: ${wp(2)}px;
  opacity: 0.3;
`;

const PostTypeIndicator = styled.View`
  position: absolute;
  bottom: ${hp(1)}px;
  right: ${wp(2)}px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: ${wp(2)}px;
  padding: ${wp(1)}px ${wp(1.5)}px;
`;

const OverlayContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  justify-content: center;
  align-items: center;
  opacity: 0;
`;

const MultiplePhotosIndicator = styled.View`
  position: absolute;
  top: ${hp(0.8)}px;
  right: ${wp(2)}px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: ${wp(3)}px;
  padding: ${wp(1)}px;
`;

const LikesContainer = styled.View`
  position: absolute;
  bottom: ${hp(0.8)}px;
  left: ${wp(2)}px;
  flex-direction: row;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: ${wp(3)}px;
  padding: ${wp(1)}px ${wp(1.5)}px;
`;

const LikesText = styled.Text`
  color: white;
  font-size: ${hp(1.2)}px;
  font-weight: ${props => props.theme.fonts.medium};
  margin-left: ${wp(0.5)}px;
`;

const CommentsContainer = styled.View`
  position: absolute;
  bottom: ${hp(0.8)}px;
  right: ${wp(2)}px;
  flex-direction: row;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: ${wp(3)}px;
  padding: ${wp(1)}px ${wp(1.5)}px;
`;

const CommentsText = styled.Text`
  color: white;
  font-size: ${hp(1.2)}px;
  font-weight: ${props => props.theme.fonts.medium};
  margin-left: ${wp(0.5)}px;
`;

const PostGridItem: React.FC<PostGridItemProps> = ({
  item,
  onPress,
  size = wp(100) / 3 - 1
}) => {
  const theme = useStyledTheme();
  
  // Verifica se il post ha un'immagine o un video
  const hasImage = item?.file && item.file.includes("postImages");
  const hasVideo = item?.file && item.file.includes("postVideos");
  const hasMedia = hasImage || hasVideo;
  
  // Calcola il numero di like e commenti (stesso modo di PostCard)
  const likesCount = item?.postLikes?.length || 0;

  // Estrae il testo dal body HTML (versione semplificata)
  const getTextFromHtml = (html: string): string => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '') // Rimuove i tag HTML
      .replace(/&nbsp;/g, ' ') // Sostituisce &nbsp; con spazi
      .replace(/&amp;/g, '&') // Sostituisce &amp; con &
      .replace(/&lt;/g, '<') // Sostituisce &lt; con <
      .replace(/&gt;/g, '>') // Sostituisce &gt; con >
      .trim();
  };

  const textContent = getTextFromHtml(item?.body || '');

  return (
    <GridItemContainer size={size} onPress={onPress} activeOpacity={0.8}>
      {hasMedia ? (
        <>
          {hasImage ? (
            <PostImage
              source={getSupabaseFileUrl(item.file!)}
              contentFit="cover"
              size={size}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : hasVideo ? (
            <>
              <PostVideo
                source={{ uri: getSupabaseFileUrl(item.file!).uri }}
                shouldPlay={false}
                isLooping={false}
                isMuted={true}
                resizeMode={ResizeMode.COVER}
                size={size}
                useNativeControls={false}
              />
              <VideoOverlay>
                <PlayButton>
                  <Icon name="play" size={hp(2.5)} color="rgba(255, 255, 255, 0.9)" />
                </PlayButton>
              </VideoOverlay>
            </>
          ) : null}

          {/* Indicatori sovrapposti */}
          {likesCount > 0 && (
            <LikesContainer>
              <Icon name="heart" size={hp(1.4)} color="white" />
              <LikesText>{likesCount}</LikesText>
            </LikesContainer>
          )}

        </>
      ) : (
        <NoImageContainer size={size}>
          {/* Elementi decorativi di sfondo */}
          <ColorAccent />
          <ColorAccent2 />
          <TextGradientOverlay />

          {/* Icona virgolette decorativa */}
          <QuoteIcon>
            <Icon
              name="messageCircle"
              size={hp(2)}
              color={theme.colors.primary}
            />
          </QuoteIcon>

          <TextContentContainer>
            <NoImageText numberOfLines={5}>
              {textContent || 'Condividi i tuoi pensieri...'}
            </NoImageText>
          </TextContentContainer>

          {/* Indicatore tipo post */}
          <PostTypeIndicator>
            <Icon name="edit" size={hp(1.2)} color="rgba(255, 255, 255, 0.8)" />
          </PostTypeIndicator>

          {/* Indicatori like e commenti sovrapposti */}
          {likesCount > 0 && (
            <LikesContainer>
              <Icon name="heart" size={hp(1.4)} color="white" />
              <LikesText>{likesCount}</LikesText>
            </LikesContainer>
          )}
        </NoImageContainer>
      )}
    </GridItemContainer>
  );
};

export default memo(PostGridItem);
