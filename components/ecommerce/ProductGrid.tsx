import React from "react";
import { FlatList, RefreshControl, View, Text } from "react-native";
import styled from "styled-components/native";
import { AffiliateProduct } from "../../services/types";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "./SkeletonLoader";
import ErrorState from "./ErrorState";
import { wp, hp } from "../../helpers/common";

interface ProductGridProps {
  products: AffiliateProduct[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onProductPress: (product: AffiliateProduct) => void;
  onLoadMore?: () => void;
  error?: string;
  onRetry?: () => void;
  loadingMore?: boolean;
}

const Container = styled.View`
  flex: 1;
  padding-horizontal: 8px;
`;



const LoadingMoreContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

const LoadingMoreText = styled.Text`
  color: ${(props) => props.theme.colors.textLight};
`;

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  refreshing,
  onRefresh,
  onProductPress,
  onLoadMore,
  error,
  onRetry,
  loadingMore = false,
}) => {
  const renderProduct = ({ item }: { item: AffiliateProduct }) => (
    <ProductCard product={item} onPress={onProductPress} />
  );

  const renderSkeleton = ({ index }: { index: number }) => (
    <ProductCardSkeleton key={`skeleton-${index}`} />
  );

  const renderEmpty = () => {
    if (loading) return null;

    if (error) {
      return (
        <ErrorState
          type="network"
          message={error}
          onRetry={onRetry}
        />
      );
    }

    return (
      <ErrorState
        type="empty"
        title="Nessun prodotto trovato"
        message="Non ci sono prodotti che corrispondono ai tuoi criteri di ricerca."
      />
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <LoadingMoreContainer>
          <LoadingMoreText>Caricamento altri prodotti...</LoadingMoreText>
        </LoadingMoreContainer>
      );
    }
    return null;
  };

  if (loading && products.length === 0 && !refreshing) {
    return (
      <Container>
        <FlatList
          data={Array(6).fill({})} // 6 skeleton items
          renderItem={renderSkeleton}
          keyExtractor={(_, index) => `skeleton-${index}`}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: hp(10) }}
        />
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={products}
        renderItem={renderProduct}
        numColumns={2}
        keyExtractor={(item, index) => `product-${item.id}-${index}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
      />
    </Container>
  );
};

export default ProductGrid;