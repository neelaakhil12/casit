export const categories = [
  { id: 'anime', name: 'Anime', description: 'Popular anime posters featuring iconic characters and scenes.', image: '/anime/anime-poster-12.png' },
  { id: 'movies-series', name: 'Movies & Series', description: 'Posters inspired by blockbuster movies and trending TV series.', image: '/categories/movies-series.png' },
  { id: 'motivational', name: 'Motivational Quotes', description: 'Inspirational quote posters for home, office, and study rooms.', image: '/categories/motivational.png' },
  { id: 'cars-bikes', name: 'Cars & Bikes', description: 'Luxury cars, superbikes, motorsports, and automotive-themed posters.', image: '/categories/cars-bikes.png' },
  { id: 'marvel-dc', name: 'Marvel & DC', description: 'Superhero posters from Marvel and DC universes.', image: '/categories/marvel-dc.png' },
  { id: 'spiritual', name: 'Spiritual', description: 'God, temples, meditation, and spiritual artwork.', image: '/categories/spiritual.png' },
  { id: 'sports', name: 'Sports', description: 'Football, Cricket, Formula 1, Basketball, and other sports posters.', image: '/categories/sports.png' },
  { id: 'polaroids', name: 'Polaroids', description: 'Vintage polaroid-style photo prints.', image: '/categories/polaroids.png' },
  { id: 'framed', name: 'Framed Posters', description: 'Premium framed wall posters available in multiple sizes.', image: '/categories/framed.png' },
  { id: 'customized-posters', name: 'Customized Posters', description: 'Upload your own image and we will print and frame it for you.', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop' }
];

export const sizes = [
  { code: 'A6', label: 'A6 (Mini - 4.1 x 5.8 in)', priceMultiplier: 1.0, basePriceOffset: 0 },
  { code: 'A5', label: 'A5 (Small - 5.8 x 8.3 in)', priceMultiplier: 1.2, basePriceOffset: 50 },
  { code: 'A4', label: 'A4 (Standard - 8.3 x 11.7 in)', priceMultiplier: 1.5, basePriceOffset: 100 },
  { code: 'A3', label: 'A3 (Large - 11.7 x 16.5 in)', priceMultiplier: 2.2, basePriceOffset: 250 }
];

export const products = [
  {
    id: 1,
    name: 'Solo Leveling - Shadow Monarch',
    category: 'anime',
    basePrice: 299,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    description: 'Bring the epic aura of the Shadow Monarch to your gaming room. Printed on 300GSM premium matte paper with ultra-high resolution ink.',
    specs: {
      paper: '300 GSM Premium Matte Paper',
      printing: '12-Color Archival Giclée',
      finish: 'Anti-glare Matte Coating',
      packaging: 'Heavy-duty Cardboard Tube'
    },
    trending: true,
    bestSeller: true,
    newArrival: false
  },
  {
    id: 2,
    name: 'Cyberpunk Neo-Tokyo Street',
    category: 'anime',
    basePrice: 349,
    rating: 4.8,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    description: 'Vibrant neon street aesthetics of future Tokyo. Ideal for setting a chill, lofi, or synthwave vibe in your study or bedroom.',
    specs: {
      paper: '300 GSM Premium Matte Paper',
      printing: 'Ultra-HD Pigment Print',
      finish: 'Satin Smooth Finish',
      packaging: 'Waterproof rolled sleeve in tube'
    },
    trending: true,
    bestSeller: false,
    newArrival: true
  },
  {
    id: 13,
    name: 'Anime Legends Special Edition',
    category: 'anime',
    basePrice: 349,
    rating: 5.0,
    reviewsCount: 178,
    image: '/anime/anime-poster-12.png',
    description: 'Exclusive high-definition anime poster featuring iconic characters and vivid artwork. Printed on 300GSM archival matte paper.',
    specs: {
      paper: '300 GSM Heavyweight Matte',
      printing: '12-Color Archival Giclée',
      finish: 'Anti-glare Matte Coating',
      packaging: 'Heavy-duty Cardboard Tube'
    },
    trending: true,
    bestSeller: true,
    newArrival: true
  },
  {
    id: 3,
    name: 'Interstellar - Gargantua Black Hole',
    category: 'movies-series',
    basePrice: 399,
    rating: 4.9,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop',
    description: 'A scientifically accurate and breathtaking illustration of the Gargantua black hole from Christopher Nolan\'s masterpiece.',
    specs: {
      paper: '350 GSM Premium Gallery Paper',
      printing: 'Precision Digital Offset',
      finish: 'Deep Glossy/Lustre Finish',
      packaging: 'Rigid flat-pack or premium tube'
    },
    trending: true,
    bestSeller: true,
    newArrival: false
  },
  {
    id: 4,
    name: 'The Dark Knight - Minimalist',
    category: 'movies-series',
    basePrice: 299,
    rating: 4.7,
    reviewsCount: 75,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    description: 'A sleek, modern minimalist design of the Caped Crusader silhouette over the burning Gotham skyline.',
    specs: {
      paper: '300 GSM Matte cardstock',
      printing: 'Eco-solvent High-density Ink',
      finish: 'Fine Art Matte Texture',
      packaging: 'Secure Poster Roll'
    },
    trending: false,
    bestSeller: true,
    newArrival: false
  },
  {
    id: 5,
    name: 'Keep Going - Neon Typography',
    category: 'motivational',
    basePrice: 249,
    rating: 4.6,
    reviewsCount: 115,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    description: 'Fuel your daily hustle with this glowing neon typography quote poster designed to motivate your workspace.',
    specs: {
      paper: '280 GSM Pure White Matte',
      printing: 'Enhanced Definition Inkjet',
      finish: 'Scratch-resistant Matte',
      packaging: 'Triangular cardboard prism'
    },
    trending: false,
    bestSeller: false,
    newArrival: true
  },
  {
    id: 6,
    name: 'Porsche 911 GT3 RS - Lava Orange',
    category: 'cars-bikes',
    basePrice: 399,
    rating: 4.9,
    reviewsCount: 180,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop',
    description: 'Dynamic track-shot of the legendary Porsche 911 GT3 RS in signature Lava Orange. A must-have for car enthusiasts.',
    specs: {
      paper: '320 GSM Lustre Art Paper',
      printing: 'Ultra-Chrome HD Pro Ink',
      finish: 'Semi-Gloss Pearl Coating',
      packaging: 'Heavy duty shipping tube'
    },
    trending: true,
    bestSeller: true,
    newArrival: false
  },
  {
    id: 7,
    name: 'Ducati Panigale V4 - Racing Red',
    category: 'cars-bikes',
    basePrice: 349,
    rating: 4.8,
    reviewsCount: 65,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop',
    description: 'Aggressive beauty of the Ducati Panigale V4 captured in stunning high definition. Perfect for garage or bedroom walls.',
    specs: {
      paper: '300 GSM Satin Finish Paper',
      printing: 'True-Color Laser Print',
      finish: 'Satin Finish',
      packaging: 'Tough cardboard tube'
    },
    trending: false,
    bestSeller: false,
    newArrival: true
  },
  {
    id: 8,
    name: 'Spider-Man: Into the Spider-Verse',
    category: 'marvel-dc',
    basePrice: 299,
    rating: 4.9,
    reviewsCount: 230,
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
    description: 'Spectacular leap of faith illustration featuring Miles Morales. Bring the vibrant comic art style to life.',
    specs: {
      paper: '300 GSM Glossy Premium',
      printing: 'High-Fidelity Inkjet',
      finish: 'Crystal Gloss Layer',
      packaging: 'Eco-tube packing'
    },
    trending: true,
    bestSeller: true,
    newArrival: false
  },
  {
    id: 9,
    name: 'Zen Meditation Buddha - Gold Splash',
    category: 'spiritual',
    basePrice: 329,
    rating: 4.9,
    reviewsCount: 95,
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600&auto=format&fit=crop',
    description: 'Calm and serene Buddha meditating in a modern abstract gold-spattered background. Creates a peaceful living room environment.',
    specs: {
      paper: '300 GSM Canvas Textured Paper',
      printing: '12-Color Archival Pigment',
      finish: 'Canvas Matte Texture',
      packaging: 'Protected flat envelope'
    },
    trending: false,
    bestSeller: false,
    newArrival: true
  },
  {
    id: 10,
    name: 'Formula 1 Monaco GP Street Circuit',
    category: 'cars-bikes',
    basePrice: 349,
    rating: 4.7,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop',
    description: 'A stylish minimalist track map of the historic Monaco Grand Prix circuit. Essential for all motorsport fans.',
    specs: {
      paper: '300 GSM Heavyweight Card',
      printing: 'Vibrant Offset Lithography',
      finish: 'Anti-reflection Matte',
      packaging: 'Rigid postal tube'
    },
    trending: true,
    bestSeller: true,
    newArrival: false
  },
  {
    id: 11,
    name: 'Retro Polaroid Grid - Summer Memories',
    category: 'polaroids',
    basePrice: 199,
    rating: 4.5,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop',
    description: 'A set of vintage styled polaroids in a grid layout, capturing retro summer aesthetics for warm bedroom decor.',
    specs: {
      paper: '250 GSM Real Photo Paper',
      printing: 'Chemical Silver Halide print',
      finish: 'High Gloss Polaroid Texture',
      packaging: 'Hard backed cardboard mailer'
    },
    trending: false,
    bestSeller: false,
    newArrival: true
  },
  {
    id: 12,
    name: 'Majestic Forest Frame - Autumn Gold',
    category: 'framed',
    basePrice: 899,
    rating: 4.8,
    reviewsCount: 56,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    description: 'Stunning photography of autumn golden forests, pre-framed in a premium black fiber frame with glass protector.',
    specs: {
      paper: '250 GSM Lustre Art Print',
      frame: '1-inch Premium Matte Black Fiber Frame',
      glass: '2mm Clear Acrylic Glass (Shatterproof)',
      backing: 'MDF board with hanging hooks'
    },
    trending: true,
    bestSeller: true,
    newArrival: false
  },
  {
    id: 'custom-1',
    name: 'Print Your Own Custom Poster',
    category: 'customized-posters',
    basePrice: 499,
    rating: 5.0,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=600&auto=format&fit=crop',
    description: 'Upload your favorite photo, design, or artwork, and we will print it in stunning high definition! Perfect for personalized gifts or unique room decor.',
    specs: {
      paper: '300 GSM Premium Matte Paper',
      printing: 'Ultra-HD Pigment Print',
      finish: 'Satin Smooth Finish',
      packaging: 'Heavy-duty Cardboard Tube'
    },
    trending: true,
    bestSeller: true,
    newArrival: true
  }
];

export const servicePosters = [
  {
    id: 101,
    name: 'Celestial Galaxy Cosmic Art',
    category: 'sports',
    basePrice: 299,
    rating: 4.9,
    reviewsCount: 128,
    image: '/services/service-poster-1.png',
    description: 'Breathtaking high-definition deep space galaxy print with vibrant nebula colors.',
    specs: { paper: '300 GSM Premium Matte', printing: '12-Color Archival Giclée', finish: 'Anti-glare Matte' },
    trending: true,
    bestSeller: true
  },
  {
    id: 102,
    name: 'Mindset & Hustle Motivation',
    category: 'sports',
    basePrice: 349,
    rating: 4.8,
    reviewsCount: 94,
    image: '/services/service-poster-2.png',
    description: 'Empowering typography design crafted for entrepreneurs, offices, and study spaces.',
    specs: { paper: '300 GSM Heavyweight Card', printing: 'Ultra-HD Pigment Print', finish: 'Satin Smooth' },
    trending: true,
    bestSeller: false
  },
  {
    id: 103,
    name: 'Urban Street Aesthetics',
    category: 'sports',
    basePrice: 279,
    rating: 4.7,
    reviewsCount: 76,
    image: '/services/service-poster-3.png',
    description: 'Contemporary street art style artwork bringing bold urban vibes to your walls.',
    specs: { paper: '300 GSM Matte', printing: 'Pigment Inkjet', finish: 'Anti-reflection Matte' },
    trending: false,
    bestSeller: true
  },
  {
    id: 104,
    name: 'Minimalist Horizon Sunset',
    category: 'sports',
    basePrice: 319,
    rating: 4.9,
    reviewsCount: 110,
    image: '/services/service-poster-4.png',
    description: 'Serene warm gradient sunset art design creating a calming atmosphere.',
    specs: { paper: '300 GSM Archival Matte', printing: 'Giclée Print', finish: 'Satin Matte' },
    trending: true,
    bestSeller: true
  },
  {
    id: 105,
    name: 'Cyberpunk Neon Odyssey',
    category: 'sports',
    basePrice: 399,
    rating: 5.0,
    reviewsCount: 215,
    image: '/services/service-poster-5.png',
    description: 'Futuristic neon synthwave aesthetic print designed for gaming room setups.',
    specs: { paper: '300 GSM Glossy/Matte', printing: 'Ultra-HD Pigment', finish: 'Vibrant Coating' },
    trending: true,
    bestSeller: true
  },
  {
    id: 106,
    name: 'Vintage Botanical Heritage',
    category: 'sports',
    basePrice: 289,
    rating: 4.6,
    reviewsCount: 68,
    image: '/services/service-poster-6.png',
    description: 'Classic botanical floral illustration with rich natural color tones.',
    specs: { paper: '280 GSM Textured Fine Art', printing: 'Pigment Print', finish: 'Textured Fine Art' },
    trending: false,
    bestSeller: false
  },
  {
    id: 107,
    name: 'Supercar Velocity Limited',
    category: 'sports',
    basePrice: 349,
    rating: 4.9,
    reviewsCount: 154,
    image: '/services/service-poster-7.png',
    description: 'Dynamic high-octane supercar poster capturing pure automotive adrenaline.',
    specs: { paper: '300 GSM Premium Card', printing: 'High Resolution Inkjet', finish: 'Glossy Finish' },
    trending: true,
    bestSeller: true
  },
  {
    id: 108,
    name: 'Abstract Geometry & Line Art',
    category: 'sports',
    basePrice: 299,
    rating: 4.8,
    reviewsCount: 82,
    image: '/services/service-poster-8.png',
    description: 'Modern abstract geometric shapes and fine line art for Scandinavian decor.',
    specs: { paper: '300 GSM Matte', printing: 'Archival Print', finish: 'Smooth Matte' },
    trending: false,
    bestSeller: true
  },
  {
    id: 109,
    name: 'Zen Garden Japanese Blossom',
    category: 'sports',
    basePrice: 329,
    rating: 4.9,
    reviewsCount: 137,
    image: '/services/service-poster-9.png',
    description: 'Tranquil Japanese cherry blossom and zen landscape for peaceful living spaces.',
    specs: { paper: '300 GSM Fine Art Paper', printing: '12-Color Giclée', finish: 'Anti-Glare' },
    trending: true,
    bestSeller: false
  },
  {
    id: 110,
    name: 'Dark Knight Gotham Sentinel',
    category: 'sports',
    basePrice: 379,
    rating: 5.0,
    reviewsCount: 310,
    image: '/services/service-poster-10.png',
    description: 'Moody superhero artwork featuring iconic atmospheric Gotham city vibes.',
    specs: { paper: '300 GSM Heavyweight', printing: 'Pigment Archival', finish: 'Matte Coating' },
    trending: true,
    bestSeller: true
  }
];

// Append service posters into main products list for site-wide availability
products.push(...servicePosters);

