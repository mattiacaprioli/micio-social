import React, { useState, useCallback } from "react";
import { Alert, View } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useFocusEffect, useRouter } from "expo-router";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import { hp, wp } from "../../../helpers/common";
import Header from "../../../components/Header";
import { AffiliateProduct, ProductCategory } from "../../../services/types";
import SearchBar from "../../../components/ecommerce/SearchBar";
import CategoryFilter from "../../../components/ecommerce/CategoryFilter";
import ProductGrid from "../../../components/ecommerce/ProductGrid";
import {
  fetchProductsPaginated,
  searchProducts,
  getProductCategories,
  trackProductClick,
} from "../../../services/ecommerceService";
import { seedEcommerceData, clearEcommerceData } from "../../../services/seedDataService";
import ErrorBoundary from "../../../components/ecommerce/ErrorBoundary";
import useNetworkError from "../../../hooks/useNetworkError";

const Container = styled.View`
  flex: 1;
  padding-top: ${hp(6)}px;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
  margin-bottom: 40px;
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

const InitDataButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.primary};
  padding: ${hp(1)}px ${wp(2)}px;
  border-radius: ${wp(2)}px;
  align-items: center;
  justify-content: center;
  width: ${wp(10)}px;
  height: ${hp(4)}px;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  border: 1px solid ${(props) => props.theme.colors.darkLight};
`;

const InitDataButtonText = styled.Text`
  color: white;
  font-size: ${wp(4)}px;
  font-weight: 600;
`;

const ButtonsContainer = styled.View`
  position: absolute;
  bottom: ${hp(3)}px;
  right: ${wp(4)}px;
  flex-direction: row;
  gap: ${wp(2)}px;
  z-index: 1001;
`;

const ClearDataButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.rose};
  padding: ${hp(1)}px ${wp(2)}px;
  border-radius: ${wp(2)}px;
  align-items: center;
  justify-content: center;
  width: ${wp(10)}px;
  height: ${hp(4)}px;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  border: 1px solid ${(props) => props.theme.colors.darkLight};
`;

const ClearDataButtonText = styled.Text`
  color: white;
  font-size: ${wp(4)}px;
  font-weight: 600;
`;

const Ecommerce: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();
  const { error, executeWithRetry, clearError } = useNetworkError();

  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);

  // Funzione per rimuovere prodotti duplicati
  const removeDuplicateProducts = (products: AffiliateProduct[]): AffiliateProduct[] => {
    const seen = new Set<string>();
    return products.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  };

  const loadProducts = async (isRefresh = false, loadMore = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setCurrentOffset(0);
      setHasMore(true);
    } else if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setCurrentOffset(0);
      setHasMore(true);
    }
    clearError();

    const offset = isRefresh || !loadMore ? 0 : currentOffset;

    try {
      await executeWithRetry(async () => {
        let result;

        if (searchQuery.trim()) {
          // Per la ricerca, usiamo la funzione esistente (senza paginazione per ora)
          result = await searchProducts(
            searchQuery,
            selectedCategory === "all" ? undefined : selectedCategory
          );

          if (result.success && result.data) {
            setProducts(removeDuplicateProducts(result.data));
            setHasMore(false); // La ricerca non supporta paginazione per ora
          } else {
            throw new Error(result.msg || "Errore nella ricerca prodotti");
          }
        } else {
          // Per il browse normale, usiamo la paginazione
          result = await fetchProductsPaginated(
            selectedCategory === "all" ? undefined : selectedCategory,
            20,
            offset
          );

          if (result.success && result.data) {
            if (isRefresh || !loadMore) {
              setProducts(removeDuplicateProducts(result.data.data));
            } else {
              setProducts(prev => removeDuplicateProducts([...prev, ...result.data.data]));
            }
            setHasMore(result.data.hasMore);
            setCurrentOffset(result.data.nextOffset);
          } else {
            throw new Error(result.msg || "Errore nel caricamento prodotti");
          }
        }
      });
    } catch (error) {
      console.error("Error loading products:", error);
      // L'errore è già gestito dal hook useNetworkError
      // Fallback ai dati mock solo se necessario
      if (isRefresh || !loadMore) {
        setProducts(removeDuplicateProducts(getMockProducts()));
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = async () => {
    if (!loadingMore && hasMore && !searchQuery.trim()) {
      await loadProducts(false, true);
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

  const initializeData = async () => {
    try {
      Alert.alert(
        "Inizializzazione Dati",
        "Vuoi popolare il database con i dati di esempio?",
        [
          { text: "Annulla", style: "cancel" },
          {
            text: "Conferma",
            onPress: async () => {
              try {
                setLoading(true);
                await seedEcommerceData();
                await loadProducts();
                await loadCategories();
                Alert.alert("Successo", "Dati inizializzati correttamente!");
              } catch (error) {
                console.error("Error seeding data:", error);
                Alert.alert("Errore", "Errore durante l'inizializzazione dei dati");
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in initializeData:", error);
    }
  };

  const clearData = async () => {
    try {
      Alert.alert(
        "Rimozione Dati",
        "Vuoi rimuovere tutti i dati di test dal database?",
        [
          { text: "Annulla", style: "cancel" },
          {
            text: "Rimuovi",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);
                await clearEcommerceData();
                await loadProducts();
                await loadCategories();
                Alert.alert("Successo", "Dati rimossi correttamente!");
              } catch (error) {
                console.error("Error clearing data:", error);
                Alert.alert("Errore", "Errore durante la rimozione dei dati");
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in clearData:", error);
    }
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
    <ErrorBoundary>
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

              <ButtonsContainer>
                <InitDataButton
                  theme={theme}
                  onPress={initializeData}
                  disabled={loading}
                >
                  <InitDataButtonText>🔄</InitDataButtonText>
                </InitDataButton>

                <ClearDataButton
                  theme={theme}
                  onPress={clearData}
                  disabled={loading}
                >
                  <ClearDataButtonText>🗑️</ClearDataButtonText>
                </ClearDataButton>
              </ButtonsContainer>

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
                onLoadMore={handleLoadMore}
                loadingMore={loadingMore}
                error={error || undefined}
                onRetry={() => loadProducts()}
              />
            </ContentContainer>
          </Container>
        </View>
      </ThemeWrapper>
    </ErrorBoundary>
  );
};

export default Ecommerce;
