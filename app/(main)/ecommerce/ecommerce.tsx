import React, { useEffect, useState, useCallback } from "react";
import { Alert, View, Text } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useFocusEffect, useRouter } from "expo-router";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import { hp } from "../../../helpers/common";
import Header from "../../../components/Header";
import Loading from "../../../components/Loading";
import { AffiliateProduct, ProductCategory } from "../../../services/types";
import SearchBar from "../../../components/ecommerce/SearchBar";
import CategoryFilter from "../../../components/ecommerce/CategoryFilter";
import ProductGrid from "../../../components/ecommerce/ProductGrid";
import {
  fetchProducts,
  searchProducts,
  getProductCategories,
  getFeaturedProducts,
  trackProductClick,
} from "../../../services/ecommerceService";

const Container = styled.View`
  flex: 1;
  padding-top: ${hp(6)}px;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ErrorText = styled.Text`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textLight};
  text-align: center;
  margin-bottom: 16px;
`;

const RetryButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.primary};
  padding: 12px 24px;
  border-radius: 8px;
`;

const RetryButtonText = styled.Text`
  color: white;
  font-weight: 600;
`;

const Ecommerce: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();

  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      let result;

      if (searchQuery.trim()) {
        result = await searchProducts(
          searchQuery,
          selectedCategory === "all" ? undefined : selectedCategory
        );
      } else {
        result = await fetchProducts(
          selectedCategory === "all" ? undefined : selectedCategory,
          20,
          0
        );
      }

      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        setProducts(getMockProducts());
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Errore nel caricamento dei prodotti");
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await getProductCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setCategories(getMockCategories());
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories(getMockCategories());
    }
  };

  const handleProductPress = async (product: AffiliateProduct) => {
    if (!user) return;

    try {
      await trackProductClick(user.id, product.id, product.affiliateUrl);

      router.push({
        pathname: "/ecommerce/productDetails",
        params: { productId: product.id },
      });
    } catch (error) {
      console.error("Error tracking product click:", error);
      router.push({
        pathname: "/ecommerce/productDetails",
        params: { productId: product.id },
      });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadProducts();
    }, [selectedCategory, searchQuery])
  );

  // Dati mock per testing
  const getMockProducts = (): AffiliateProduct[] => [
    {
      id: "1",
      title: "Royal Canin Kitten - Cibo secco per gattini",
      description: "Alimento completo per gattini fino a 12 mesi",
      price: 24.99,
      originalPrice: 29.99,
      currency: "€",
      images: ["https://via.placeholder.com/300x300?text=Royal+Canin"],
      category: "food",
      brand: "Royal Canin",
      affiliateUrl: "https://amazon.it/royal-canin-kitten",
      affiliateNetwork: "amazon",
      commission: 5,
      rating: 4.5,
      reviewCount: 1250,
      availability: "in_stock",
      tags: ["gattini", "cibo secco"],
    },
    {
      id: "2",
      title: "Gioco interattivo per gatti con piume",
      description: "Bacchetta con piume per stimolare l'istinto di caccia",
      price: 12.99,
      currency: "€",
      images: ["https://via.placeholder.com/300x300?text=Cat+Toy"],
      category: "toys",
      brand: "PetPlay",
      affiliateUrl: "https://zooplus.it/cat-toy-feather",
      affiliateNetwork: "zooplus",
      commission: 8,
      rating: 4.2,
      reviewCount: 856,
      availability: "in_stock",
      tags: ["giochi", "piume", "interattivo"],
    },
    {
      id: "3",
      title: "Trasportino per gatti",
      description: "Trasportino sicuro e confortevole per viaggi",
      price: 45.00,
      originalPrice: 55.00,
      currency: "€",
      images: ["https://via.placeholder.com/300x300?text=Cat+Carrier"],
      category: "accessories",
      brand: "TravelPet",
      affiliateUrl: "https://amazon.it/cat-carrier",
      affiliateNetwork: "amazon",
      commission: 6,
      rating: 4.7,
      reviewCount: 423,
      availability: "in_stock",
      tags: ["trasporto", "viaggio", "sicurezza"],
    },
  ];

  const getMockCategories = (): ProductCategory[] => [
    { id: "food", name: "Cibo", icon: "coffee" },
    { id: "toys", name: "Giochi", icon: "smile" },
    { id: "accessories", name: "Accessori", icon: "package" },
    { id: "health", name: "Salute", icon: "heart" },
    { id: "grooming", name: "Cura", icon: "scissors" },
  ];

  const renderError = () => (
    <ErrorContainer>
      <ErrorText>{error}</ErrorText>
      <RetryButton onPress={() => loadProducts()}>
        <RetryButtonText>Riprova</RetryButtonText>
      </RetryButton>
    </ErrorContainer>
  );

  if (error && products.length === 0) {
    return (
      <ThemeWrapper>
        <View style={{ flex: 1 }}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <Header title="Shop" showBackButton={false} />
          </View>
          <Container theme={theme}>{renderError()}</Container>
        </View>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <Header title="Shop" showBackButton={false} />
        </View>

        <Container theme={theme}>
          <ContentContainer>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Cerca prodotti per il tuo micio..."
            />

            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
            />

            <ProductGrid
              products={products}
              loading={loading}
              refreshing={refreshing}
              onRefresh={() => loadProducts(true)}
              onProductPress={handleProductPress}
            />
          </ContentContainer>
        </Container>
      </View>
    </ThemeWrapper>
  );
};

export default Ecommerce;
