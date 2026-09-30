/**
 * Client-Side Mirror Categorization Engine for Instant Response & Offline Demo Mode
 */

const KEYWORD_RULES = [
  {
    category: 'Food',
    keywords: [
      'zomato',
      'swiggy',
      'dominos',
      'pizza',
      'mcdonalds',
      'kfc',
      'burger',
      'canteen',
      'restaurant',
      'cafe',
      'tea',
      'coffee',
      'tiffin',
      'snack',
      'bakery',
      'swiggyit',
      'eatclub',
      'starbucks',
      'chai',
      'juices',
    ],
  },
  {
    category: 'Travel',
    keywords: [
      'uber',
      'ola',
      'rapido',
      'irctc',
      'namma metro',
      'metro',
      'petrol',
      'fuel',
      'shell',
      'hpcl',
      'bpcl',
      'toll',
      'fastag',
      'redbus',
      'makemytrip',
      'indigo',
      'flight',
    ],
  },
  {
    category: 'Subscriptions',
    keywords: [
      'netflix',
      'spotify',
      'prime',
      'youtube',
      'disney',
      'hotstar',
      'apple.com/bill',
      'google play',
      'github',
      'medium',
      'chatgpt',
      'openai',
      'playstation',
    ],
  },
  {
    category: 'Utilities',
    keywords: [
      'electricity',
      'bescom',
      'tatapower',
      'airtel',
      'jio',
      'vi',
      'broadband',
      'water',
      'gas',
      'cylinder',
      'billpay',
      'recharge',
      'hitch',
    ],
  },
  {
    category: 'Shopping',
    keywords: [
      'amazon',
      'flipkart',
      'myntra',
      'meesho',
      'ajio',
      'decathlon',
      'zara',
      'uniqlo',
      'nykaa',
      'mart',
      'supermarket',
      'blinkit',
      'zepto',
      'instamart',
      'bigbasket',
    ],
  },
];

export function categorizeFrontend(description = '', amount = 0, timestamp = new Date(), customRules = []) {
  const text = (description || '').trim();
  const textLower = text.toLowerCase();

  // 1. Protocol Detection
  let protocol = 'DIRECT';
  if (text.toUpperCase().includes('UPI/P2P') || text.toUpperCase().includes('P2P/')) {
    protocol = 'P2P';
  } else if (text.toUpperCase().includes('UPI/P2M') || text.toUpperCase().includes('P2M/') || textLower.includes('paytmqr') || textLower.includes('okbiz')) {
    protocol = 'P2M';
  }

  // Edge Case 1: P2P Person-to-Person Friend Transfers
  if (protocol === 'P2P') {
    const custom = customRules.find((r) => textLower.includes(r.merchantPattern.toLowerCase()));
    if (custom) {
      return { category: custom.category, protocol: 'P2P', isNeedsReview: false, confidence: 0.95 };
    }
    return { category: 'Transfers & Friend Loans', protocol: 'P2P', isNeedsReview: false, confidence: 0.9 };
  }

  // Layer 2: Custom Learned User Merchant Rules
  const custom = customRules.find((r) => textLower.includes(r.merchantPattern.toLowerCase()));
  if (custom) {
    return { category: custom.category, protocol, isNeedsReview: false, confidence: 1.0 };
  }

  // Layer 1 & 3: Keyword Rules
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (textLower.includes(kw)) {
        return { category: rule.category, protocol, isNeedsReview: false, confidence: 0.95 };
      }
    }
  }

  // Layer 4: Micro-spend time/amount profiling heuristics
  const dateObj = new Date(timestamp);
  const hour = isNaN(dateObj.getTime()) ? 16 : dateObj.getHours();

  if (amount > 0 && amount <= 120) {
    if ((hour >= 15 && hour <= 18) || (hour >= 10 && hour <= 12)) {
      return {
        category: 'Food',
        protocol,
        isNeedsReview: true,
        suggestedCategory: 'Food',
        confidence: 0.75,
        reason: `Micro-spend ₹${amount} at ${hour > 12 ? hour - 12 + ' PM' : hour + ' AM'} inferred as Evening/Morning Tea & Refreshments`,
      };
    }
  }

  return {
    category: 'General',
    protocol,
    isNeedsReview: amount < 500,
    suggestedCategory: 'General',
    confidence: 0.5,
  };
}
