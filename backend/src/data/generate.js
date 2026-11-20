// Deterministic sample-data generator for the Cascadja Cafe capstone.
// The same generated dataset feeds both Neon (via scripts/seed.js) and the
// in-memory "demo mode" (when DATABASE_URL is not configured), so the numbers
// on screen always match the seeded database.

const ROOM_INVENTORY = 4; // four rooms in the inn
const SEED = 20261106;

// ---------------------------------------------------------------- helpers
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
const round2 = (n) => Math.round(n * 100) / 100;

function makeRandom(seed) {
  const rng = mulberry32(seed);
  const rand = (min, max) => min + rng() * (max - min);
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const chance = (p) => rng() < p;
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const weighted = (items, weightOf) => {
    const weights = items.map(weightOf);
    const total = weights.reduce((s, w) => s + w, 0);
    let roll = rng() * total;
    for (let i = 0; i < items.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return items[i];
    }
    return items[items.length - 1];
  };
  return { rng, rand, randInt, pick, chance, shuffle, weighted };
}

// ------------------------------------------------------------ marketing
// costPerConv / revPerConv are the economics used to simulate a channel.
// They intentionally differ so the prescriptive step has something to fix.
const CHANNEL_PROFILES = {
  Email:          { costPerConv: 80,  revPerConv: 1100, cvr: 0.050, ctr: 0.045, label: 'Email & CRM' },
  'Google Ads':   { costPerConv: 250, revPerConv: 1100, cvr: 0.045, ctr: 0.035, label: 'Google Search' },
  'Facebook Ads': { costPerConv: 320, revPerConv: 950,  cvr: 0.035, ctr: 0.028, label: 'Facebook' },
  'Instagram Ads':{ costPerConv: 360, revPerConv: 900,  cvr: 0.030, ctr: 0.025, label: 'Instagram' },
  Influencer:     { costPerConv: 420, revPerConv: 1000, cvr: 0.025, ctr: 0.030, label: 'Influencer' },
  'Local Events': { costPerConv: 450, revPerConv: 800,  cvr: 0.060, ctr: 0.050, label: 'Local Events' },
  'Walk-in Promo':{ costPerConv: 500, revPerConv: 650,  cvr: 0.090, ctr: 0.080, label: 'In-store Promo' },
};
const CHANNELS = Object.keys(CHANNEL_PROFILES);
const CHANNEL_BASE_SHARE = {
  Email: 0.10,
  'Google Ads': 0.22,
  'Facebook Ads': 0.20,
  'Instagram Ads': 0.14,
  Influencer: 0.10,
  'Local Events': 0.12,
  'Walk-in Promo': 0.12,
};

const FIRST_NAMES = [
  'Maria', 'Jose', 'Ana', 'Mark', 'Angel', 'Joshua', 'Bea', 'Carlo', 'Liza', 'Miguel',
  'Clara', 'Paolo', 'Nina', 'Rafael', 'Sofia', 'Daniel', 'Mika', 'Andres', 'Grace', 'Luis',
  'Camille', 'Ivan', 'Trisha', 'Rico', 'Ella', 'Ben', 'Joy', 'Marco', 'Kaye', 'Gabriel',
];
const LAST_NAMES = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Flores',
  'Ramos', 'Villanueva', 'Aquino', 'Castillo', 'Navarro', 'Salazar', 'Domingo', 'Rosales',
  'Pascual', 'Lim', 'Tan', 'Chua', 'Del Rosario', 'Mercado', 'Gonzales', 'Alonzo',
];
const CITIES = [
  ['Bacolod', 26], ['Silay', 12], ['Talisay', 8], ['Iloilo', 10], ['Dumaguete', 6],
  ['Cebu', 9], ['Manila', 13], ['Baguio', 5], ['Tagbilaran', 3], ['Other', 8],
];
const SEGMENTS = [
  ['Student', 22], ['Young Professional', 26], ['Family', 20], ['Tourist', 22], ['Corporate', 10],
];

const COFFEE = [
  ['Espresso', 120], ['Americano', 140], ['Cappuccino', 175], ['Latte', 180],
  ['Spanish Latte', 195], ['Caramel Macchiato', 210], ['Mocha', 195], ['Flat White', 190],
  ['Cold Brew', 200], ['Iced Latte', 185], ['Vietnamese Coffee', 190], ['Affogato', 220],
  ['Brewed Coffee', 130], ['Hazelnut Latte', 200],
];
const FOOD = [
  ['Chicken Adobo Rice Bowl', 220], ['Beef Tapa Silog', 240], ['Longganisa Silog', 230],
  ['Bangsilog', 210], ['Club Sandwich', 260], ['Grilled Cheese', 190],
  ['Chicken Pesto Pasta', 280], ['Carbonara', 270], ['Spaghetti', 250], ['Caesar Salad', 240],
  ['Mushroom Soup', 160], ['Pancake Stack', 220], ['French Toast', 210], ['Omelette', 200],
  ['Fish & Chips', 320], ['Pork Sisig', 260], ['Cheeseburger', 250], ['Chicken Wings', 290],
  ['Quesadilla', 230], ['Nachos', 240],
];
const PASTRY = [
  ['Butter Croissant', 120], ['Chocolate Croissant', 140], ['Cinnamon Roll', 140],
  ['Blueberry Muffin', 110], ['Chocolate Chip Cookie', 80], ['Brownie', 130],
  ['Cheesecake Slice', 180], ['Tiramisu Cup', 190], ['Ensaymada', 100],
  ['Pandesal Basket', 90], ['Banana Bread', 120], ['Apple Pie', 150],
];
const BEVERAGE = [
  ['Matcha Latte', 200], ['Strawberry Smoothie', 190], ['Mango Shake', 180],
  ['Fresh Lemonade', 150], ['Iced Tea', 120], ['Hot Chocolate', 170], ['Chai Latte', 180],
  ['Sparkling Water', 90], ['Bottled Juice', 130], ['Brewed Tea', 110],
];
const ROOMS = [
  ['Budget Single Room', 1600, 3], ['Garden View Room', 2400, 3],
  ['Deluxe King Room', 3200, 2], ['Family Suite', 4200, 1],
];

function monthList() {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(2025, 10 + i, 1));
    months.push({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
  }
  return months;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function generateDataset(seed = SEED) {
  const R = makeRandom(seed);
  const months = monthList();

  // ------------------------------------------------------------ customers
  const customers = [];
  const usedEmails = new Set();
  for (let i = 0; i < 250; i++) {
    const first = R.pick(FIRST_NAMES);
    const last = R.pick(LAST_NAMES);
    const segment = R.weighted(SEGMENTS, (s) => s[1])[0];
    const city = R.weighted(CITIES, (c) => c[1])[0];
    let handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '');
    let email = `${handle}${i + 1}@example.com`;
    while (usedEmails.has(email)) email = `${handle}${i + 1}${R.randInt(1, 99)}@example.com`;
    usedEmails.add(email);
    const start = R.chance(0.55) ? Date.UTC(2025, 10, 1) : Date.UTC(2024, 5, 1);
    const end = Date.UTC(2026, 9, 31);
    const joined = new Date(start + R.rng() * (end - start));
    customers.push({
      id: i + 1,
      first_name: first,
      last_name: last,
      email,
      city,
      segment,
      joined_at: joined.toISOString().slice(0, 10),
      loyalty_points: R.randInt(0, 2400),
    });
  }

  // ------------------------------------------------------------- products
  const products = [];
  const addProducts = (rows, category, isRoom) => {
    for (const row of rows) {
      const [name, price] = row;
      products.push({
        id: products.length + 1,
        name,
        category,
        unit_price: price,
        unit_cost: Math.round(price * (isRoom ? 0.42 : 0.38)),
        is_room: isRoom,
      });
    }
  };
  addProducts(COFFEE, 'Coffee', false);
  addProducts(FOOD, 'Food', false);
  addProducts(PASTRY, 'Pastry', false);
  addProducts(BEVERAGE, 'Beverage', false);
  addProducts(ROOMS.map(([n, p]) => [n, p]), 'Room', true);

  const cafeProducts = products.filter((p) => !p.is_room);
  const roomProducts = products.filter((p) => p.is_room);

  // Popularity weights (a few bestsellers, as in a real cafe).
  const popularity = new Map();
  for (const p of cafeProducts) {
    let w = 3 + R.randInt(0, 5);
    if (p.name === 'Latte') w += 9;
    if (p.name === 'Chicken Adobo Rice Bowl') w += 8;
    if (p.name === 'Cappuccino') w += 6;
    if (p.name === 'Spanish Latte') w += 5;
    if (p.name === 'Butter Croissant') w += 4;
    if (p.name === 'Club Sandwich') w += 3;
    popularity.set(p.id, w);
  }

  const roomById = new Map(roomProducts.map((p) => [p.id, p]));

  // ------------------------------------------------------------ marketing
  const campaigns = [];
  let campaignId = 1;
  const monthlySpend = {};
  const monthlyConversions = {};
  const monthlyAttributed = {};

  for (const { y, m } of months) {
    const key = `${y}-${pad(m)}`;
    const budget = Math.round(R.rand(18000, 40000) / 100) * 100;
    const chosen = CHANNELS;
    const weights = chosen.map((ch) => CHANNEL_BASE_SHARE[ch] * R.rand(0.72, 1.28));
    const weightSum = weights.reduce((s, w) => s + w, 0);

    // Spend is allocated first, then conversions are spread across campaigns
    // using each channel's efficiency. Total conversions therefore track the
    // monthly budget while channel-level ROI still differs (the key insight
    // for the prescriptive step).
    const spendByChannel = chosen.map((_, idx) =>
      Math.max(1500, Math.round((budget * weights[idx]) / weightSum / 100) * 100),
    );
    const preSum = spendByChannel.slice(0, -1).reduce((s, v) => s + v, 0);
    spendByChannel[spendByChannel.length - 1] = Math.max(1500, budget - preSum);

    const monthlyConv = Math.max(25, Math.round((budget / 333) * R.rand(0.92, 1.08)));
    const effort = spendByChannel.reduce((s, sp, i) => s + sp / CHANNEL_PROFILES[chosen[i]].costPerConv, 0);

    let allocated = 0;
    chosen.forEach((channel, idx) => {
      const profile = CHANNEL_PROFILES[channel];
      const spend = spendByChannel[idx];
      allocated += spend;
      const share = spend / profile.costPerConv / effort;
      const conversions = Math.max(1, Math.round(monthlyConv * share));
      const clicks = Math.max(conversions, Math.round(conversions / profile.cvr));
      const impressions = Math.round(clicks / profile.ctr);
      const revenue = Math.round(conversions * profile.revPerConv * R.rand(0.92, 1.08));

      const startDay = R.randInt(1, Math.max(1, daysInMonth(y, m) - 10));
      const endDay = Math.min(daysInMonth(y, m), startDay + R.randInt(5, 14));
      const monthName = MONTH_NAMES[m - 1];

      campaigns.push({
        id: campaignId++,
        campaign_name: `${monthName} ${['Boost', 'Push', 'Spotlight', 'Campaign', 'Promo'][R.randInt(0, 4)]} - ${channel}`,
        channel,
        start_date: iso(y, m, startDay),
        end_date: iso(y, m, endDay),
        spend,
        impressions,
        clicks,
        conversions,
        revenue_attributed: revenue,
      });

      monthlySpend[key] = (monthlySpend[key] || 0) + spend;
      monthlyConversions[key] = (monthlyConversions[key] || 0) + conversions;
      monthlyAttributed[key] = (monthlyAttributed[key] || 0) + revenue;
    });

    // Guard against rounding drift: keep the month's spend exactly on budget.
    if (allocated !== budget) {
      const diff = budget - allocated;
      campaigns[campaigns.length - 1].spend += diff;
      monthlySpend[key] += diff;
    }
  }

  // --------------------------------------------------------- transactions
  const transactions = [];
  const sales = [];
  let txnId = 1;
  let saleId = 1;

  const cafePool = cafeProducts;
  const segmentWeightsByChannel = {
    'Room Stay': { Tourist: 6, Family: 2.5, Corporate: 2, 'Young Professional': 1, Student: 0.3 },
    'Dine-in': { Student: 1.4, 'Young Professional': 1.6, Family: 1.1, Tourist: 0.7, Corporate: 0.8 },
    Takeout: { Student: 1.3, 'Young Professional': 1.9, Family: 0.8, Tourist: 0.5, Corporate: 1.1 },
    Delivery: { Student: 1.1, 'Young Professional': 1.7, Family: 1.3, Tourist: 0.4, Corporate: 1.0 },
  };

  const pickCustomer = (channel) => {
    if (R.chance(0.72)) return null; // walk-in guest, no loyalty profile
    const weights = segmentWeightsByChannel[channel];
    return R.weighted(customers, (c) => (weights[c.segment] || 0.3) * (1 + c.loyalty_points / 4000));
  };

  const addLine = (txn, product, quantity) => {
    sales.push({
      id: saleId++,
      transaction_id: txn.id,
      product_id: product.id,
      sale_date: txn.txn_date,
      quantity,
      unit_price: product.unit_price,
      line_total: round2(product.unit_price * quantity),
    });
  };

  for (const { y, m } of months) {
    const key = `${y}-${pad(m)}`;
    const conversions = monthlyConversions[key] || 60;
    const count = Math.max(90, Math.round(100 + conversions * 1.5 + R.rand(-12, 12)));
    const dim = daysInMonth(y, m);

    // Allocate channels deterministically so a month is not randomly
    // "room-light" or "delivery-heavy" just because of sampling noise.
    const roomCount = Math.round(count * 0.1);
    const deliveryCount = Math.round(count * 0.15);
    const takeoutCount = Math.round(count * 0.25);
    const dineInCount = count - roomCount - deliveryCount - takeoutCount;
    const channelList = R.shuffle([
      ...Array(roomCount).fill('Room Stay'),
      ...Array(deliveryCount).fill('Delivery'),
      ...Array(takeoutCount).fill('Takeout'),
      ...Array(dineInCount).fill('Dine-in'),
    ]);

    for (let i = 0; i < count; i++) {
      const channel = channelList[i];
      const isRoom = channel === 'Room Stay';
      const day = R.weighted(
        Array.from({ length: dim }, (_, k) => k + 1),
        (d) => {
          const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
          if (isRoom) return dow === 5 || dow === 6 ? 2.6 : dow === 0 ? 1.5 : 1;
          return dow === 0 || dow === 6 ? 1.45 : 1;
        },
      );
      const txnDate = iso(y, m, day);
      const customer = pickCustomer(channel);
      const cancelled = R.chance(0.035);
      const payment = isRoom
        ? R.weighted([['Credit Card', 60], ['GCash', 25], ['Cash', 15]], (p) => p[1])[0]
        : R.weighted([['Cash', 38], ['GCash', 30], ['Maya', 14], ['Credit Card', 18]], (p) => p[1])[0];

      const txn = {
        id: txnId++,
        customer_id: customer ? customer.id : null,
        txn_date: txnDate,
        channel,
        payment_method: payment,
        status: cancelled ? 'Cancelled' : 'Completed',
        total_amount: 0,
      };

      let total = 0;
      if (!cancelled) {
        if (isRoom) {
          const room = R.weighted(roomProducts, (p) => {
            const row = ROOMS.find((r) => r[0] === p.name);
            return row ? row[2] : 1;
          });
          const nights = R.weighted([1, 2, 3], (n) => (n === 1 ? 0.15 : n === 2 ? 0.75 : 0.1));
          addLine(txn, room, nights);
          total += room.unit_price * nights;

          if (R.chance(0.55)) {
            const extra = R.randInt(1, 2);
            const used = new Set();
            for (let e = 0; e < extra; e++) {
              const p = R.weighted(cafePool, (x) => popularity.get(x.id));
              if (used.has(p.id)) continue;
              used.add(p.id);
              const qty = R.chance(0.15) ? 2 : 1;
              addLine(txn, p, qty);
              total += p.unit_price * qty;
            }
          }
        } else {
          const itemCount = R.randInt(1, channel === 'Delivery' ? 2 : 3);
          const used = new Set();
          for (let k = 0; k < itemCount; k++) {
            const p = R.weighted(cafePool, (x) => popularity.get(x.id));
            if (used.has(p.id)) continue;
            used.add(p.id);
            const qty = R.chance(0.18) ? 2 : 1;
            addLine(txn, p, qty);
            total += p.unit_price * qty;
          }
        }
      }
      txn.total_amount = round2(total);
      transactions.push(txn);
    }
  }

  return { customers, products, campaigns, transactions, sales, roomInventory: ROOM_INVENTORY };
}
