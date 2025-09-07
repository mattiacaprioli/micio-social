import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import styled from "styled-components/native";
import { AffiliateProduct } from "../../services/types";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";

interface ProductCardProps {
  product: AffiliateProduct;
  onPress: (product: AffiliateProduct) => void;
}

const Card = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.cardBorder};
  border-radius: 12px;
  margin: 8px;
  padding: 12px;
  shadow-color: #444040ff;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  elevation: 12;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.cardBorder}30;
  transform: scale(1);
  flex: 1;
  min-width: ${wp(42)}px;
  max-width: ${wp(45)}px;
`;

const ProductImage = styled.Image`
  width: 100%;
  height: ${wp(30)}px;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ProductTitle = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 4px;
  line-height: 18px;
`;

const PriceContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const Price = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
`;

const OriginalPrice = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.colors.textLight};
  text-decoration-line: line-through;
  margin-left: 6px;
`;

const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const RatingText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.theme.colors.textLight};
  margin-left: 4px;
`;

const CategoryBadge = styled.View`
  background-color: ${(props) => props.theme.colors.primary}20;
  padding: 4px 8px;
  border-radius: 12px;
  align-self: flex-start;
  margin-bottom: 8px;
`;

const CategoryText = styled.Text`
  font-size: 10px;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
  text-transform: uppercase;
`;

const AffiliateButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.primary};
  padding: 8px 12px;
  border-radius: 8px;
  align-items: center;
  margin-top: auto;
`;

const AffiliateButtonText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
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
            size={12}
            color="#FFD700"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Icon
            key={i}
            name="starFill"
            size={12}
            color="#FFD700"
          />
        );
      } else {
        stars.push(
          <Icon
            key={i}
            name="star"
            size={12}
            color="#E0E0E0"
          />
        );
      }
    }
    return stars;
  };

  const getAffiliateStoreName = (network: string) => {
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

  return (
    <Card onPress={() => onPress(product)}>
      <CategoryBadge>
        <CategoryText>{getCategoryLabel(product.category)}</CategoryText>
      </CategoryBadge>
      
      <ProductImage 
        source={{ uri: product.images[0] || 'https://via.placeholder.com/200' }}
        resizeMode="cover"
      />
      
      <ProductTitle numberOfLines={2}>
        {product.title}
      </ProductTitle>
      
      <PriceContainer>
        <Price>{product.currency} {product.price.toFixed(2)}</Price>
        {product.originalPrice && product.originalPrice > product.price && (
          <OriginalPrice>
            {product.currency} {product.originalPrice.toFixed(2)}
          </OriginalPrice>
        )}
      </PriceContainer>
      
      {product.rating && (
        <RatingContainer>
          {renderStars(product.rating)}
          <RatingText>
            {product.rating.toFixed(1)} ({product.reviewCount || 0})
          </RatingText>
        </RatingContainer>
      )}
      
      <AffiliateButton onPress={() => onPress(product)}>
        <AffiliateButtonText>
          Vedi su {getAffiliateStoreName(product.affiliateNetwork)}
        </AffiliateButtonText>
      </AffiliateButton>
    </Card>
  );
};

export default ProductCard;