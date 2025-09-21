import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserWithBasicInfo } from './userService';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10; // Massimo numero di ricerche recenti da mantenere

export interface RecentSearch extends UserWithBasicInfo {
  searchedAt: number; // timestamp di quando è stato cercato
}

/**
 * Carica le ricerche recenti da AsyncStorage
 */
export const loadRecentSearches = async (): Promise<RecentSearch[]> => {
  try {
    const recentSearchesJson = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    if (recentSearchesJson) {
      const recentSearches: RecentSearch[] = JSON.parse(recentSearchesJson);
      // Ordina per data più recente
      return recentSearches.sort((a, b) => b.searchedAt - a.searchedAt);
    }
    return [];
  } catch (error) {
    console.error('Error loading recent searches:', error);
    return [];
  }
};

/**
 * Salva un utente nelle ricerche recenti
 */
export const saveRecentSearch = async (user: UserWithBasicInfo): Promise<void> => {
  try {
    const currentSearches = await loadRecentSearches();
    
    // Rimuovi l'utente se già presente (per evitare duplicati)
    const filteredSearches = currentSearches.filter(search => search.id !== user.id);
    
    // Aggiungi il nuovo utente in cima
    const newRecentSearch: RecentSearch = {
      ...user,
      searchedAt: Date.now()
    };
    
    const updatedSearches = [newRecentSearch, ...filteredSearches];
    
    // Mantieni solo i primi MAX_RECENT_SEARCHES elementi
    const limitedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);
    
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(limitedSearches));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
};

/**
 * Rimuove un utente specifico dalle ricerche recenti
 */
export const removeRecentSearch = async (userId: string): Promise<void> => {
  try {
    const currentSearches = await loadRecentSearches();
    const filteredSearches = currentSearches.filter(search => search.id !== userId);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filteredSearches));
  } catch (error) {
    console.error('Error removing recent search:', error);
  }
};

/**
 * Cancella tutte le ricerche recenti
 */
export const clearAllRecentSearches = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
};

/**
 * Controlla se un utente è già nelle ricerche recenti
 */
export const isUserInRecentSearches = async (userId: string): Promise<boolean> => {
  try {
    const recentSearches = await loadRecentSearches();
    return recentSearches.some(search => search.id === userId);
  } catch (error) {
    console.error('Error checking recent searches:', error);
    return false;
  }
};
