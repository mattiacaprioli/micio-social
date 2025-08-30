
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  msg?: string;
  error?: SupabaseError;
}

export interface CreatePostData {
  file?: {
    uri: string;
    type: "image" | "video";
  } | string;
  body?: string;
  userId: string;
  id?: string;
}

// Interfacce per l'ecommerce affiliate
export interface AffiliateProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  category: 'food' | 'toys' | 'accessories' | 'health' | 'grooming' | 'other';
  brand?: string;
  affiliateUrl: string;
  affiliateNetwork: 'amazon' | 'zooplus' | 'ebay' | 'other';
  commission: number; // percentuale
  rating?: number;
  reviewCount?: number;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  tags?: string[];
}

export interface ProductClick {
  id: string;
  userId: string;
  productId: string;
  timestamp: string;
  converted?: boolean; // se ha completato l'acquisto
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total: number;
  nextOffset: number;
}

// ===============================
// PETS INTERFACES
// ===============================

export interface Pet {
  id: string;
  userId: string;
  name: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  bio?: string;
  image?: string;
  weight?: number;
  birthDate?: string;
  isNeutered?: boolean;
  medicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetData {
  userId: string;
  name: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  bio?: string;
  image?: string;
  weight?: number;
  birthDate?: string;
  isNeutered?: boolean;
  medicalNotes?: string;
}

export interface UpdatePetData {
  name?: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  bio?: string;
  image?: string;
  weight?: number;
  birthDate?: string;
  isNeutered?: boolean;
  medicalNotes?: string;
}

// Pets

export interface Pet {
  id: string;
  userId: string;
  name: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  bio?: string;
  image?: string;
  weight?: number;
  birthDate?: string;
  isNeutered?: boolean;
  medicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetData {
  userId: string;
  name: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  bio?: string;
  image?: string;
  weight?: number;
  birthDate?: string;
  isNeutered?: boolean;
  medicalNotes?: string;
}

export interface UpdatePetData {
  name?: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  bio?: string;
  image?: string;
  weight?: number;
  birthDate?: string;
  isNeutered?: boolean;
  medicalNotes?: string;
}