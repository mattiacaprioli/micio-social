import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Linking,
  Share,
} from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import { hp, wp } from "../../../helpers/common";
import Icon from "../../../assets/icons";
import Header from "../../../components/Header";
import { AffiliateProduct } from "../../../services/types";
import { trackProductClick, getProductById } from "../../../services/ecommerceService";
import { ProductDetailsSkeleton } from "../../../components/ecommerce/SkeletonLoader";

const { width } = Dimensions.get("window");

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

const ImageContainer = styled.View`
  height: ${width}px;
  background-color: ${(props) => props.theme.colors.card};
`;

const ProductImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const ImagePagination = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
`;

const PaginationDot = styled.View<{ isActive: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${(props) => 
    props.isActive ? 'white' : 'rgba(255,255,255,0.5)'
  };
  margin: 0 4px;
`;

const ContentContainer = styled.View`
  padding: 20px;
`;

const CategoryBadge = styled.View`
  background-color: ${(props) => props.theme.colors.primary}20;
  padding: 6px 12px;
  border-radius: 12px;
  align-self: flex-start;
  margin-bottom: 12px;
`;

const CategoryText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
  text-transform: uppercase;
`;

const ProductTitle = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 8px;
  line-height: 32px;
`;

const BrandText = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textLight};
  margin-bottom: 16px;
`;

const PriceContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const Price = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
`;

const OriginalPrice = styled.Text`
  font-size: 18px;
  color: ${(props) => props.theme.colors.textLight};
  text-decoration-line: line-through;
  margin-left: 12px;
`;

const DiscountBadge = styled.View`
  background-color: ${(props) => props.theme.colors.rose};
  padding: 4px 8px;
  border-radius: 8px;
  margin-left: 12px;
`;

const DiscountText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const RatingText = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
  margin-left: 8px;
  font-weight: 600;
`;

const ReviewText = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.colors.textLight};
  margin-left: 8px;
`;

const Description = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.colors.text};
  line-height: 24px;
  margin-bottom: 24px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Tag = styled.View`
  background-color: ${(props) => props.theme.colors.card};
  border: 1px solid ${(props) => props.theme.colors.cardBorder};
  padding: 6px 12px;
  border-radius: 16px;
  margin: 4px 8px 4px 0;
`;

const TagText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.colors.textLight};
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  gap: 12px;
  margin: 20px 0;
`;

const AffiliateButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
`;

const AffiliateButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-left: 8px;
`;

const ShareButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.card};
  border: 1px solid ${(props) => props.theme.colors.cardBorder};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  width: 56px;
`;

const AvailabilityContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const AvailabilityText = styled.Text<{ available: boolean }>`
  font-size: 14px;
  color: ${(props) => 
    props.available 
      ? '#10B981' 
      : props.theme.colors.rose
  };
  font-weight: 600;
  margin-left: 6px;
`;

const ProductDetails: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [product, setProduct] = useState<AffiliateProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      loadProductDetails(productId);
    }
  }, [productId]);

  const loadProductDetails = async (id: string) => {
    setLoading(true);
    try {
      // Prova prima a caricare dal database
      const result = await getProductById(id);
      
      if (result.success && result.data) {
        setProduct(result.data);
      } else {
        // Fallback ai dati mock se non trovato nel database
        const mockProduct: AffiliateProduct = {
          id: id,
          title: "Royal Canin Kitten - Cibo secco per gattini",
          description: "Alimento completo specificamente formulato per gattini fino a 12 mesi di età. Contiene tutti i nutrienti essenziali per una crescita sana, con proteine di alta qualità, vitamine e minerali. La forma delle crocchette è studiata per facilitare la masticazione dei gattini.",
          price: 24.99,
          originalPrice: 29.99,
          currency: "€",
          images: [
            "https://via.placeholder.com/400x400?text=Royal+Canin+1",
            "https://via.placeholder.com/400x400?text=Royal+Canin+2",
            "https://via.placeholder.com/400x400?text=Royal+Canin+3",
          ],
          category: "food",
          brand: "Royal Canin",
          affiliateUrl: "https://amazon.it/royal-canin-kitten",
          affiliateNetwork: "amazon",
          commission: 5,
          rating: 4.5,
          reviewCount: 1250,
          availability: "in_stock",
          tags: ["gattini", "cibo secco", "crescita", "nutrizione completa"],
        };

        setProduct(mockProduct);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      Alert.alert("Errore", "Impossibile caricare i dettagli del prodotto");
    } finally {
      setLoading(false);
    }
  };

  const handleAffiliatePress = async () => {
    if (!product || !user) return;

    try {
      const result = await trackProductClick(user.id, product.id, product.affiliateUrl);
      
      const url = result.success && result.data?.clickUrl 
        ? result.data.clickUrl 
        : product.affiliateUrl;
        
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening affiliate link:", error);
      try {
        await Linking.openURL(product.affiliateUrl);
      } catch (linkError) {
        Alert.alert("Errore", "Impossibile aprire il link del prodotto");
      }
    }
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Guarda questo prodotto per gatti: ${product.title} - ${product.currency}${product.price}`,
        url: product.affiliateUrl,
        title: product.title,
      });
    } catch (error) {
      console.error("Error sharing product:", error);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Icon
            key={i}
            name="starFill"
            size={16}
            color="#FFD700"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Icon
            key={i}
            name="starFill"
            size={16}
            color="#FFD700"
          />
        );
      } else {
        stars.push(
          <Icon
            key={i}
            name="star"
            size={16}
            color="#E0E0E0"
          />
        );
      }
    }
    return stars;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      food: 'Cibo',
      toys: 'Giochi',
      accessories: 'Accessori',
      health: 'Salute',
      grooming: 'Cura',
      other: 'Altro'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getStoreIcon = (network: string) => {
    switch (network) {
      case 'amazon':
        return 'shoppingCart';
      case 'zooplus':
        return 'package';
      default:
        return 'externalLink';
    }
  };

  const getStoreName = (network: string) => {
    switch (network) {
      case 'amazon':
        return 'Amazon';
      case 'zooplus':
        return 'Zooplus';
      case 'ebay':
        return 'eBay';
      default:
        return 'Store';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'checkCircle';
      case 'limited':
        return 'clock';
      default:
        return 'xCircle';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'Disponibile';
      case 'limited':
        return 'Scorte limitate';
      default:
        return 'Non disponibile';
    }
  };

  const calculateDiscount = () => {
    if (!product?.originalPrice || product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  if (loading) {
    return (
      <ThemeWrapper>
        <Container>
          <Header title="Dettagli Prodotto" showBackButton />
          <ProductDetailsSkeleton />
        </Container>
      </ThemeWrapper>
    );
  }

  if (!product) {
    return (
      <ThemeWrapper>
        <Container>
          <Header title="Dettagli Prodotto" showBackButton />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Prodotto non trovato</Text>
          </View>
        </Container>
      </ThemeWrapper>
    );
  }

  const discountPercent = calculateDiscount();

  return (
    <ThemeWrapper>
      <Container>
        <Header title="Dettagli Prodotto" showBackButton />
        
        <ScrollContainer showsVerticalScrollIndicator={false}>
          {/* Galleria Immagini */}
          <ImageContainer>
            <ProductImage 
              source={{ uri: product.images[currentImageIndex] }}
              resizeMode="cover"
            />
            {product.images.length > 1 && (
              <ImagePagination>
                {product.images.map((_, index) => (
                  <PaginationDot key={index} isActive={index === currentImageIndex} />
                ))}
              </ImagePagination>
            )}
          </ImageContainer>

          <ContentContainer>
            {/* Badge Categoria */}
            <CategoryBadge>
              <CategoryText>{getCategoryLabel(product.category)}</CategoryText>
            </CategoryBadge>

            {/* Titolo e Brand */}
            <ProductTitle>{product.title}</ProductTitle>
            {product.brand && <BrandText>by {product.brand}</BrandText>}

            {/* Prezzo */}
            <PriceContainer>
              <Price>{product.currency}{product.price.toFixed(2)}</Price>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <OriginalPrice>
                    {product.currency}{product.originalPrice.toFixed(2)}
                  </OriginalPrice>
                  {discountPercent > 0 && (
                    <DiscountBadge>
                      <DiscountText>-{discountPercent}%</DiscountText>
                    </DiscountBadge>
                  )}
                </>
              )}
            </PriceContainer>

            {/* Rating */}
            {product.rating && (
              <RatingContainer>
                {renderStars(product.rating)}
                <RatingText>{product.rating.toFixed(1)}</RatingText>
                <ReviewText>({product.reviewCount || 0} recensioni)</ReviewText>
              </RatingContainer>
            )}

            {/* Disponibilità */}
            <AvailabilityContainer>
              <Icon
                name={getAvailabilityIcon(product.availability)}
                size={16}
                color={product.availability === 'in_stock' ? '#10B981' : theme.colors.rose}
              />
              <AvailabilityText available={product.availability === 'in_stock'}>
                {getAvailabilityText(product.availability)}
              </AvailabilityText>
            </AvailabilityContainer>

            {/* Descrizione */}
            <Description>{product.description}</Description>

            {/* Tag */}
            {product.tags && product.tags.length > 0 && (
              <TagsContainer>
                {product.tags.map((tag, index) => (
                  <Tag key={index}>
                    <TagText>#{tag}</TagText>
                  </Tag>
                ))}
              </TagsContainer>
            )}

            {/* Pulsanti di azione */}
            <ButtonContainer>
              <AffiliateButton onPress={handleAffiliatePress}>
                <Icon
                  name={getStoreIcon(product.affiliateNetwork)}
                  size={20}
                  color="white"
                />
                <AffiliateButtonText>
                  Acquista su {getStoreName(product.affiliateNetwork)}
                </AffiliateButtonText>
              </AffiliateButton>

              <ShareButton onPress={handleShare}>
                <Icon name="share" size={20} color={theme.colors.textLight} />
              </ShareButton>
            </ButtonContainer>
          </ContentContainer>
        </ScrollContainer>
      </Container>
    </ThemeWrapper>
  );
};

export default ProductDetails;