// Default Hub Products for "Design Your Own Prints" section
// Admin can override these via admin panel (stored in localStorage)
// imageCount   = number of image upload buttons shown per bundle
// displayStyle = 'pill' (compact side-by-side) | 'wide' (full-width row)

export const defaultHubProducts = [
  {
    id: 'single',
    titleScript: 'Custom',
    titleMain: 'POSTER',
    subtitle: 'Single Panel Standard & Jumbo Prints',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-poster.jpg',
    badge: 'Bestseller',
    typeLabel: 'Single Wall Poster',
    defaultSizes: [
      { code: 'A4',    label: 'A4',    dimensions: '8.3 x 11.7 in',  basePrice: 129 },
      { code: 'A5',    label: 'A5',    dimensions: '5.8 x 8.3 in',   basePrice: 99  },
      { code: 'A3',    label: 'A3',    dimensions: '11.7 x 16.5 in', basePrice: 199 },
      { code: '13x19"',label: '13x19"',dimensions: '13.0 x 19.0 in', basePrice: 299 }
    ],
    bundles: [
      { key: '1',  label: '1 Poster',                       totalUnits: 1,  payFor: 1, imageCount: 1,  displayStyle: 'pill' },
      { key: '4',  label: '4 Posters (BUY 3 GET 1 FREE)',   totalUnits: 4,  payFor: 3, imageCount: 4,  displayStyle: 'pill' },
      { key: '7',  label: '7 Posters (BUY 4 GET 3 FREE)',   totalUnits: 7,  payFor: 4, imageCount: 7,  displayStyle: 'wide' },
      { key: '10', label: '10 Posters (BUY 5 GET 5 FREE)',  totalUnits: 10, payFor: 5, imageCount: 10, displayStyle: 'wide' },
      { key: '18', label: '18 Posters (BUY 6 GET 12 FREE)', totalUnits: 18, payFor: 6, imageCount: 18, displayStyle: 'wide' }
    ]
  },
  {
    id: 'split-3',
    titleScript: 'Custom',
    titleMain: 'SPLIT POSTER',
    subtitle: '3-Piece Panoramic Triptych Display',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-split-3.jpg',
    badge: 'Trending',
    typeLabel: '3-Piece Split Poster (1x3)',
    defaultSizes: [
      { code: 'A4',     label: '3x A4 Panels',    dimensions: '3 Panels (25 x 11.7 in)',   basePrice: 387 },
      { code: 'A5',     label: '3x A5 Panels',    dimensions: '3 Panels (17.4 x 8.3 in)',  basePrice: 297 },
      { code: 'A3',     label: '3x A3 Panels',    dimensions: '3 Panels (35.1 x 16.5 in)', basePrice: 597 },
      { code: '13x19"', label: '3x 13x19" Jumbo', dimensions: '3 Panels (39 x 19 in)',     basePrice: 897 }
    ],
    bundles: [
      { key: '1', label: '1 Split Set (3 Panels)',              totalUnits: 1, payFor: 1,   imageCount: 1, displayStyle: 'pill' },
      { key: '2', label: '2 Split Sets (BUY 1 GET 1 50% OFF)', totalUnits: 2, payFor: 1.5, imageCount: 1, displayStyle: 'pill' },
      { key: '3', label: '3 Split Sets (BUY 2 GET 1 FREE)',     totalUnits: 3, payFor: 2,   imageCount: 1, displayStyle: 'wide' }
    ]
  },
  {
    id: 'split-2x2',
    titleScript: 'Custom',
    titleMain: 'SPLIT POSTER',
    subtitle: '2X2 Grid 4-Piece Wall Art',
    extraTag: '2X2',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-split-2x2.jpg',
    badge: 'New Style',
    typeLabel: '2x2 Grid Split Poster (4 Panels)',
    defaultSizes: [
      { code: 'A4', label: '4x A4 Grid (2x2)', dimensions: '4 Panels (16.6 x 23.4 in)', basePrice: 499 },
      { code: 'A5', label: '4x A5 Grid (2x2)', dimensions: '4 Panels (11.6 x 16.6 in)', basePrice: 399 },
      { code: 'A3', label: '4x A3 Grid (2x2)', dimensions: '4 Panels (23.4 x 33.0 in)', basePrice: 799 }
    ],
    bundles: [
      { key: '1', label: '1 Grid Set (4 Panels)',              totalUnits: 1, payFor: 1,   imageCount: 1, displayStyle: 'pill' },
      { key: '2', label: '2 Grid Sets (BUY 1 GET 1 50% OFF)', totalUnits: 2, payFor: 1.5, imageCount: 1, displayStyle: 'pill' },
      { key: '3', label: '3 Grid Sets (BUY 2 GET 1 FREE)',     totalUnits: 3, payFor: 2,   imageCount: 1, displayStyle: 'wide' }
    ]
  },
  {
    id: 'retro',
    titleScript: 'Custom',
    titleMain: 'RETRO PRINTS',
    subtitle: 'Vintage Polaroid Photo Prints with Border',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-retro.jpg',
    badge: 'Popular',
    typeLabel: 'Vintage Retro Polaroid Prints',
    defaultSizes: [
      { code: 'Standard', label: 'Standard Polaroid', dimensions: '3.5 x 4.2 in', basePrice: 199 },
      { code: 'Mini',     label: 'Mini Retro Card',   dimensions: '2.5 x 3.5 in', basePrice: 149 }
    ],
    bundles: [
      { key: '10', label: '10 Retro Prints Pack',               totalUnits: 10, payFor: 1, fixedTotal: 199, imageCount: 10, displayStyle: 'pill' },
      { key: '20', label: '20 Retro Prints (BUY 15 GET 5 FREE)', totalUnits: 20, payFor: 1, fixedTotal: 299, imageCount: 20, displayStyle: 'pill' },
      { key: '30', label: '30 Retro Prints (BUY 20 GET 10 FREE)',totalUnits: 30, payFor: 1, fixedTotal: 399, imageCount: 30, displayStyle: 'wide' },
      { key: '50', label: '50 Retro Prints (SUPER VALUE)',       totalUnits: 50, payFor: 1, fixedTotal: 599, imageCount: 50, displayStyle: 'wide' }
    ]
  },
  {
    id: 'pocket',
    titleScript: 'Custom',
    titleMain: 'MINI POCKET PHOTO',
    subtitle: 'Fits Perfectly in Phone Cases & Wallets',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-pocket.jpg',
    badge: 'Trending',
    typeLabel: 'Mini Pocket & Phone Case Prints',
    defaultSizes: [
      { code: 'PhoneCase',  label: 'Phone Case Size', dimensions: '2.1 x 3.4 in', basePrice: 99 },
      { code: 'WalletCard', label: 'Wallet Card Size', dimensions: '2.5 x 2.5 in', basePrice: 89 }
    ],
    bundles: [
      { key: '2',  label: '2 Photos Pack',                   totalUnits: 2,  payFor: 1, fixedTotal: 99,  imageCount: 2,  displayStyle: 'pill' },
      { key: '5',  label: '5 Photos (BUY 3 GET 2 FREE)',     totalUnits: 5,  payFor: 1, fixedTotal: 149, imageCount: 5,  displayStyle: 'pill' },
      { key: '10', label: '10 Photos (BUY 5 GET 5 FREE)',    totalUnits: 10, payFor: 1, fixedTotal: 249, imageCount: 10, displayStyle: 'wide' },
      { key: '20', label: '20 Photos (BUY 10 GET 10 FREE)',  totalUnits: 20, payFor: 1, fixedTotal: 399, imageCount: 20, displayStyle: 'wide' }
    ]
  },
  {
    id: 'photobooth',
    titleScript: 'Custom',
    titleMain: 'PHOTOBOOTH STRIP',
    subtitle: 'Nostalgic Film Strips (3 or 4 Photos / Strip)',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-photobooth.jpg',
    badge: 'Best Gift',
    typeLabel: 'Classic Photobooth Film Strips',
    defaultSizes: [
      { code: '3Photo', label: '3-Photo Vertical Strip', dimensions: '2.0 x 6.0 in', basePrice: 149 },
      { code: '4Photo', label: '4-Photo Vertical Strip', dimensions: '2.0 x 8.0 in', basePrice: 179 }
    ],
    bundles: [
      { key: '2',  label: '2 Strips Pack (6 Photos)',    totalUnits: 2,  payFor: 1, fixedTotal: 149, imageCount: 6,  displayStyle: 'pill' },
      { key: '4',  label: '4 Strips (BUY 3 GET 1 FREE)', totalUnits: 4,  payFor: 1, fixedTotal: 249, imageCount: 12, displayStyle: 'pill' },
      { key: '8',  label: '8 Strips (BUY 4 GET 4 FREE)', totalUnits: 8,  payFor: 1, fixedTotal: 399, imageCount: 24, displayStyle: 'wide' },
      { key: '16', label: '16 Strips (PARTY PACK)',      totalUnits: 16, payFor: 1, fixedTotal: 699, imageCount: 48, displayStyle: 'wide' }
    ]
  }
];

const STORAGE_KEY = 'casit_custom_print_types';

/** Get hub products — admin overrides first, fallback to defaults */
export function getHubProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return defaultHubProducts;
}

/** Save hub products to localStorage */
export function saveHubProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/** Reset to defaults */
export function resetHubProducts() {
  localStorage.removeItem(STORAGE_KEY);
}
