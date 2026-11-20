// Cascadja Foods and Drinks - real menu + generated sample transactions.
// Menu names, prices and bestseller flags are transcribed from the owner's
// menu photos. Transaction rows are deterministic SAMPLE data (seed 20261120)
// so the capstone can be demonstrated before a POS/Foodpanda export is loaded.

const SEED = 20261120;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// name, category, hot/regular price, iced/large price (null = single price), bestseller
const MENU_ROWS = [
  // Coffee
  ['Americano', 'Coffee', 140, 150, false],
  ['Cappuccino', 'Coffee', 150, 160, false],
  ['Cafe Latte', 'Coffee', 150, 160, false],
  ['Spanish Latte', 'Coffee', 160, 170, true],
  ['White Chocolate', 'Coffee', 175, 185, false],
  ['Mocha', 'Coffee', 175, 185, false],
  ['Caramel Macchiato', 'Coffee', 170, 180, false],
  ['Dirty Matcha', 'Coffee', 175, 185, false],
  // Coffee-Based Frappe
  ['Matcha Frappe', 'Coffee-Based Frappe', 170, 180, false],
  ['Java Chip', 'Coffee-Based Frappe', 170, 180, true],
  ['Caffe Vanilla', 'Coffee-Based Frappe', 170, 180, false],
  ['White Chocolate Frappe', 'Coffee-Based Frappe', 170, 180, false],
  ['Mocha Frappe', 'Coffee-Based Frappe', 170, 180, false],
  ['Biscoff Frappe', 'Coffee-Based Frappe', 180, 190, false],
  // Signature
  ['Matcha Latte', 'Signature', 165, 175, true],
  ['Artisan Chocolate', 'Signature', 155, 165, false],
  ['Mango Graham Shake', 'Signature', 155, null, false],
  ['Choco Lava Matcha', 'Signature', 160, 170, false],
  ['Strawberry Matcha', 'Signature', 160, 170, false],
  ['Cake Milktea', 'Signature', 145, 150, false],
  // Real Fruit Smoothie
  ['Strawberry and Banana', 'Real Fruit Smoothie', 140, 150, false],
  ['Fresh Mango', 'Real Fruit Smoothie', 140, 150, true],
  // Ade
  ['Kiwi Ade', 'Ade', 90, 95, false],
  ['Green Apple Ade', 'Ade', 90, 95, true],
  ['Peach Ade', 'Ade', 90, 95, false],
  ['Classic Lemonade', 'Ade', 95, null, false],
  // Milktea
  ['Okinawa Milktea', 'Milktea', 90, 95, false],
  ['Wintermelon Milktea', 'Milktea', 90, 95, false],
  ['Matcha Milktea', 'Milktea', 90, 95, true],
  ['Dark Chocolate Milktea', 'Milktea', 90, 95, true],
  // Rice Meals
  ['Pork Sisig with Rice', 'Rice Meal', 145, null, true],
  ['Pork Sisig Platter', 'Rice Meal', 170, null, false],
  ['Katsudon', 'Rice Meal', 205, null, false],
  ['Tonkatsu', 'Rice Meal', 185, null, true],
  ['Hungarian', 'Rice Meal', 175, null, false],
  ['Spam and Egg', 'Rice Meal', 175, null, false],
  ['Garlic Pepper Beef', 'Rice Meal', 195, null, true],
  ['Chicken Pops', 'Rice Meal', 185, null, false],
  ['Garlic Honey Crunch', 'Rice Meal', 175, null, false],
  ['Gangnam Wings', 'Rice Meal', 175, null, false],
  // Pasta
  ['Carbonara', 'Pasta', 230, null, true],
  ['Italian Spaghetti', 'Pasta', 220, null, false],
  ['Filipino Style Spaghetti', 'Pasta', 220, null, false],
  // Snacks
  ['Classic Burger', 'Snacks', 245, null, false],
  ['Monte Cristo Sandwich', 'Snacks', 185, null, false],
  ['Nachos Overload', 'Snacks', 175, null, false],
  ['Savory Fries', 'Snacks', 180, null, true],
  ['BBQ Fries', 'Snacks', 145, null, true],
  ['Wrap Sandwich - Ham and Egg', 'Snacks', 165, null, false],
  ['Wrap Sandwich - Ham, Egg, and Cheese', 'Snacks', 175, null, false],
  // Tiramisu
  ['Classic Choco Tiramisu', 'Tiramisu', 160, null, true],
  ['Biscoff Tiramisu', 'Tiramisu', 165, null, false],
  ['Matcha Tiramisu', 'Tiramisu', 170, null, false],
  ['Cookies & Cream Tiramisu', 'Tiramisu', 165, null, false],
  // Croffles
  ['Nutella Croffle', 'Croffles', 170, null, true],
  ['Biscoff Croffle', 'Croffles', 180, null, false],
  ['Cookies and Cream Croffle', 'Croffles', 170, null, false],
  ['Alcapone Croffle', 'Croffles', 185, null, true],
  // Bread & Salad
  ['Croissant', 'Bread & Salad', 160, null, true],
];

const ADDON_ROWS = [
  ['Black Pearl', 10, true],
  ['Coffee Jelly', 10, false],
  ['Rainbow Jelly', 10, false],
  ['Creamcheese', 35, false],
  ['Cheesecake', 35, false],
  ['Cake', 35, false],
];

export const MENU = MENU_ROWS.map(([name, category, priceHot, priceIced, bestseller], i) => ({
  id: i + 1,
  name,
  category,
  priceHot,
  priceIced,
  hasTwoPrices: priceIced != null,
  bestseller,
}));

export const ADDONS = ADDON_ROWS.map(([name, price, bestseller], i) => ({
  id: i + 1,
  name,
  price,
  bestseller,
}));

export const DAYPARTS = ['Morning', 'Lunch', 'Afternoon', 'Evening', 'Late Night'];
export const CATEGORIES = [...new Set(MENU.map((m) => m.category))];
export const CHANNELS = ['Dine-in', 'Foodpanda'];

const DAYPART_HOURS = [
  [7, 11],   // Morning
  [11, 14],  // Lunch
  [14, 17],  // Afternoon
  [17, 21],  // Evening
  [21, 24],  // Late Night
];

// Category affinity by daypart (higher = more likely to be ordered then).
const AFFINITY = {
  Morning: { Coffee: 5, 'Bread & Salad': 3, 'Rice Meal': 1, Ade: 1 },
  Lunch: { 'Rice Meal': 6, Pasta: 4, Snacks: 3, Ade: 2, Milktea: 2 },
  Afternoon: { 'Coffee-Based Frappe': 5, Signature: 4, Milktea: 4, Tiramisu: 3, 'Real Fruit Smoothie': 3, Croffles: 3 },
  Evening: { 'Rice Meal': 5, Snacks: 4, Pasta: 3, Tiramisu: 3, 'Coffee-Based Frappe': 2 },
  'Late Night': { Snacks: 4, Tiramisu: 3, Croffles: 3, Milktea: 2, 'Coffee-Based Frappe': 2 },
};

const pick = (arr, random) => arr[Math.floor(random() * arr.length)];

function pickMenu(daypart, random) {
  const weights = MENU.map((m) => {
    const affinity = AFFINITY[daypart]?.[m.category] ?? 1.4;
    return affinity * (m.bestseller ? 1.8 : 1);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let ticket = random() * total;
  for (let i = 0; i < MENU.length; i++) {
    ticket -= weights[i];
    if (ticket <= 0) return MENU[i];
  }
  return MENU[MENU.length - 1];
}

function dateForIndex(index) {
  const start = Date.UTC(2025, 10, 1); // 2025-11-01
  return new Date(start + index * 86400000).toISOString().slice(0, 10);
}

export function generateRealDataset() {
  const random = rng(SEED);
  const sales = [];
  let orderId = 1;

  for (let day = 0; day < 365; day++) {
    const date = dateForIndex(day);
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.3 : 1;
    const ordersToday = Math.max(2, Math.round((3 + random() * 4) * weekendBoost));

    for (let o = 0; o < ordersToday; o++) {
      const channel = random() < 0.34 ? 'Foodpanda' : 'Dine-in';
      const daypartIndex = Math.floor(random() ** 1.25 * DAYPARTS.length);
      const daypart = DAYPARTS[daypartIndex];
      const [startHour, endHour] = DAYPART_HOURS[daypartIndex];
      const hour = startHour + Math.floor(random() * (endHour - startHour));
      const lines = 1 + (random() < 0.42 ? 1 : 0) + (random() < 0.12 ? 1 : 0);

      for (let line = 0; line < lines; line++) {
        const item = pickMenu(daypart, random);
        const quantity = random() < 0.72 ? 1 : random() < 0.8 ? 2 : 3;
        const itemPrice = item.hasTwoPrices && random() < 0.5 ? item.priceIced : item.priceHot;

        let addon = null;
        let addonAmount = 0;
        if (random() < 0.28) {
          addon = pick(ADDONS, random);
          addonAmount = addon.price;
        }

        sales.push({
          id: sales.length + 1,
          order_id: orderId,
          order_date: date,
          hour,
          daypart,
          channel,
          product_category: item.category,
          item_name: item.name,
          bestseller: item.bestseller,
          item_price: itemPrice,
          quantity_sold: quantity,
          addon_name: addon?.name || '',
          addon_amount: addonAmount,
          total_sales: itemPrice * quantity + addonAmount,
        });
      }
      orderId++;
    }
  }

  return {
    source: 'sample',
    seed: SEED,
    menu: MENU,
    addons: ADDONS,
    sales,
    dayparts: DAYPARTS,
    categories: CATEGORIES,
    channels: CHANNELS,
  };
}

export default generateRealDataset;
