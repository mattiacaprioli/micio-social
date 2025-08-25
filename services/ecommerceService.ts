import { supabase } from "../lib/supabase";
import { ApiResponse, AffiliateProduct, ProductClick, ProductCategory } from "./types";

// Funzione per recuperare prodotti dal database
export const fetchProducts = async (
  category?: string,
  limit = 20,
  offset = 0
): Promise<ApiResponse<AffiliateProduct[]>> => {
  try {
    let query = supabase
      .from('affiliate_products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('fetchProducts error:', error);
      return { success: false, msg: 'Could not fetch products' };
    }

    // Trasforma i dati dal database al formato AffiliateProduct
    const products: AffiliateProduct[] = data?.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: parseFloat(item.price),
      originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
      currency: item.currency,
      images: Array.isArray(item.images) ? item.images : [item.images].filter(Boolean),
      category: item.category,
      brand: item.brand,
      affiliateUrl: item.affiliate_url,
      affiliateNetwork: item.affiliate_network,
      commission: parseFloat(item.commission),
      rating: item.rating ? parseFloat(item.rating) : undefined,
      reviewCount: item.review_count || 0,
      availability: item.availability,
      tags: Array.isArray(item.tags) ? item.tags : []
    })) || [];

    return { success: true, data: products };
  } catch (error) {
    console.error('fetchProducts error:', error);
    return { success: false, msg: 'Could not fetch products' };
  }
};

export const searchProducts = async (
  query: string,
  category?: string
): Promise<ApiResponse<AffiliateProduct[]>> => {
  try {
    if (!query.trim()) {
      return fetchProducts(category);
    }

    let dbQuery = supabase
      .from('affiliate_products')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.["${query}"]`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category', category);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('searchProducts error:', error);
      return { success: false, msg: 'Could not search products' };
    }

    // Trasforma i dati dal database al formato AffiliateProduct
    const products: AffiliateProduct[] = data?.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: parseFloat(item.price),
      originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
      currency: item.currency,
      images: Array.isArray(item.images) ? item.images : [item.images].filter(Boolean),
      category: item.category,
      brand: item.brand,
      affiliateUrl: item.affiliate_url,
      affiliateNetwork: item.affiliate_network,
      commission: parseFloat(item.commission),
      rating: item.rating ? parseFloat(item.rating) : undefined,
      reviewCount: item.review_count || 0,
      availability: item.availability,
      tags: Array.isArray(item.tags) ? item.tags : []
    })) || [];

    return { success: true, data: products };
  } catch (error) {
    console.error('searchProducts error:', error);
    return { success: false, msg: 'Could not search products' };
  }
};

export const trackProductClick = async (
  userId: string,
  productId: string,
  affiliateUrl: string
): Promise<ApiResponse<{ clickUrl: string }>> => {
  try {
    // Registra il click nel database
    const { data: clickData, error: clickError } = await supabase
      .from('product_clicks')
      .insert({
        user_id: userId,
        product_id: productId,
        clicked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clickError) {
      console.error('trackProductClick error:', clickError);
      // Anche se il tracking fallisce, restituiamo comunque l'URL
      return { success: true, data: { clickUrl: affiliateUrl } };
    }

    // Per ora restituiamo l'URL diretto, in futuro potremo aggiungere parametri di tracking
    const trackedUrl = `${affiliateUrl}${affiliateUrl.includes('?') ? '&' : '?'}ref=miciosocial&click_id=${clickData.id}`;

    return { success: true, data: { clickUrl: trackedUrl } };
  } catch (error) {
    console.error('trackProductClick error:', error);
    // In caso di errore, restituiamo comunque l'URL originale
    return { success: true, data: { clickUrl: affiliateUrl } };
  }
};

export const getProductCategories = async (): Promise<ApiResponse<ProductCategory[]>> => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('getProductCategories error:', error);
      return { success: false, msg: 'Could not fetch categories' };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('getProductCategories error:', error);
    return { success: false, msg: 'Could not fetch categories' };
  }
};

export const getFeaturedProducts = async (): Promise<ApiResponse<AffiliateProduct[]>> => {
  try {
    // Recupera prodotti con rating alto e molte recensioni
    const { data, error } = await supabase
      .from('affiliate_products')
      .select('*')
      .gte('rating', 4.0)
      .gte('review_count', 100)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('getFeaturedProducts error:', error);
      return { success: false, msg: 'Could not fetch featured products' };
    }

    // Trasforma i dati dal database al formato AffiliateProduct
    const products: AffiliateProduct[] = data?.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: parseFloat(item.price),
      originalPrice: item.original_price ? parseFloat(item.original_price) : undefined,
      currency: item.currency,
      images: Array.isArray(item.images) ? item.images : [item.images].filter(Boolean),
      category: item.category,
      brand: item.brand,
      affiliateUrl: item.affiliate_url,
      affiliateNetwork: item.affiliate_network,
      commission: parseFloat(item.commission),
      rating: item.rating ? parseFloat(item.rating) : undefined,
      reviewCount: item.review_count || 0,
      availability: item.availability,
      tags: Array.isArray(item.tags) ? item.tags : []
    })) || [];

    return { success: true, data: products };
  } catch (error) {
    console.error('getFeaturedProducts error:', error);
    return { success: false, msg: 'Could not fetch featured products' };
  }
};

// Funzione per ottenere un singolo prodotto per ID
export const getProductById = async (productId: string): Promise<ApiResponse<AffiliateProduct>> => {
  try {
    const { data, error } = await supabase
      .from('affiliate_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('getProductById error:', error);
      return { success: false, msg: 'Could not fetch product' };
    }

    const product: AffiliateProduct = {
      id: data.id,
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
      currency: data.currency,
      images: Array.isArray(data.images) ? data.images : [data.images].filter(Boolean),
      category: data.category,
      brand: data.brand,
      affiliateUrl: data.affiliate_url,
      affiliateNetwork: data.affiliate_network,
      commission: parseFloat(data.commission),
      rating: data.rating ? parseFloat(data.rating) : undefined,
      reviewCount: data.review_count || 0,
      availability: data.availability,
      tags: Array.isArray(data.tags) ? data.tags : []
    };

    return { success: true, data: product };
  } catch (error) {
    console.error('getProductById error:', error);
    return { success: false, msg: 'Could not fetch product' };
  }
};

// Funzione per aggiornare lo stato di conversione di un click
export const updateClickConversion = async (clickId: string): Promise<ApiResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from('product_clicks')
      .update({
        converted: true,
        conversion_date: new Date().toISOString()
      })
      .eq('id', clickId);

    if (error) {
      console.error('updateClickConversion error:', error);
      return { success: false, msg: 'Could not update conversion' };
    }

    return { success: true, data: true };
  } catch (error) {
    console.error('updateClickConversion error:', error);
    return { success: false, msg: 'Could not update conversion' };
  }
};