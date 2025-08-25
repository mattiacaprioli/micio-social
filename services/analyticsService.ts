/**
 * Servizio semplificato per analytics e tracking dell'ecommerce affiliate
 */

import { supabase } from '../lib/supabase';
import { ApiResponse } from './types';

export interface SimpleAnalyticsData {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  topProductIds: string[];
  topCategories: string[];
}

/**
 * Servizio semplificato per analytics ecommerce
 */
export class EcommerceAnalyticsService {
  
  /**
   * Ottiene statistiche semplici dei click
   */
  async getSimpleStats(dateFrom?: string, dateTo?: string): Promise<ApiResponse<SimpleAnalyticsData>> {
    try {
      let query = supabase.from('product_clicks').select('*');
      
      if (dateFrom) query = query.gte('clicked_at', dateFrom);
      if (dateTo) query = query.lte('clicked_at', dateTo);

      const { data, error } = await query;

      if (error) {
        console.error('Error getting analytics:', error);
        return { success: false, msg: 'Could not fetch analytics data' };
      }

      const totalClicks = data?.length || 0;
      const totalConversions = data?.filter(click => click.converted).length || 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Conta i click per prodotto
      const productClickCount = new Map<string, number>();
      data?.forEach(click => {
        const count = productClickCount.get(click.product_id) || 0;
        productClickCount.set(click.product_id, count + 1);
      });

      const topProductIds = Array.from(productClickCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productId]) => productId);

      const analyticsData: SimpleAnalyticsData = {
        totalClicks,
        totalConversions,
        conversionRate,
        topProductIds,
        topCategories: ['food', 'toys', 'accessories'] // Mock per ora
      };

      return { success: true, data: analyticsData };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return { success: false, msg: 'Could not fetch analytics data' };
    }
  }

  /**
   * Ottiene il numero totale di click di un utente
   */
  async getUserClickCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('product_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting user click count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting user click count:', error);
      return 0;
    }
  }

  /**
   * Ottiene i click recenti di un utente
   */
  async getUserRecentClicks(userId: string, limit = 10): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('product_clicks')
        .select('*, created_at:clicked_at')
        .eq('user_id', userId)
        .order('clicked_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting user recent clicks:', error);
        return { success: false, msg: 'Could not fetch recent clicks' };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error getting user recent clicks:', error);
      return { success: false, msg: 'Could not fetch recent clicks' };
    }
  }

  /**
   * Traccia eventi personalizzati (semplificato)
   */
  async trackEvent(eventType: string, eventData: Record<string, any>, userId?: string): Promise<ApiResponse<boolean>> {
    try {
      // Per ora logghiamo semplicemente
      console.log('Event tracked:', {
        type: eventType,
        data: eventData,
        userId,
        timestamp: new Date().toISOString()
      });

      return { success: true, data: true };
    } catch (error) {
      console.error('Error tracking event:', error);
      return { success: false, msg: 'Could not track event' };
    }
  }
}

// Istanza singleton del servizio analytics
export const analyticsService = new EcommerceAnalyticsService();
