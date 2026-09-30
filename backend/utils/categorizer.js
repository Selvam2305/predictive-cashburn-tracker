/**
 * Enterprise 4-Layer Hybrid Categorization & Protocol Parser Engine
 */

const KEYWORD_RULES = [
  // Food & Dining
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
  // Travel & Commute
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
  // Subscriptions & Entertainment
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
  // Utilities & Recharges
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
  // Shopping & E-Commerce
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

/**
 * Parses raw bank statement description and categorizes it using 4 layers.
 * @param {string} rawNarrative Raw bank text line
 * @param {number} amount Transaction amount
 * @param {Date|string} dateObj Transaction timestamp
 * @param {Array} userMerchantRules User's learned MerchantRule array (Layer 2)
 */
export function categorizeTransaction(rawNarrative = '', amount = 0, dateObj = new Date(), userMerchantRules = []) {
  const text = (rawNarrative || '').trim();
  const textLower = text.toLowerCase();

  // 1. Protocol Parsing (UPI P2P vs P2M vs Direct)
  let protocol = 'DIRECT';
  if (textUpperIncludes(text, 'UPI/P2P') || textUpperIncludes(text, 'P2P/')) {
    protocol = 'P2P';
  } else if (textUpperIncludes(text, 'UPI/P2M') || textUpperIncludes(text, 'P2M/') || textLower.includes('paytmqr') || textLower.includes('okbiz')) {
    protocol = 'P2M';
  }

  // Edge Case 1: P2P Person-to-Person Friend Transfers
  // Direct friend transfers default to 'Transfers & Friend Loans' (excluded from daily consumption burn velocity v)
  if (protocol === 'P2P') {
    // Unless overridden by Layer 2 rule or explicit vendor keyword
    const matchedRule = findUserRule(textLower, userMerchantRules);
    if (matchedRule) {
      return {
        category: matchedRule.category,
        protocol: 'P2P',
        confidence: 0.95,
        isNeedsReview: false,
        layerMatched: 'Layer 2 (Learned User Rule)',
      };
    }

    return {
      category: 'Transfers & Friend Loans',
      protocol: 'P2P',
      confidence: 0.9,
      isNeedsReview: false,
      layerMatched: 'Layer 1 (UPI P2P Protocol Flag)',
    };
  }

  // Layer 2: User-Specific Merchant Learning Rules
  const userRule = findUserRule(textLower, userMerchantRules);
  if (userRule) {
    return {
      category: userRule.category,
      protocol,
      confidence: 1.0,
      isNeedsReview: false,
      layerMatched: 'Layer 2 (User Memory Rule)',
    };
  }

  // Layer 1 & 3: Keyword Regex & Extended VPA Handles
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (textLower.includes(kw)) {
        return {
          category: rule.category,
          protocol,
          confidence: 0.95,
          isNeedsReview: false,
          layerMatched: 'Layer 1 (Regex & VPA Match)',
        };
      }
    }
  }

  // Layer 4: Amount & Time-Window Profiling Heuristics for Unremembered Micro-Spends
  const parsedDate = new Date(dateObj);
  const hour = isNaN(parsedDate.getTime()) ? 16 : parsedDate.getHours(); // Default to 4 PM if invalid

  // Micro-spends (₹15 - ₹120) during refreshment windows
  if (amount > 0 && amount <= 120) {
    // Evening Refreshment Window (3:30 PM - 6:00 PM) or Morning Window (10:00 AM - 12:00 PM)
    if ((hour >= 15 && hour <= 18) || (hour >= 10 && hour <= 12)) {
      return {
        category: 'Food',
        protocol,
        confidence: 0.75,
        isNeedsReview: true,
        suggestedCategory: 'Food',
        layerMatched: 'Layer 4 (Time & Amount Profiling)',
        reason: `Micro-spend ₹${amount} at ${formatHour(hour)} matches Tea/Snacks refreshment window`,
      };
    }
  }

  // Fallback: General / Uncategorized
  return {
    category: 'General',
    protocol,
    confidence: 0.5,
    isNeedsReview: amount < 500, // Small unmapped spends enter "Needs Review" carousel
    suggestedCategory: 'General',
    layerMatched: 'Fallback (General)',
  };
}

function textUpperIncludes(text, searchStr) {
  return text.toUpperCase().includes(searchStr);
}

function findUserRule(textLower, userRules = []) {
  if (!userRules || !userRules.length) return null;
  return userRules.find((rule) => textLower.includes(rule.merchantPattern.toLowerCase()));
}

function formatHour(h) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:00 ${ampm}`;
}
