import React from "react";
import { FlatList, RefreshControl, View, Text } from "react-native";
import styled from "styled-components/native";
import { AffiliateProduct } from "../../services/types";
import ProductCard from "./ProductCard";
import { wp, hp } from "../../helpers/common";

interface ProductGridProps {
  products: AffiliateProduct[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onProductPress: (product: AffiliateProduct) => void;
  onLoadMore?: () => void;
}

const Container = styled.View`
  flex: 1;
  padding-horizontal: 8px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${hp(10)}px;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textLight};
  text-align: center;
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
}) => {
  const renderProduct = ({ item }: { item: AffiliateProduct }) => (
    <ProductCard product={item} onPress={onProductPress} />
  );

  const renderEmpty = () => (
    <EmptyContainer>
      <EmptyText>
        {loading ? "Caricamento prodotti..." : "Nessun prodotto trovato"}
      </EmptyText>
    </EmptyContainer>
  );

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    
    return (
      <LoadingMoreContainer>
        <LoadingMoreText>Caricamento altri prodotti...</LoadingMoreText>
      </LoadingMoreContainer>
    );
  };

  return (
    <Container>
      <FlatList
        data={products}
        renderItem={renderProduct}
        numColumns={2}
        keyExtractor={(item) => item.id}
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