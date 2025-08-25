/**
 * Script per verificare se le tabelle dell'ecommerce esistono già
 */

import { supabase } from '../lib/supabase';

export const checkEcommerceTables = async () => {
  console.log('🔍 Verifico esistenza tabelle ecommerce...');

  try {
    // Test tabella product_categories
    const { data: categories, error: catError } = await supabase
      .from('product_categories')
      .select('count(*)', { count: 'exact', head: true });

    if (catError) {
      console.log('❌ Tabella product_categories NON esiste');
      console.log('Errore:', catError.message);
    } else {
      console.log('✅ Tabella product_categories esiste');
      console.log(`📊 Categorie presenti: ${categories}`);
    }

    // Test tabella affiliate_products
    const { data: products, error: prodError } = await supabase
      .from('affiliate_products')
      .select('count(*)', { count: 'exact', head: true });

    if (prodError) {
      console.log('❌ Tabella affiliate_products NON esiste');
      console.log('Errore:', prodError.message);
    } else {
      console.log('✅ Tabella affiliate_products esiste');
      console.log(`📦 Prodotti presenti: ${products}`);
    }

    // Test tabella product_clicks
    const { data: clicks, error: clickError } = await supabase
      .from('product_clicks')
      .select('count(*)', { count: 'exact', head: true });

    if (clickError) {
      console.log('❌ Tabella product_clicks NON esiste');
      console.log('Errore:', clickError.message);
    } else {
      console.log('✅ Tabella product_clicks esiste');
      console.log(`👆 Click registrati: ${clicks}`);
    }

    console.log('\n🎯 Risultato controllo:');
    if (!catError && !prodError && !clickError) {
      console.log('✅ Tutte le tabelle ecommerce esistono già!');
      console.log('🎉 Puoi procedere direttamente con il popolamento dati.');
      return true;
    } else {
      console.log('⚠️  Alcune tabelle mancano. Devi eseguire lo script SQL.');
      return false;
    }

  } catch (error) {
    console.log('❌ Errore durante la verifica:', error);
    return false;
  }
};

// Se il file viene eseguito direttamente, esegui il check
if (typeof window === 'undefined') {
  checkEcommerceTables();
}
