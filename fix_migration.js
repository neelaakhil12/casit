import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://frdqhmpbuimzlbklbhaa.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZHFobXBidWltemxia2xiaGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjQ3NTksImV4cCI6MjEwMjIwMDc1OX0.EksUybhCodVe_NiiTUhxcsJNiQPsgofAySFa5odBWtY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const productsData = [
  {
    title: 'Solo Leveling - Shadow Monarch',
    categoryName: 'Anime',
    base_price: 299,
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    description: 'Bring the epic aura of the Shadow Monarch to your gaming room. Printed on 300GSM premium matte paper with ultra-high resolution ink.'
  },
  {
    title: 'Cyberpunk Neo-Tokyo Street',
    categoryName: 'Anime',
    base_price: 349,
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    description: 'Vibrant neon street aesthetics of future Tokyo. Ideal for setting a chill, lofi, or synthwave vibe in your study or bedroom.'
  },
  {
    title: 'Interstellar - Gargantua Black Hole',
    categoryName: 'Movies & Series',
    base_price: 399,
    image_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop',
    description: 'A scientifically accurate and breathtaking illustration of the Gargantua black hole from Christopher Nolan\'s masterpiece.'
  }
];

async function runFix() {
  const { data: dbCategories, error } = await supabase.from('categories').select('id, name');
  if (error) {
    console.error("Error fetching categories:", error);
    return;
  }
  
  const catMap = {};
  dbCategories.forEach(c => catMap[c.name.toLowerCase()] = c.id);

  for (const prod of productsData) {
    const { data: existing } = await supabase.from('products').select('id').eq('title', prod.title).maybeSingle();
    if (!existing) {
      const category_id = catMap[prod.categoryName.toLowerCase()];
      if (category_id) {
        const { error: insErr } = await supabase.from('products').insert([{
          title: prod.title,
          base_price: prod.base_price,
          image_url: prod.image_url,
          description: prod.description,
          category_id: category_id
        }]);
        if (insErr) console.error("Insert error:", insErr);
        else console.log(`Fixed product: ${prod.title}`);
      } else {
        console.log(`Still not found: ${prod.categoryName}`);
      }
    }
  }
}

runFix();
