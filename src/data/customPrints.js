// Default Hub Products for "Design Your Own Prints" section
// Admin can override these via admin panel (stored in localStorage)

export const DEFAULT_FRAME_STYLES = [
  'Classic Matte Black Frame',
  'Natural Oak Wood Frame',
  'Modern White Frame',
  'Dark Walnut Frame'
];

export const defaultHubProducts = [
  {
    id: 'single',
    titleScript: 'Custom',
    titleMain: 'POSTER',
    subtitle: 'Single Panel Standard & Jumbo Prints & Frames',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-poster.jpg',
    badge: 'Bestseller',
    typeLabel: 'Single Wall Poster & Frame',
    imageCount: 1,
    allowFraming: true,
    allowFrameOnly: true,
    framePrice: 250,
    frameBadge: 'Acrylic Shield',
    frameStyles: [
      'Classic Matte Black Frame',
      'Natural Oak Wood Frame',
      'Modern White Frame',
      'Dark Walnut Frame'
    ],
    defaultSizes: [
      { code: 'A4',    label: 'A4',    dimensions: '8.3 x 11.7 in',  basePrice: 129, framePrice: 250, imageCount: 1 },
      { code: 'A5',    label: 'A5',    dimensions: '5.8 x 8.3 in',   basePrice: 99,  framePrice: 199, imageCount: 1 },
      { code: 'A3',    label: 'A3',    dimensions: '11.7 x 16.5 in', basePrice: 199, framePrice: 350, imageCount: 1 },
      { code: '13x19"',label: '13x19"',dimensions: '13.0 x 19.0 in', basePrice: 299, framePrice: 450, imageCount: 1 }
    ]
  },
  {
    id: 'split-3',
    titleScript: 'Custom',
    titleMain: 'SPLIT POSTER',
    subtitle: '3-Piece Panoramic Triptych Display & Frames',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-split-3.jpg',
    badge: 'Trending',
    typeLabel: '3-Piece Split Poster & Frames (1x3)',
    imageCount: 3,
    allowFraming: true,
    allowFrameOnly: true,
    framePrice: 450,
    frameBadge: '3 Frames Set',
    frameStyles: [
      'Classic Matte Black Frame',
      'Natural Oak Wood Frame',
      'Modern White Frame'
    ],
    defaultSizes: [
      { code: 'A4',     label: '3x A4 Panels',    dimensions: '3 Panels (25 x 11.7 in)',   basePrice: 387, framePrice: 450, imageCount: 3 },
      { code: 'A5',     label: '3x A5 Panels',    dimensions: '3 Panels (17.4 x 8.3 in)',  basePrice: 297, framePrice: 390, imageCount: 3 },
      { code: 'A3',     label: '3x A3 Panels',    dimensions: '3 Panels (35.1 x 16.5 in)', basePrice: 597, framePrice: 650, imageCount: 3 },
      { code: '13x19"', label: '3x 13x19" Jumbo', dimensions: '3 Panels (39 x 19 in)',     basePrice: 897, framePrice: 850, imageCount: 3 }
    ]
  },
  {
    id: 'split-2x2',
    titleScript: 'Custom',
    titleMain: 'SPLIT POSTER',
    subtitle: '2X2 Grid 4-Piece Wall Art & Frames',
    extraTag: '2X2',
    buttonText: 'Get Yours →',
    image: '/custom-prints/custom-split-2x2.jpg',
    badge: 'New Style',
    typeLabel: '2x2 Grid Split Poster & Frames (4 Panels)',
    imageCount: 4,
    allowFraming: true,
    allowFrameOnly: true,
    framePrice: 550,
    frameBadge: '4 Frames Grid',
    frameStyles: [
      'Classic Matte Black Frame',
      'Natural Oak Wood Frame',
      'Modern White Frame'
    ],
    defaultSizes: [
      { code: 'A4', label: '4x A4 Grid (2x2)', dimensions: '4 Panels (16.6 x 23.4 in)', basePrice: 499, framePrice: 550, imageCount: 4 },
      { code: 'A5', label: '4x A5 Grid (2x2)', dimensions: '4 Panels (11.6 x 16.6 in)', basePrice: 399, framePrice: 450, imageCount: 4 },
      { code: 'A3', label: '4x A3 Grid (2x2)', dimensions: '4 Panels (23.4 x 33.0 in)', basePrice: 799, framePrice: 750, imageCount: 4 }
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
    imageCount: 1,
    allowFraming: false,
    allowFrameOnly: false,
    framePrice: 0,
    frameBadge: '',
    frameStyles: [],
    defaultSizes: [
      { code: 'Standard', label: 'Standard Polaroid', dimensions: '3.5 x 4.2 in', basePrice: 199, framePrice: 0, imageCount: 1 },
      { code: 'Mini',     label: 'Mini Retro Card',   dimensions: '2.5 x 3.5 in', basePrice: 149, framePrice: 0, imageCount: 1 }
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
    imageCount: 1,
    allowFraming: false,
    allowFrameOnly: false,
    framePrice: 0,
    frameBadge: '',
    frameStyles: [],
    defaultSizes: [
      { code: 'PhoneCase',  label: 'Phone Case Size', dimensions: '2.1 x 3.4 in', basePrice: 99, framePrice: 0, imageCount: 1 },
      { code: 'WalletCard', label: 'Wallet Card Size', dimensions: '2.5 x 2.5 in', basePrice: 89, framePrice: 0, imageCount: 1 }
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
    imageCount: 3,
    allowFraming: false,
    allowFrameOnly: false,
    framePrice: 0,
    frameBadge: '',
    frameStyles: [],
    defaultSizes: [
      { code: '3Photo', label: '3-Photo Vertical Strip', dimensions: '2.0 x 6.0 in', basePrice: 149, framePrice: 0, imageCount: 3 },
      { code: '4Photo', label: '4-Photo Vertical Strip', dimensions: '2.0 x 8.0 in', basePrice: 179, framePrice: 0, imageCount: 4 }
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
