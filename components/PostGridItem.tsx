import React, { memo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import styled from 'styled-components/native';
import { Image } from 'expo-image';
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

const NoImageContainer = styled.View<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.darkLight};
  padding: ${wp(2)}px;
`;

const NoImageText = styled.Text`
  color: ${props => props.theme.colors.textLight};
  font-size: ${hp(1.4)}px;
  text-align: center;
  line-height: ${hp(1.8)}px;
  font-weight: ${props => props.theme.fonts.medium};
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
  size = wp(100) / 3 - 1 // Default: 3 colonne a tutta larghezza
}) => {
  const theme = useStyledTheme();
  
  // Verifica se il post ha un'immagine
  const hasImage = item?.file && item.file.includes("postImages");
  
  // Calcola il numero di like e commenti
  const likesCount = item?.postLikes?.length || 0;
  const commentsCount = Array.isArray(item?.comments) 
    ? item.comments.length 
    : item?.comments?.count || 0;

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
      {hasImage ? (
        <>
          <PostImage
            source={getSupabaseFileUrl(item.file)}
            contentFit="cover"
            size={size}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={200}
            cachePolicy="memory-disk"
          />
          
          {/* Indicatori sovrapposti */}
          {likesCount > 0 && (
            <LikesContainer>
              <Icon name="heart" size={hp(1.4)} color="white" />
              <LikesText>{likesCount}</LikesText>
            </LikesContainer>
          )}
          
          {commentsCount > 0 && (
            <CommentsContainer>
              <Icon name="messageCircle" size={hp(1.4)} color="white" />
              <CommentsText>{commentsCount}</CommentsText>
            </CommentsContainer>
          )}
        </>
      ) : (
        <NoImageContainer size={size}>
          <Icon 
            name="edit" 
            size={hp(2.5)} 
            color={theme.colors.textLight} 
            style={{ marginBottom: hp(1) }}
          />
          <NoImageText numberOfLines={4}>
            {textContent || 'Post senza contenuto'}
          </NoImageText>
          
          {/* Indicatori per post senza immagine */}
          {(likesCount > 0 || commentsCount > 0) && (
            <View style={{ 
              flexDirection: 'row', 
              marginTop: hp(1), 
              gap: wp(2),
              alignItems: 'center' 
            }}>
              {likesCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="heart" size={hp(1.2)} color={theme.colors.rose} />
                  <Text style={{ 
                    color: theme.colors.textLight, 
                    fontSize: hp(1.1),
                    marginLeft: wp(0.5)
                  }}>
                    {likesCount}
                  </Text>
                </View>
              )}
              
              {commentsCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="messageCircle" size={hp(1.2)} color={theme.colors.primary} />
                  <Text style={{ 
                    color: theme.colors.textLight, 
                    fontSize: hp(1.1),
                    marginLeft: wp(0.5)
                  }}>
                    {commentsCount}
                  </Text>
                </View>
              )}
            </View>
          )}
        </NoImageContainer>
      )}
    </GridItemContainer>
  );
};

export default memo(PostGridItem);
