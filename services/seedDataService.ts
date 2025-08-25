/**
 * Funzione per popolare il database con dati di test ecommerce
 * Chiamabile direttamente dall'app
 */

import { supabase } from '../lib/supabase';
import { ApiResponse } from '../services/types';

// Dati di esempio per le categorie
const mockCategories = [
  {
    id: 'food',
    name: 'Cibo',
    icon: 'coffee',
    description: 'Cibo e snack per gatti'
  },
  {
    id: 'toys',
    name: 'Giochi',
    icon: 'smile',
    description: 'Giocattoli e passatempi per gatti'
  },
  {
    id: 'accessories',
    name: 'Accessori',
    icon: 'package',
    description: 'Accessori utili per gatti'
  },
  {
    id: 'health',
    name: 'Salute',
    icon: 'heart',
    description: 'Prodotti per la salute dei gatti'
  },
  {
    id: 'grooming',
    name: 'Cura',
    icon: 'scissors',
    description: 'Prodotti per la cura del pelo'
  }
];

// Dati di esempio per i prodotti
const mockProducts = [
  {
    title: 'Royal Canin Kitten - Cibo secco per gattini',
    description: 'Alimento completo specificamente formulato per gattini fino a 12 mesi di età. Contiene tutti i nutrienti essenziali per una crescita sana, con proteine di alta qualità, vitamine e minerali.',
    price: 24.99,
    original_price: 29.99,
    currency: '€',
    images: [
      'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=400',
      'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400'
    ],
    category: 'food',
    brand: 'Royal Canin',
    affiliate_url: 'https://amazon.it/royal-canin-kitten',
    affiliate_network: 'amazon',
    commission: 5.0,
    rating: 4.5,
    review_count: 1250,
    availability: 'in_stock',
    tags: ['gattini', 'cibo secco', 'crescita', 'nutrizione completa']
  },
  {
    title: 'Gioco interattivo per gatti con piume',
    description: 'Bacchetta magica con piume colorate per stimolare l\'istinto di caccia del tuo gatto. Perfetto per sessioni di gioco e esercizio.',
    price: 12.99,
    currency: '€',
    images: [
      'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400',
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400'
    ],
    category: 'toys',
    brand: 'PetPlay',
    affiliate_url: 'https://zooplus.it/cat-toy-feather',
    affiliate_network: 'zooplus',
    commission: 8.0,
    rating: 4.2,
    review_count: 856,
    availability: 'in_stock',
    tags: ['giochi', 'piume', 'interattivo', 'esercizio']
  },
  {
    title: 'Trasportino per gatti - Misura Medium',
    description: 'Trasportino sicuro e confortevole per viaggi con il tuo gatto. Dotato di apertura superiore e frontale, perfetto per visite veterinarie e viaggi.',
    price: 45.00,
    original_price: 55.00,
    currency: '€',
    images: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'
    ],
    category: 'accessories',
    brand: 'TravelPet',
    affiliate_url: 'https://amazon.it/cat-carrier',
    affiliate_network: 'amazon',
    commission: 6.0,
    rating: 4.7,
    review_count: 423,
    availability: 'in_stock',
    tags: ['trasporto', 'viaggio', 'sicurezza', 'veterinario']
  },
  {
    title: 'Sheba Deluxe - Paté assortiti',
    description: 'Confezione da 12 vaschette di paté per gatti con gusti assortiti. Ricetta senza cereali con vero pesce e carne.',
    price: 18.50,
    original_price: 22.00,
    currency: '€',
    images: [
      'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400'
    ],
    category: 'food',
    brand: 'Sheba',
    affiliate_url: 'https://amazon.it/sheba-deluxe-pate',
    affiliate_network: 'amazon',
    commission: 4.5,
    rating: 4.3,
    review_count: 2100,
    availability: 'in_stock',
    tags: ['paté', 'umido', 'senza cereali', 'multipack']
  },
  {
    title: 'Tiragraffi con cuccia - Torre 120cm',
    description: 'Tiragraffi alto con multiple piattaforme, cucce e giochi sospesi. Perfetto per gatti che amano arrampicarsi e graffiare.',
    price: 89.99,
    original_price: 119.99,
    currency: '€',
    images: [
      'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400',
      'https://images.unsplash.com/photo-1573406327961-d3d1cb0b3c6d?w=400'
    ],
    category: 'accessories',
    brand: 'CatTree Pro',
    affiliate_url: 'https://zooplus.it/cat-tree-120cm',
    affiliate_network: 'zooplus',
    commission: 10.0,
    rating: 4.8,
    review_count: 324,
    availability: 'in_stock',
    tags: ['tiragraffi', 'cuccia', 'torre', 'esercizio', 'arredamento']
  },
  {
    title: 'Spazzola per gatti pelo lungo',
    description: 'Spazzola professionale per la cura del pelo di gatti a pelo lungo. Riduce la formazione di nodi e la perdita di pelo.',
    price: 16.99,
    currency: '€',
    images: [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400'
    ],
    category: 'grooming',
    brand: 'GroomMaster',
    affiliate_url: 'https://amazon.it/brush-long-hair-cats',
    affiliate_network: 'amazon',
    commission: 7.0,
    rating: 4.4,
    review_count: 890,
    availability: 'in_stock',
    tags: ['spazzola', 'pelo lungo', 'cura', 'professionale']
  },
  {
    title: 'Integratore Omega-3 per gatti',
    description: 'Integratore alimentare con Omega-3 per mantenere il pelo lucido e la pelle sana. Formula naturale con olio di pesce.',
    price: 28.50,
    currency: '€',
    images: [
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400'
    ],
    category: 'health',
    brand: 'VetHealth',
    affiliate_url: 'https://amazon.it/omega3-cats-supplement',
    affiliate_network: 'amazon',
    commission: 8.5,
    rating: 4.6,
    review_count: 567,
    availability: 'in_stock',
    tags: ['integratore', 'omega3', 'pelo', 'pelle', 'salute']
  },
  {
    title: 'Pallina con sonaglio - Set 6 pezzi',
    description: 'Set di 6 palline colorate con sonaglio interno. Perfette per far giocare il gatto in autonomia.',
    price: 8.99,
    currency: '€',
    images: [
      'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400'
    ],
    category: 'toys',
    brand: 'PlayFun',
    affiliate_url: 'https://zooplus.it/balls-with-bells-6pack',
    affiliate_network: 'zooplus',
    commission: 9.0,
    rating: 4.1,
    review_count: 1450,
    availability: 'in_stock',
    tags: ['palline', 'sonaglio', 'multipack', 'gioco indipendente']
  }
];

/**
 * Popola le categorie nel database
 */
export const seedCategories = async (): Promise<ApiResponse<boolean>> => {
  try {
    console.log('🌱 Inserimento categorie...');
    
    const { data, error } = await supabase
      .from('product_categories')
      .upsert(mockCategories, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('❌ Errore inserimento categorie:', error);
      return { success: false, msg: error.message };
    }
    
    console.log('✅ Categorie inserite con successo');
    return { success: true, data: true };
    
  } catch (error) {
    console.error('❌ Errore durante il seeding categorie:', error);
    return { success: false, msg: 'Errore inserimento categorie' };
  }
};

/**
 * Popola i prodotti nel database
 */
export const seedProducts = async (): Promise<ApiResponse<boolean>> => {
  try {
    console.log('🌱 Inserimento prodotti...');
    
    const { data, error } = await supabase
      .from('affiliate_products')
      .insert(mockProducts);
    
    if (error) {
      console.error('❌ Errore inserimento prodotti:', error);
      return { success: false, msg: error.message };
    }
    
    console.log("✅ Dati e-commerce inizializzati con successo!");
    return { success: true, data: true };
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error);
    return { success: false, msg: 'Errore durante l\'inizializzazione' };
  }
};

/**
 * Rimuove tutti i dati di test dal database
 */
export const clearTestData = async (): Promise<void> => {
  console.log("🧹 Rimozione dati di test...");

  try {
    // Rimuovi tutti i click sui prodotti (per evitare vincoli foreign key)
    const { error: clicksError } = await supabase
      .from("product_clicks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Condizione che matcha tutti

    if (clicksError) {
      console.error("Errore rimozione clicks:", clicksError);
    }

    // Rimuovi tutti i prodotti
    const { error: productsError } = await supabase
      .from("affiliate_products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Condizione che matcha tutti

    if (productsError) {
      console.error("Errore rimozione prodotti:", productsError);
    }

    // Rimuovi tutte le categorie
    const { error: categoriesError } = await supabase
      .from("product_categories")
      .delete()
      .neq("id", ""); // Condizione che matcha tutti

    if (categoriesError) {
      console.error("Errore rimozione categorie:", categoriesError);
    }

    console.log("✅ Dati di test rimossi con successo!");
  } catch (error) {
    console.error("❌ Errore durante la rimozione dei dati:", error);
    throw error;
  }
};

/**
 * Popola tutto il database con i dati di test
 */
export const seedEcommerceData = async (): Promise<ApiResponse<boolean>> => {
  try {
    console.log('🚀 Avvio popolamento database ecommerce...');
    
    // Prima le categorie
    const categoriesResult = await seedCategories();
    if (!categoriesResult.success) {
      return categoriesResult;
    }
    
    // Poi i prodotti
    const productsResult = await seedProducts();
    if (!productsResult.success) {
      return productsResult;
    }
    
    console.log(`🎉 Database popolato con successo!`);
    console.log(`📊 ${mockCategories.length} categorie e ${mockProducts.length} prodotti inseriti`);
    
    return { success: true, data: true };
    
  } catch (error) {
    console.error('❌ Errore generale durante il seeding:', error);
    return { success: false, msg: 'Errore popolamento database' };
  }
};

/**
 * Pulisce tutti i dati ecommerce (utile per test)
 */
export const clearEcommerceData = async (): Promise<ApiResponse<boolean>> => {
  try {
    console.log('🧹 Pulizia dati ecommerce...');
    
    // Prima cancella i click (foreign key)
    await supabase.from('product_clicks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Poi i prodotti
    await supabase.from('affiliate_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Infine le categorie
    await supabase.from('product_categories').delete().neq('id', 'nonexistent');
    
    console.log('✅ Dati puliti con successo');
    return { success: true, data: true };
    
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    return { success: false, msg: 'Errore pulizia database' };
  }
};

export { mockCategories, mockProducts };
