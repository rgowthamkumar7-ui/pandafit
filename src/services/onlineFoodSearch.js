/**
 * Accurate Online & Indian Food Search Service
 * Powered by ICMR-NIN verified nutritional database,
 * Open Food Facts Web Search API, and Google Nutrition intelligence.
 */

import { INDIAN_FOOD_DATABASE } from '../data/indianFoodDatabase';
import { analyzeFoodWithGoogleAI } from './googleNutritionService';

// Curated high-accuracy visual & macro profiles for common queries
const CATEGORY_PROFILES = [
  // ── DOSAS (INDIVIDUAL UNITS) ──
  {
    regex: /\b(plain\s*dosa|sada\s*dosa|crispy\s*dosa)\b/i,
    name: 'Plain Dosa',
    portionWeightGrams: 80,
    serving: '1 piece (80g)',
    calories: 135,
    protein: 3.2,
    carbs: 22,
    fat: 3.8,
    fiber: 1.5,
    diet: 'veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(masala\s*dosa|aloo\s*dosa)\b/i,
    name: 'Masala Dosa',
    portionWeightGrams: 150,
    serving: '1 piece (150g with potato bhaji)',
    calories: 260,
    protein: 4.8,
    carbs: 36,
    fat: 11,
    fiber: 3.2,
    diet: 'veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(rava\s*dosa|sooji\s*dosa)\b/i,
    name: 'Rava Dosa (Crispy Semolina)',
    portionWeightGrams: 100,
    serving: '1 piece (100g lacy sooji dosa)',
    calories: 180,
    protein: 4.0,
    carbs: 28,
    fat: 6.0,
    fiber: 2.0,
    diet: 'veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(onion\s*rava\s*dosa|onion\s*dosa)\b/i,
    name: 'Onion Rava Dosa',
    portionWeightGrams: 120,
    serving: '1 piece (120g with sautéed onions)',
    calories: 210,
    protein: 4.5,
    carbs: 31,
    fat: 7.5,
    fiber: 2.5,
    diet: 'veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(paneer\s*dosa)\b/i,
    name: 'Paneer Dosa',
    portionWeightGrams: 160,
    serving: '1 piece (160g filled with spiced paneer)',
    calories: 310,
    protein: 11.5,
    carbs: 26,
    fat: 18,
    fiber: 2.2,
    diet: 'veg',
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(egg\s*dosa|muttai\s*dosa)\b/i,
    name: 'Egg Dosa (Muttai Dosa)',
    portionWeightGrams: 140,
    serving: '1 piece (140g layered with beaten egg)',
    calories: 225,
    protein: 9.0,
    carbs: 24,
    fat: 10,
    fiber: 1.5,
    diet: 'non-veg',
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  },

  // ── IDLI & VADA ──
  {
    regex: /\b(idli|steamed\s*idli|rice\s*idli|idly)\b/i,
    name: 'Steamed Idli',
    portionWeightGrams: 45,
    serving: '1 piece (45g soft steamed fermented cake)',
    calories: 58,
    protein: 2.0,
    carbs: 12,
    fat: 0.2,
    fiber: 1.2,
    diet: 'veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(medu\s*vada|vada|urad\s*vada|garelu)\b/i,
    name: 'Medu Vada (Urad Dal Vada)',
    portionWeightGrams: 50,
    serving: '1 piece (50g crispy golden lentil donut)',
    calories: 145,
    protein: 4.2,
    carbs: 13,
    fat: 8.5,
    fiber: 2.2,
    diet: 'veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
  },

  // ── SAMBAR & CHUTNEYS ──
  {
    regex: /\b(sambar|sambhar|kuzhambu)\b/i,
    name: 'South Indian Sambar',
    portionWeightGrams: 150,
    serving: '1 cup / katori (150g toor dal lentil vegetable stew)',
    calories: 75,
    protein: 3.5,
    carbs: 11,
    fat: 1.8,
    fiber: 3.0,
    diet: 'veg',
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(coconut\s*chutney|white\s*chutney)\b/i,
    name: 'Fresh Coconut Chutney',
    portionWeightGrams: 30,
    serving: '2 tablespoons (30g)',
    calories: 65,
    protein: 0.8,
    carbs: 2.2,
    fat: 6.0,
    fiber: 1.2,
    diet: 'veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  },

  // ── TEAS, COFFEES & BEVERAGES ──
  {
    regex: /\b(chai|tea|masala\s*chai|ginger\s*tea|cutting\s*chai)\b/i,
    name: 'Masala Chai (Indian Milk Tea)',
    portionWeightGrams: 120,
    serving: '1 cup (120ml whole milk brewed with spices)',
    calories: 85,
    protein: 3.0,
    carbs: 10,
    fat: 3.5,
    fiber: 0,
    diet: 'veg',
    category: 'snack',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(coffee|filter\s*coffee|degree\s*coffee|kaapi)\b/i,
    name: 'South Indian Filter Coffee',
    portionWeightGrams: 120,
    serving: '1 dabara-tumbler (120ml whole milk chicory brew)',
    calories: 95,
    protein: 3.2,
    carbs: 11,
    fat: 4.0,
    fiber: 0,
    diet: 'veg',
    category: 'snack',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(buttermilk|neer\s*mor|majjiga|chaas)\b/i,
    name: 'Neer Mor / Spiced Buttermilk',
    portionWeightGrams: 250,
    serving: '1 tall glass (250ml churned yogurt with ginger & curry leaves)',
    calories: 55,
    protein: 3.0,
    carbs: 4.5,
    fat: 2.2,
    fiber: 0.5,
    diet: 'veg',
    category: 'snack',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
  },

  // ── BREADS & ROTIS ──
  {
    regex: /\b(chapati|chappati|roti)\b/i,
    name: 'Whole Wheat Chapati (with light oil)',
    portionWeightGrams: 35,
    serving: '1 piece (35g whole wheat flatbread)',
    calories: 85,
    protein: 3.0,
    carbs: 17,
    fat: 0.8,
    fiber: 2.4,
    diet: 'veg',
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(phulka|dry\s*roti)\b/i,
    name: 'Phulka (No Oil / Flame Puffed)',
    portionWeightGrams: 25,
    serving: '1 piece (25g dry puffed whole wheat phulka)',
    calories: 65,
    protein: 2.5,
    carbs: 14,
    fat: 0.3,
    fiber: 2.0,
    diet: 'veg',
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(parotta|porotta|malabar\s*parotta)\b/i,
    name: 'Malabar Parotta (Kerala Parotta)',
    portionWeightGrams: 80,
    serving: '1 piece (80g flaky layered bread)',
    calories: 260,
    protein: 5.5,
    carbs: 36,
    fat: 10.5,
    fiber: 1.8,
    diet: 'veg',
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
  },

  // ── RICE & BIRYANI ──
  {
    regex: /\b(chicken\s*biryani|dum\s*biryani|biriyani)\b/i,
    name: 'Hyderabadi Chicken Dum Biryani',
    portionWeightGrams: 350,
    serving: '1 plate (350g fragrant basmati with tender spiced chicken)',
    calories: 480,
    protein: 26,
    carbs: 58,
    fat: 16,
    fiber: 3.5,
    diet: 'non-veg',
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(curd\s*rice|thayir\s*sadam)\b/i,
    name: 'Curd Rice (Thayir Sadam)',
    portionWeightGrams: 200,
    serving: '1 bowl (200g yogurt rice with tempered mustard)',
    calories: 220,
    protein: 5.5,
    carbs: 34,
    fat: 7.0,
    fiber: 1.8,
    diet: 'veg',
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(white\s*rice|steamed\s*rice|boiled\s*rice|annam)\b/i,
    name: 'Steamed White Rice (Cooked)',
    portionWeightGrams: 150,
    serving: '1 cup / katori (150g cooked rice)',
    calories: 195,
    protein: 4.0,
    carbs: 43,
    fat: 0.5,
    fiber: 1.0,
    diet: 'veg',
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80',
  },

  // ── CURRIES & PROTEINS ──
  {
    regex: /\b(paneer\s*butter\s*masala|paneer\s*curry|paneer\s*makhani)\b/i,
    name: 'Paneer Butter Masala',
    portionWeightGrams: 150,
    serving: '1 katori (150g paneer in tomato-butter gravy)',
    calories: 240,
    protein: 8.0,
    carbs: 10,
    fat: 19,
    fiber: 2.0,
    diet: 'veg',
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(palak\s*paneer)\b/i,
    name: 'Palak Paneer (Spinach & Paneer)',
    portionWeightGrams: 150,
    serving: '1 katori (150g spinach puree with paneer cubes)',
    calories: 190,
    protein: 9.5,
    carbs: 7.0,
    fat: 14,
    fiber: 3.5,
    diet: 'veg',
    category: 'dinner',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(dal\s*tadka|yellow\s*dal|toor\s*dal|dal\s*fry)\b/i,
    name: 'Yellow Dal Tadka',
    portionWeightGrams: 150,
    serving: '1 katori (150g yellow lentils with cumin-garlic tadka)',
    calories: 140,
    protein: 7.5,
    carbs: 18,
    fat: 4.5,
    fiber: 4.0,
    diet: 'veg',
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(boiled\s*egg|egg|hard\s*boiled\s*egg)\b/i,
    name: 'Boiled Egg (Whole)',
    portionWeightGrams: 50,
    serving: '1 large egg (50g)',
    calories: 74,
    protein: 6.3,
    carbs: 0.4,
    fat: 5.0,
    fiber: 0,
    diet: 'non-veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(omelette|egg\s*omelette|masala\s*omelette)\b/i,
    name: 'Masala Egg Omelette',
    portionWeightGrams: 65,
    serving: '1 egg omelette (65g with onion & chilli)',
    calories: 110,
    protein: 6.8,
    carbs: 1.5,
    fat: 8.5,
    fiber: 0.3,
    diet: 'non-veg',
    category: 'breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(chicken\s*65)\b/i,
    name: 'Chicken 65 (Crispy Deep-Fried)',
    portionWeightGrams: 100,
    serving: '1 plate (100g spicy boneless bites)',
    calories: 230,
    protein: 18,
    carbs: 8.0,
    fat: 14,
    fiber: 1.0,
    diet: 'non-veg',
    category: 'snack',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(chicken\s*curry|chettinad\s*chicken|chicken\s*masala)\b/i,
    name: 'Chettinad Spicy Chicken Curry',
    portionWeightGrams: 150,
    serving: '1 katori (150g chicken in roasted spice gravy)',
    calories: 210,
    protein: 19,
    carbs: 5.0,
    fat: 13,
    fiber: 1.8,
    diet: 'non-veg',
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  },
  {
    regex: /\b(fish\s*curry|meen\s*curry|meen\s*kuzhambu)\b/i,
    name: 'Kerala Fish Curry (Meen Kuzhambu)',
    portionWeightGrams: 180,
    serving: '1 bowl (180g fish steak in cocum sauce)',
    calories: 185,
    protein: 18,
    carbs: 6.0,
    fat: 10,
    fiber: 1.2,
    diet: 'non-veg',
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
  }
];

/**
 * Returns instant live autocomplete dropdown suggestions as the user types.
 * If query is "dosa", returns all dosa varieties (Plain, Masala, Rava, Paneer, Egg, etc.)!
 * @param {string} query
 * @param {number} limit
 * @returns {Array} suggestions with image, name, calories, protein, and gram serving
 */
export function getLiveSearchSuggestions(query, limit = 8) {
  if (!query || query.trim().length < 1) return [];

  const q = query.trim().toLowerCase();
  const matched = [];
  const seenNames = new Set();

  // 1. Search in local verified database (includes all sub-varieties)
  for (const item of INDIAN_FOOD_DATABASE) {
    const nameMatch = item.name.toLowerCase().includes(q);
    const regionalMatch = item.regionalName?.toLowerCase().includes(q);
    const tagMatch = item.tags?.some(t => t.toLowerCase().includes(q));

    if (nameMatch || regionalMatch || tagMatch) {
      if (!seenNames.has(item.name.toLowerCase())) {
        seenNames.add(item.name.toLowerCase());
        matched.push({
          id: item.id,
          name: item.name,
          portionWeightGrams: item.portionWeightGrams,
          serving: item.serving,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber || 2,
          diet: item.diet,
          category: item.category,
          image: item.image,
          source: 'Verified Database'
        });
      }
    }
  }

  // 2. Search category profiles for any other specific match
  for (const profile of CATEGORY_PROFILES) {
    if (profile.regex.test(q)) {
      if (!seenNames.has(profile.name.toLowerCase())) {
        seenNames.add(profile.name.toLowerCase());
        matched.push({
          id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: profile.name,
          portionWeightGrams: profile.portionWeightGrams,
          serving: profile.serving,
          calories: profile.calories,
          protein: profile.protein,
          carbs: profile.carbs,
          fat: profile.fat,
          fiber: profile.fiber,
          diet: profile.diet,
          category: profile.category,
          image: profile.image,
          source: 'Verified Profile'
        });
      }
    }
  }

  // Sort: Exact prefix matches first
  matched.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(q) ? 1 : 0;
    const bStarts = b.name.toLowerCase().startsWith(q) ? 1 : 0;
    return bStarts - aStarts;
  });

  return matched.slice(0, limit);
}

/**
 * Searches internet and verified databases for the specified food item.
 * Searches local verified items first (returns all varieties), then queries Open Food Facts API,
 * and uses smart nutrition estimation if needed.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchInternetFoods(query) {
  if (!query || query.trim().length < 1) return [];

  const cleanQuery = query.trim().toLowerCase();
  const results = [];
  const seenNames = new Set();

  // 1. First, populate from our verified Indian food library (matches all varieties like rawa dosa, paneer dosa, etc.)
  for (const item of INDIAN_FOOD_DATABASE) {
    const nameMatch = item.name.toLowerCase().includes(cleanQuery);
    const regionalMatch = item.regionalName?.toLowerCase().includes(cleanQuery);
    const tagMatch = item.tags?.some(t => t.toLowerCase().includes(cleanQuery));

    if (nameMatch || regionalMatch || tagMatch) {
      if (!seenNames.has(item.name.toLowerCase())) {
        seenNames.add(item.name.toLowerCase());
        results.push({
          id: item.id,
          name: item.name,
          portionWeightGrams: item.portionWeightGrams,
          serving: item.serving,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber || 2,
          diet: item.diet,
          category: item.category,
          image: item.image,
          source: 'PandaFit Verified'
        });
      }
    }
  }

  // 2. Query Google Gemini AI Nutrition Analysis if available
  try {
    const googleAiResult = await analyzeFoodWithGoogleAI(cleanQuery);
    if (googleAiResult && !seenNames.has(googleAiResult.name.toLowerCase())) {
      seenNames.add(googleAiResult.name.toLowerCase());
      results.unshift({
        id: `google-${Date.now()}`,
        name: googleAiResult.name,
        portionWeightGrams: googleAiResult.portionWeightGrams || 120,
        serving: googleAiResult.serving || `1 serving (~${googleAiResult.portionWeightGrams || 120}g)`,
        calories: googleAiResult.calories,
        protein: googleAiResult.protein,
        carbs: googleAiResult.carbs,
        fat: googleAiResult.fat,
        fiber: googleAiResult.fiber || 2,
        diet: googleAiResult.diet || 'veg',
        category: googleAiResult.category || determineCategory(googleAiResult.name, googleAiResult.calories),
        image: getFallbackImage(googleAiResult.name),
        source: 'Google Gemini AI'
      });
    }
  } catch (e) {
    // Graceful offline fallback
  }

  // 3. Query Open Food Facts Web Search API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      cleanQuery
    )}&search_simple=1&action=process&json=1&page_size=8`;

    const response = await fetch(offUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.products && Array.isArray(data.products)) {
        for (const prod of data.products) {
          const name = prod.product_name_en || prod.product_name;
          if (!name || seenNames.has(name.toLowerCase())) continue;

          const nutriments = prod.nutriments || {};
          const calories = Math.round(
            nutriments['energy-kcal_100g'] ||
            nutriments['energy-kcal'] ||
            (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0) ||
            150
          );

          if (calories <= 0) continue;

          const protein = Math.round((nutriments.proteins_100g || nutriments.proteins || 4) * 10) / 10;
          const carbs = Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 20) * 10) / 10;
          const fat = Math.round((nutriments.fat_100g || nutriments.fat || 5) * 10) / 10;
          const servingGrams = prod.serving_quantity ? Math.round(Number(prod.serving_quantity)) : 100;

          seenNames.add(name.toLowerCase());
          results.push({
            id: `off-${prod.code || Math.random().toString(36).substr(2, 6)}`,
            name: name.slice(0, 50),
            portionWeightGrams: servingGrams,
            serving: prod.serving_size || `1 serving (~${servingGrams}g)`,
            calories,
            protein,
            carbs,
            fat,
            fiber: Math.round((nutriments.fiber_100g || 1) * 10) / 10,
            diet: (nutriments.ingredients_text || '').toLowerCase().includes('meat') ||
                  (nutriments.ingredients_text || '').toLowerCase().includes('chicken')
              ? 'non-veg'
              : 'veg',
            category: determineCategory(name, calories),
            image: prod.image_front_small_url || prod.image_url || getFallbackImage(cleanQuery),
            source: 'Open Food Database'
          });
        }
      }
    }
  } catch (err) {
    // Graceful offline fallback
    console.log('Open Food Facts API request completed or timed out.');
  }

  // 3. Fallback to category profile matches if results are few
  if (results.length < 3) {
    for (const profile of CATEGORY_PROFILES) {
      if (profile.regex.test(cleanQuery)) {
        if (!seenNames.has(profile.name.toLowerCase())) {
          seenNames.add(profile.name.toLowerCase());
          results.push({
            id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: profile.name,
            portionWeightGrams: profile.portionWeightGrams,
            serving: profile.serving,
            calories: profile.calories,
            protein: profile.protein,
            carbs: profile.carbs,
            fat: profile.fat,
            fiber: profile.fiber,
            diet: profile.diet,
            category: profile.category,
            image: profile.image,
            source: 'Verified Profile'
          });
        }
      }
    }
  }

  return results;
}

function determineCategory(name, calories) {
  const n = (name || '').toLowerCase();
  if (n.includes('chai') || n.includes('coffee') || n.includes('tea') || n.includes('biscuit') || n.includes('snack') || n.includes('vada')) {
    return 'snack';
  }
  if (n.includes('idli') || n.includes('dosa') || n.includes('upma') || n.includes('pongal') || n.includes('pancake') || n.includes('cereal')) {
    return 'breakfast';
  }
  if (calories > 350 || n.includes('biryani') || n.includes('rice') || n.includes('thali') || n.includes('meals')) {
    return 'lunch';
  }
  return 'dinner';
}

function getFallbackImage(query) {
  const q = (query || '').toLowerCase();
  for (const profile of CATEGORY_PROFILES) {
    if (profile.regex.test(q)) {
      return profile.image;
    }
  }
  return 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80';
}
