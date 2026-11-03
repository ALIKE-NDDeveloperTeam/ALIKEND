import { Product, Job, Contact, Testimonial, Notification, WalletTransaction, CategoryItem } from '../types';

export const CATEGORIES: CategoryItem[] = [
  { 
    id: 'all', 
    label: 'All Products', 
    labelBn: 'সব পণ্য', 
    icon: 'LayoutGrid',
    badge: { text: 'POPULAR', color: '#F5A623' }
  },
  { 
    id: 'luxury', 
    label: 'Luxury Goods', 
    labelBn: 'বিলাসবহুল পণ্য', 
    icon: 'Crown',
    badge: { text: 'HOT', color: '#EF4444' }
  },
  { 
    id: 'vip', 
    label: 'Curated VIP Selection', 
    labelBn: 'ভিআইপি কালেকশন', 
    icon: 'Crown',
    badge: { text: 'POPULAR', color: '#8B5CF6' }
  },
  { 
    id: 'delivery', 
    label: 'Fast Delivery 🔥', 
    labelBn: 'দ্রুত ডেলিভারি', 
    icon: 'Zap', 
    eligibleFor20MinDelivery: true,
    badge: { text: 'ACTIVE', color: '#F97316' }
  },
  {
    id: 'grocery',
    label: 'Grocery & Kirana',
    labelBn: 'মুদি ও রসদ',
    icon: 'ShoppingBasket',
    eligibleFor20MinDelivery: true,
    badge: { text: 'FRESH', color: '#0D9488' },
    subCategories: [
      'Rice, Dal & Pulses',
      'Flour/Atta',
      'Oil & Ghee',
      'Sugar, Salt & Spices',
      'Tea & Coffee',
      'Biscuits & Cookies',
      'Namkeen & Snacks',
      'Noodles & Pasta',
      'Sauces & Pickles',
      'Breakfast Items',
      'Packaged Food',
      'Dairy Products',
      'Milk & Milk Products',
      'Bread & Bakery',
      'Eggs',
      'Fresh Fruits',
      'Fresh Vegetables',
      'Dry Fruits & Nuts',
      'Frozen Food',
      'Ice Cream',
      'Chocolates & Sweets',
      'Baby Food',
      'Water & Beverages',
      'Soft Drinks & Juices',
      'Household Cleaning',
      'Detergent & Laundry',
      'Kitchen Cleaning',
      'Personal Care',
      'Pet Food & Pet Care'
    ]
  },
  {
    id: 'food_delivery',
    label: 'Food Delivery',
    labelBn: 'খাবার ডেলিভারি',
    icon: 'Utensils',
    eligibleFor20MinDelivery: true,
    badge: { text: 'HOT', color: '#F43F5E' },
    subCategories: [
      'Restaurants',
      'Fast Food',
      'Indian Food',
      'Chinese Food',
      'Bengali Food',
      'North Indian',
      'South Indian',
      'Momos',
      'Pizza',
      'Burger',
      'Biryani',
      'Rolls & Wraps',
      'Bakery & Cakes',
      'Sweets',
      'Snacks',
      'Tea & Coffee',
      'Juice & Shakes',
      'Ice Cream',
      'Street Food',
      'Cloud Kitchen',
      'Home Food/Home Kitchen'
    ]
  },
  { 
    id: 'wholesale', 
    label: 'Wholesale Deals', 
    labelBn: 'পাইকারি বাজার', 
    icon: 'Boxes',
    badge: { text: 'BEST VALUE', color: '#2563EB' }
  },
  { 
    id: 'electronics', 
    label: 'Electronics', 
    labelBn: 'ইলেকট্রনিক্স', 
    icon: 'Tv',
    badge: { text: 'ACTIVE', color: '#0284C7' }
  },
  { 
    id: 'mobiles', 
    label: 'Mobiles', 
    labelBn: 'মোবাইল ফোন', 
    icon: 'Smartphone',
    badge: { text: 'NEW', color: '#10B981' }
  },
  { 
    id: 'laptops', 
    label: 'Laptops', 
    labelBn: 'ল্যাপটপ ও পিসি', 
    icon: 'Laptop',
    badge: { text: 'GEAR', color: '#475569' }
  },
  { 
    id: 'fashion', 
    label: 'Fashion', 
    labelBn: 'ফ্যাশন কালেকশন', 
    icon: 'Shirt',
    badge: { text: 'TRENDING', color: '#A855F7' }
  },
  { 
    id: 'jewellery', 
    label: 'Jewellery & Watches', 
    labelBn: 'অলংকার ও ঘড়ি', 
    icon: 'Gem',
    badge: { text: 'HOT', color: '#E11D48' }
  },
  { 
    id: 'gaming', 
    label: 'Gaming', 
    labelBn: 'গেমিং গিয়ার', 
    icon: 'Gamepad2',
    badge: { text: 'GEAR', color: '#334155' }
  },
  { 
    id: 'hardware', 
    label: 'Hardware & Tools', 
    labelBn: 'হার্ডওয়্যার ও যন্ত্রাংশ', 
    icon: 'Wrench',
    badge: { text: 'GEAR', color: '#4B5563' }
  },
  { 
    id: 'beauty', 
    label: 'Cosmetics & Beauty', 
    labelBn: 'প্রসাধন ও রূপচর্চা', 
    icon: 'Sparkles',
    badge: { text: 'TRENDING', color: '#EC4899' },
    subCategories: [
      // Face Makeup
      'Foundation', 'BB Cream', 'CC Cream', 'Concealer', 'Face Powder', 'Compact & Loose Powder', 'Blush', 'Highlighter', 'Bronzer & Contour', 'Makeup Primer', 'Setting Spray', 'Makeup Remover',
      // Eye Makeup
      'Kajal & Kohl', 'Eyeliner', 'Mascara', 'Eyeshadow', 'Eyeshadow Palette', 'Eyebrow Pencil & Gel', 'Eyelash Curler & Lashes',
      // Lip Makeup
      'Lipstick', 'Liquid Lipstick', 'Lip Gloss', 'Lip Liner', 'Lip Tint', 'Lip Balm & Oil',
      // Nail Care
      'Nail Polish', 'Gel Nail Polish', 'Nail Polish Remover', 'Nail Art & Tools',
      // Skincare
      'Face Wash & Cleanser', 'Face Scrub', 'Toner & Mists', 'Face Serum & Treatments', 'Moisturizer & Face Cream', 'Face Mask & Sheet Mask', 'Sunscreen (SPF)', 'Acne & Dark Spot Care', 'Anti-Aging & Wrinkle Care', 'Under-Eye Cream & Patches',
      // Body Care & Bath
      'Body Wash & Shower Gel', 'Body Lotion & Body Butter', 'Body Scrub', 'Hand Wash & Hand Cream', 'Foot Cream & Care',
      // Hair Care
      'Shampoo', 'Conditioner', 'Hair Oil', 'Hair Serum & Heat Protectant', 'Hair Mask & Spa', 'Hair Wax & Styling Gel', 'Hair Color & Highlights',
      // Beauty Accessories & Tools
      'Makeup Brushes', 'Beauty Blenders & Sponges', 'Makeup Mirrors & Organizers', 'Facial Rollers & Gua Sha',
      // Top Cosmetics Brands
      'Maybelline New York', "L'Oréal Paris", 'Lakmé', 'M.A.C', 'Revlon', 'SUGAR Cosmetics', 'Huda Beauty', 'The Body Shop', 'The Ordinary', 'Minimalist', 'Neutrogena'
    ]
  },
  { 
    id: 'perfumes', 
    label: 'Perfumes & Fragrances', 
    labelBn: 'সুগন্ধি ও পারফিউম', 
    icon: 'Flame',
    badge: { text: 'LUXURY', color: '#8B5CF6' },
    subCategories: [
      // Men's Perfume
      "Men's Eau de Parfum (EDP)", "Men's Eau de Toilette (EDT)", "Men's Cologne & Spray", "Men's Deodorant & Body Spray",
      // Women's Perfume
      "Women's Eau de Parfum (EDP)", "Women's Eau de Toilette (EDT)", "Women's Perfume Spray & Mist", "Women's Body Mist & Spray",
      // Unisex Fragrance
      "Unisex Perfume", "Unisex EDP & EDT", "Unisex Attar & Oil",
      // Attar & Traditional Fragrance
      'Pure Attar & Ittar', 'Oud & Dehn Al Oud', 'Musk & Kasturi', 'Rose & Jasmine Attar', 'Sandalwood (Chandan) Attar', 'Bakhoor & Incense', 'Fragrance Oils',
      // Gift Sets & Combos
      'Men’s Perfume Gift Sets', 'Women’s Luxury Gift Sets', 'Couple Perfume Gift Sets', 'Travel Miniature Perfumes',
      // Accessories
      'Pocket Perfumes & Travel Atomizers', 'Empty Decant Bottles', 'Fragrance Storage Cases',
      // Top Fragrance Brands
      'Dior', 'Chanel', 'Gucci', 'Versace', 'Armani', 'Hugo Boss', 'Calvin Klein', 'Burberry', 'Paco Rabanne', 'Yves Saint Laurent', 'Tom Ford', 'Ajmal', 'Rasasi', 'Al Haramain', 'Fogg', 'Wild Stone', 'Denver', 'Bella Vita Organic'
    ]
  },
  { 
    id: 'personal_care', 
    label: 'Personal Care & Grooming', 
    labelBn: 'ব্যক্তিগত যত্ন ও গ্রুমিং', 
    icon: 'Sparkles',
    badge: { text: 'DAILY', color: '#0EA5E9' },
    subCategories: [
      'Bathing Soaps & Body Wash',
      'Toothpaste & Oral Care',
      'Toothbrushes & Tongue Cleaners',
      'Shaving Creams & Razors',
      'Aftershave & Beard Care',
      'Men’s Trimmers & Grooming Kits',
      'Deodorants & Roll-ons',
      'Sanitary Pads & Intimate Hygiene',
      'Cotton Buds & Wipes',
      'Hand Sanitizers & Antiseptics'
    ]
  },
  { 
    id: 'furniture', 
    label: 'Furniture & Decor', 
    labelBn: 'আসবাবপত্র ও সজ্জা', 
    icon: 'Sofa',
    badge: { text: 'BEST VALUE', color: '#059669' }
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Aurelia Royal Gold Chronograph Watch",
    brand: "Aurelia Genf",
    price: 18499,
    mrp: 29999,
    rating: 4.8,
    reviewsCount: 312,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "luxury",
    badge: "HOT",
    description: "Crafted in Switzerland, the Aurelia Chronograph boasts an 18-karat yellow gold case, hand-stitched alligator strap, and automatic precision movement designed for the ultimate modern luxury experience.",
    specifications: {
      "Case Material": "18k Yellow Gold",
      "Water Resistance": "50m (5 ATM)",
      "Strap Material": "Genuine Alligator Leather",
      "Movement": "Swiss Automatic Chronograph"
    },
    colors: ["Gold-Black", "Pure Gold", "Rose Gold"],
    sizes: ["40mm", "42mm"]
  },
  {
    id: 2,
    name: "Alike-Pro Soundmaster Gold Edition",
    brand: "Alike Audio",
    price: 3499,
    mrp: 6999,
    rating: 4.6,
    reviewsCount: 148,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "electronics",
    badge: "SALE",
    description: "Immersive active noise-cancelling headphones tuned to golden standard. Features gold brushed metal plating, 40-hour battery capacity, and custom high-res drivers.",
    specifications: {
      "Driver Unit": "40mm Dynamic",
      "Battery Life": "Up to 40 Hours",
      "ANC Support": "Active Hybrid Noise Cancellation",
      "Bluetooth": "Version 5.3"
    },
    colors: ["Classic Black", "Champagne Gold"],
    sizes: ["Standard"]
  },
  {
    id: 3,
    name: "18K Gold plated Venetian Chain Necklace",
    brand: "Venezia Jewels",
    price: 5999,
    mrp: 11999,
    rating: 4.9,
    reviewsCount: 220,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "jewellery",
    audience: "unisex",
    badge: "TRENDING",
    description: "An elegant Italian-crafted Venetian chain dipped in authentic 18-karat gold. Designed with precision linkage for a comfortable feel and rich glow.",
    specifications: {
      "Chain Length": "22 Inches",
      "Metal Dipped": "18k Gold on Sterling Silver",
      "Clasp Type": "Secure Lobster Clasp",
      "Weight": "12.4g"
    },
    colors: ["Yellow Gold", "White Gold"],
    sizes: ["20 Inch", "22 Inch", "24 Inch"]
  },
  {
    id: 4,
    name: "Alike-Book Master Pro 16",
    brand: "Alike-ND Computing",
    price: 89999,
    mrp: 124999,
    rating: 4.9,
    reviewsCount: 96,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "laptops",
    badge: "LIMITED",
    description: "Powered by the stellar M4 Alike SuperChip, featuring 32GB unified RAM, 1TB premium high-speed flash storage, and a breathtaking liquid OLED true-gold display.",
    specifications: {
      "Processor": "Alike M4 Gen2 Max",
      "Memory": "32GB RAM",
      "Storage": "1TB NVMe Express SSD",
      "Display Size": "16.2 inch True-LID OLED"
    },
    colors: ["Space Black", "Gold Luxury Tint"],
    sizes: ["32GB/1TB", "64GB/2TB"]
  },
  {
    id: 5,
    name: "Midnight Silk Evening Gown",
    brand: "Aura Couture",
    price: 7999,
    mrp: 14999,
    rating: 4.7,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "fashion",
    audience: "women",
    badge: "HOT",
    description: "Flowing beautifully, this mulberry silk evening gown is tailored precisely for VIP cocktail galas, featuring structured pleats and gold thread embroidery.",
    specifications: {
      "Fabric": "100% Organic Mulberry Silk",
      "Stitch": "Handcrafted Atelier",
      "Fit Type": "Slim Evening Silhouette"
    },
    colors: ["Classic Onyx", "Deep Emerald", "Imperial Gold"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 6,
    name: "Alike-Phon Gold-Titanium 15 Ultra",
    brand: "Alike Mobiles",
    price: 64999,
    mrp: 89999,
    rating: 4.8,
    reviewsCount: 450,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1565849511511-ab60w21a80d5?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "mobiles",
    badge: "HOT",
    description: "The crown jewel of modern smartphones. Crafted out of grade-5 gold titanium, dynamic camera, true-motion display and unmatched ultra performance.",
    specifications: {
      "Chassis": "Tier-5 Titanium Gold Alloy",
      "Camera": "200MP Triple Golden-Eye Lens",
      "Storage": "512GB High Speed UFS",
      "Battery Charge": "100W Golden Flash Charging"
    },
    colors: ["Titanium Gold", "Satin Midnight"],
    sizes: ["256GB", "512GB"]
  },
  {
    id: 7,
    name: "Luxury Gold Trim Espresso Machine",
    brand: "Barista Royale",
    price: 18999,
    mrp: 29999,
    rating: 4.5,
    reviewsCount: 110,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "furniture",
    badge: "NEW",
    description: "Premium professional grade espresso pump embellished with authentic polished brass gold trims. Auto foam wand and 19-bar extraction pressure.",
    specifications: {
      "Pressure Type": "19-Bar Italian Pump",
      "Finish Type": "Gold Lustre Metallic Trims",
      "Bean Capacity": "250g Hopper"
    },
    colors: ["Pitch Black & Gold", "Ivory White & Gold"],
    sizes: ["Standard"]
  },
  {
    id: 8,
    name: "Wholesale Premium Organic Saffron Bulks (100g)",
    brand: "Persian Royal Wholesales",
    price: 14500,
    mrp: 25000,
    rating: 4.9,
    reviewsCount: 310,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1512411652497-6aef86ba6bf2?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1533038590840-1cde6b66b723?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "wholesale",
    badge: "SALE",
    isWholesale: true,
    wholesaleMinQty: 5,
    wholesalePrice: 12500,
    description: "Direct premium grade-A saffron threads collected of royal fields. Highly aromatic, purely tested, ideal for gold bulk spice buyers.",
    specifications: {
      "Grade": "Super Negin AAA Quality",
      "Pack Weight": "100 Grams Shield-Tub",
      "Origin": "Khorasan Fields"
    },
    colors: ["Standard"],
    sizes: ["100g", "500g"]
  },
  {
    id: 9,
    name: "Wholesale Alike Type-C Fast Chargers [Bulk Pack 50pcs]",
    brand: "Alike Hardware",
    price: 4999,
    mrp: 14999,
    rating: 4.7,
    reviewsCount: 65,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "wholesale",
    badge: "HOT",
    isWholesale: true,
    wholesaleMinQty: 2,
    wholesalePrice: 4499,
    description: "Industrial wholesale supply of 50 high-durability fast chargers. Perfect for retailers, corner shops, and business suppliers.",
    specifications: {
      "Charger Output": "33W Power Delivery 3.0",
      "Cable Type": "Tough Braided Copper Core",
      "Box Quantity": "50 Individually Boxed Pieces"
    },
    colors: ["Onyx Black", "Frost White"],
    sizes: ["50-Pcs Set"]
  },
  {
    id: 10,
    name: "Alike RGB-Onyx Gaming Keyboard",
    brand: "Alike Gaming",
    price: 1999,
    mrp: 3999,
    rating: 4.5,
    reviewsCount: 194,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1626908013351-800ddd734b8a?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "gaming",
    badge: "SALE",
    description: "Sleek tactical mechanical mechanical keyboard fitted with gold-plated switches for instant response, gorgeous custom backlit layouts.",
    specifications: {
      "Key Switch": "Gold Contact Blue Clicky",
      "Chassis Material": "Anodized Aircraft Aluminum",
      "Cable": "Ultra-light Detachable Mesh"
    },
    colors: ["Black-RGB", "White-Gold RGB"],
    sizes: ["Keyless 87-key", "Full Size 104-key"]
  },
  {
    id: 11,
    name: "Premium Gold Glow Facial Extract Glow Serum",
    brand: "Glow & Co",
    price: 1299,
    mrp: 2499,
    rating: 4.4,
    reviewsCount: 82,
    image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "beauty",
    audience: "unisex",
    badge: "SALE",
    description: "Enriched with real micro gold leaf flakes and organic hyaluronic essence for stellar deep moisturization and youthful golden radiance.",
    specifications: {
      "Key Ingredients": "24k Gold Extract, Vitamin E, Squalane",
      "Skin Compatibility": "All Types Including Sensitive",
      "Volume": "50ml Luxury Dropper Shield"
    },
    colors: ["Standard"],
    sizes: ["30ml", "50ml"]
  },
  {
    id: 12,
    name: "Sleek Chrome Finish Professional Tool Kit (Fast Delivery)",
    brand: "Apex Hardware",
    price: 2499,
    mrp: 4999,
    rating: 4.6,
    reviewsCount: 54,
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1530124324315-4f021a5223c5?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "hardware",
    badge: "NEW",
    description: "Expedited doorstep delivery! Complete premium rust-resistant vanadium steel toolkit housed in a gorgeous gold-accented protective hardcase.",
    specifications: {
      "Piece Count": "48 Professional Tools",
      "Material Quality": "Chrome-Vanadium Premium Grade",
      "Delivery Speed": "Fast Delivery"
    },
    colors: ["Industrial Set"],
    sizes: ["48-Piece Set"]
  },
  {
    id: 13,
    name: "Luxury Gold Velvet Ottoman Sofa Chair",
    brand: "Amore Living",
    price: 12499,
    mrp: 19999,
    rating: 4.3,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "furniture",
    badge: "TRENDING",
    description: "Make a bold luxury statement. Ultra cozy golden premium velvet upholstery backed on highly sturdy stainless hand-polished gold frames.",
    specifications: {
      "Upholstery": "Luxe Velvet Gold Fibre",
      "Frame Material": "Stainless Gold-PVD Steel",
      "Seat Density": "35-grade High Resilient Elastic foam"
    },
    colors: ["Imperial Royal Gold", "Emerald Teal", "Luxury Ruby"],
    sizes: ["Standard Fit"]
  },
  {
    id: 14,
    name: "Alike Ultra-Premium Organic Caviar Shield (Fast Delivery)",
    brand: "Royal Caspian",
    price: 4500,
    mrp: 7500,
    rating: 4.9,
    reviewsCount: 30,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1511250325983-e18e8d89e5fc?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "delivery",
    eligibleFor20MinDelivery: true,
    badge: "HOT",
    description: "Direct elite food-gourmet collection delivered at cold temperature straight to your doorway with express courier dispatch. Pure taste of luxury.",
    specifications: {
      "Standard Grade": "Beluga Royal Golden Reserve",
      "Chill Seal": "Yes, dry-ice insulated tin case"
    },
    colors: ["Reserve Cold"],
    sizes: ["50g Deluxe Tin"]
  },
  {
    id: 15,
    name: "Alike Gold plated Pro Gaming Controller",
    brand: "Alike Gaming",
    price: 4999,
    mrp: 7999,
    rating: 4.7,
    reviewsCount: 162,
    image: "https://images.unsplash.com/photo-1600080972464-8e5f358024ae?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1600080972464-8e5f358024ae?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1531525645387-7f14be1bdbdb?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "gaming",
    badge: "SALE",
    description: "Precision triggers, tactile gold micro-switch paddles, and an amazing customized metallic luxury finish. Fully compatible with PC/PS5/Xbox series.",
    specifications: {
      "Trigger Type": "Magnetic Hall-Effect Precision",
      "Battery Capacity": "20 Hours continuous play",
      "Wireless": "Ultra-low-latency 2.4GHz + Bluetooth"
    },
    colors: ["Rich Gold-Onyx", "Pure Platinum-Gold"],
    sizes: ["Standard Extra Grip"]
  },
  {
    id: 16,
    name: "Alike-Pro Golden-Air Purifier 5G",
    brand: "Alike Hardware",
    price: 15999,
    mrp: 24999,
    rating: 4.6,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1520116468412-95db8817bc25?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "electronics",
    badge: "NEW",
    description: "Quiet, high CADR gold-trim purifier. Captures 99.97% air micro particles using real-time laser monitoring and elegant control layouts.",
    specifications: {
      "Filter Type": "True HEPA H13 Gold Carbon Filter",
      "Coverage": "Up to 500 Sq Ft",
      "Noise Level": "Whisper Quiet 22dB"
    },
    colors: ["Piano Ivory Gold"],
    sizes: ["Premium Tall"]
  },
  {
    id: 17,
    name: "Luxury Amber & Oud Organic Scented Candle Extra",
    brand: "Aura Fragrances",
    price: 899,
    mrp: 1499,
    rating: 4.4,
    reviewsCount: 120,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "beauty",
    audience: "unisex",
    badge: "SALE",
    description: "Hand-poured premium soy candle scented with heavy organic amber oil and pure gold leaf details. Up to 60 hours clean, non-toxic burn time.",
    specifications: {
      "Wax Blend": "100% Premium Natural Soy-Bee Wax",
      "Scent Strength": "Heavy Therapeutic",
      "Wick": "Natural Wood-Crackle Wick"
    },
    colors: ["Classy Soy Amber"],
    sizes: ["300g Heavy Glass"]
  },
  {
    id: 18,
    name: "Wholesale Silk Ribbon Gift-Wrappers [Box of 300 Rolls]",
    brand: "Aura Couture",
    price: 2999,
    mrp: 5999,
    rating: 4.3,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "wholesale",
    badge: "SALE",
    isWholesale: true,
    wholesaleMinQty: 3,
    wholesalePrice: 2499,
    description: "High-end luxury satin ribbons wrapped in magnificent metallic colors for high-end boutique gift presentations and premium branding agencies.",
    specifications: {
      "Ribbon Width": "2.5cm Extra Wide",
      "Length per roll": "25 Yards",
      "Ribbon Inclusions": "Gold foil detailed finish"
    },
    colors: ["Mixed Luxury Box"],
    sizes: ["300-Roll Pack"]
  },
  {
    id: 19,
    name: "Royal Gir Cow Organic A2 Pure Bilona Ghee (1L)",
    brand: "Vedic Organics",
    price: 1850,
    mrp: 2400,
    rating: 4.9,
    reviewsCount: 284,
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "grocery",
    subCategory: "Oil & Ghee",
    eligibleFor20MinDelivery: true,
    badge: "HOT",
    description: "Authentic Vedic churned Gir cow A2 cultured bilona ghee in luxury glass jar. Freshly packed, rich aroma, and high nutritional purity.",
    specifications: {
      "Volume": "1000ml (1 Litre)",
      "Process": "Traditional Wooden Churned Bilona",
      "Certification": "FSSAI Organic Certified"
    },
    colors: ["Natural Golden Yellow"],
    sizes: ["1 Litre Jar", "500ml Jar"]
  },
  {
    id: 20,
    name: "Royal Dum Biryani Feast with Mirchi Ka Salan & Raita",
    brand: "Nawabi Dastarkhwan",
    price: 499,
    mrp: 699,
    rating: 4.9,
    reviewsCount: 420,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "food_delivery",
    subCategory: "Biryani",
    eligibleFor20MinDelivery: true,
    badge: "HOT",
    isFlashSale: true,
    description: "Slow-cooked saffron-infused fragrant basmati rice layered with rich marinated spices, caramelized onions, and royal herbs. Dispatched piping hot with fast delivery.",
    specifications: {
      "Portion": "Serves 1-2 Persons",
      "Packaging": "Hot Insulated Luxury Box",
      "Delivery Speed": "Fast Delivery"
    },
    colors: ["Classic Hyderabadi Dum"],
    sizes: ["Regular (Serves 1-2)", "Jumbo Feast (Serves 3-4)"]
  },
  {
    id: 21,
    name: "Artisanal Wood-Fired Truffle Margherita Pizza (12-inch)",
    brand: "Atelier Pizza Roma",
    price: 649,
    mrp: 899,
    rating: 4.8,
    reviewsCount: 195,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "food_delivery",
    subCategory: "Pizza",
    eligibleFor20MinDelivery: true,
    badge: "SALE",
    description: "Sourdough crust baked in oak-fired ovens at 450°C. San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil, and Italian black truffle oil.",
    specifications: {
      "Size": "12 Inch Round",
      "Crust": "48-Hour Fermented Sourdough",
      "Cheese": "100% Buffalo Mozzarella"
    },
    colors: ["Wood-Fired Crust"],
    sizes: ["12 Inch (8 Slices)"]
  },
  {
    id: 22,
    name: "Exotic California Jumbo Almonds & Walnuts Combo (1kg)",
    brand: "Alike Gourmet Harvest",
    price: 1399,
    mrp: 2199,
    rating: 4.8,
    reviewsCount: 160,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "grocery",
    subCategory: "Dry Fruits & Nuts",
    eligibleFor20MinDelivery: true,
    badge: "NEW",
    description: "Vacuum nitrogen sealed premium crunchy California almonds and light-halves Kashmiri walnuts. Rich in plant protein, antioxidants, and essential healthy fats.",
    specifications: {
      "Net Weight": "500g Almonds + 500g Walnuts",
      "Grade": "King Jumbo Selection",
      "Origin": "California / Kashmir"
    },
    colors: ["Natural Golden Blend"],
    sizes: ["1kg Duo Pack", "500g Pack"]
  },
  {
    id: 23,
    name: "Bespoke Italian Wool Men's Tuxedo Suit",
    brand: "Alike Sartorial",
    price: 18999,
    mrp: 28999,
    rating: 4.9,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=75&w=500&fm=webp",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "fashion",
    subCategory: "Men's Apparel",
    audience: "men",
    badge: "HOT",
    description: "Tailored from Super 150s Merino wool with satin shawl lapels and hand-finished pick stitching. An iconic formal masterpiece for gala evenings.",
    specifications: {
      "Fabric": "100% Super 150s Wool",
      "Lapel": "Silk Satin Shawl",
      "Cut": "Tailored Slim Fit"
    },
    colors: ["Midnight Black", "Royal Navy"],
    sizes: ["38R", "40R", "42R", "44R"]
  },
  {
    id: 24,
    name: "Junior Boys Heritage Linen Bandhgala Kurta",
    brand: "Alike Sovereign Kids",
    price: 3499,
    mrp: 4999,
    rating: 4.8,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "fashion",
    subCategory: "Kids & Teens",
    audience: "boys",
    badge: "NEW",
    description: "Handcrafted breathable organic linen kurta featuring brass-finish buttons and mandarin bandhgala collar for traditional festive celebrations.",
    specifications: {
      "Fabric": "100% Organic Linen",
      "Occasion": "Festive / Wedding"
    },
    colors: ["Ivory Gold", "Powder Blue"],
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-12Y"]
  },
  {
    id: 25,
    name: "Little Princess Embroidered Silk Frock",
    brand: "Alike Sovereign Kids",
    price: 3999,
    mrp: 5499,
    rating: 4.9,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "fashion",
    subCategory: "Kids & Teens",
    audience: "girls",
    badge: "TRENDING",
    description: "Delicate mulberry silk flared frock with golden zari hand-embroidery and soft cotton inner lining designed for royal comfort.",
    specifications: {
      "Fabric": "Mulberry Silk with Cotton Lining",
      "Closure": "Concealed YKK Zipper"
    },
    colors: ["Blush Rose", "Champagne Gold"],
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"]
  },
  {
    id: 26,
    name: "Pure Cashmere Infant Hooded Romper",
    brand: "Alike Sovereign Kids",
    price: 2799,
    mrp: 3899,
    rating: 5.0,
    reviewsCount: 31,
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=75&w=500&fm=webp",
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&q=75&w=500&fm=webp"
    ],
    category: "fashion",
    subCategory: "Kids & Teens",
    audience: "kids",
    badge: "NEW",
    description: "Ultra-gentle hypoallergenic Grade-A Mongolian cashmere knit romper. Designed for sensitive newborn skin with easy-snap button closures.",
    specifications: {
      "Material": "100% Grade-A Cashmere",
      "Safety": "OEKO-TEX Certified Non-Toxic"
    },
    colors: ["Warm Oat", "Cloud White"],
    sizes: ["0-3M", "3-6M", "6-12M", "12-18M"]
  }
];

export const JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Luxury Brand Consultant",
    company: "Alike-ND Luxury Group",
    location: "Mumbai, India (Hybrid)",
    salary: "₹15,00,000 - ₹24,00,000 / Yr",
    type: "Full-time",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=75&w=500&fm=webp",
    description: "Seeking an experienced advisor to manage relationship strategies, design premium gold customer experiences, and consult luxury sub-brands in Mumbai region.",
    requirements: [
      "5+ years luxury segment market consulting experience",
      "In-depth command of high-net-worth client workflows",
      "Stellar presentations, relationship management, and commercial vision"
    ]
  },
  {
    id: 2,
    title: "Lead Recommendation & Search Architect",
    company: "Alike-ND Tech Labs",
    location: "Bengaluru, India (Remote)",
    salary: "₹25,00,000 - ₹38,00,000 / Yr",
    type: "Remote",
    logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=75&w=500&fm=webp",
    description: "Design advanced machine learning models running real-time outfit matchmaking, personalized shopping suggestions, and deep learning matrix factorization algorithms.",
    requirements: [
      "Mastery of Python, PyTorch, and Transformer Architectures",
      "Experience deploying models serving 10M+ daily active recommendations",
      "Background in vector similarity databases (Milvus, Pinecone)"
    ]
  },
  {
    id: 3,
    title: "Express Fast Delivery Network Lead",
    company: "Alike Express Deliveries",
    location: "Delhi NCR, India",
    salary: "₹12,00,000 - ₹18,00,000 / Yr",
    type: "Full-time",
    logo: "https://images.unsplash.com/photo-1580907115718-4c8abd021ae5?auto=format&fit=crop&q=75&w=500&fm=webp",
    description: "Manage dark store logistics, express delivery fleets, real-time optimal routing trackers, and guarantee rapid delivery speed across hub networks.",
    requirements: [
      "Strong background in fast-moving consumer logistics or express e-grocery",
      "Stellar real-time data analytical command",
      "Leadership of 500+ bike distribution fleet crew"
    ]
  },
  {
    id: 4,
    title: "E-Commerce Creative Director",
    company: "Alike-ND Creative Studios",
    location: "Bengaluru, India",
    salary: "₹18,00,000 - ₹28,00,000 / Yr",
    type: "Full-time",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=75&w=500&fm=webp",
    description: "Elevate our dark-luxury interface and aesthetic branding. Lead photoshoots, curate high-end gold accents, packaging aesthetics, and premium web designs.",
    requirements: [
      "8+ years of top-tier branding agency or lifestyle creative experience",
      "Stellar visual portfolio exhibiting premium high-contrast design styling",
      "Competency directing high-end product photoshoots"
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Vikram Malhotra",
    role: "Premium Elite HNW Buyer",
    content: "The Gold-Chronograph timepiece I bought is beyond breathtaking. The packaging arrived wrapped in stunning solid design box, and the service feels truly first-class. Best e-commerce ever!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=75&w=500&fm=webp",
    rating: 5
  },
  {
    id: 2,
    name: "Rhea Chawla",
    role: "Verified Seller & Boutique Owner",
    content: "Listing my handcrafted embroidery jewellery via the Alike-ND dashboard has scaled my business by 300%. The real-time messenger connects me instantly with clients.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=75&w=500&fm=webp",
    rating: 5
  },
  {
    id: 3,
    name: "Aryan Deshmukh",
    role: "Express Diner & tech-geek",
    content: "I didn't believe the Fast Delivery label, but my Beluga Caviar arrived in precisely 16 minutes flat inside deep dry ice packaging! Absolutely stellar network.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=75&w=500&fm=webp",
    rating: 4.8
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "promotion",
    title: "Welcome to ALIKE-ND",
    description: "Explore our curated catalog of ultra-premium electronics, handcrafted jewellery, and luxury designer apparel.",
    timestamp: "Just now",
    isRead: false
  },
  {
    id: "notif-2",
    type: "promotion",
    title: "Exclusive Golden Hours",
    description: "Apply coupon ALIKE10 for a luxury 10% flat discount on our entire Gold Jewellery catalogue today only.",
    timestamp: "2 hours ago",
    isRead: false
  },
  {
    id: "notif-3",
    type: "system",
    title: "Wallet Ready",
    description: "Your Alike Secure Wallet is active. You can add funds anytime for 1-click checkout.",
    timestamp: "1 day ago",
    isRead: true
  }
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: "contact-alike-support",
    name: "Kowshik Kanti Das",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=75&w=500&fm=webp",
    lastMessage: "Order dispatched successfully",
    timestamp: "10:46 PM",
    unreadCount: 0,
    isOnline: true,
    messages: [
      { 
        id: "m1", 
        text: "Hello, how can I assist you with your Alike purchase today?", 
        sender: "contact", 
        timestamp: "Active 2h ago",
        status: "read"
      },
      {
        id: "m2",
        text: "Order dispatched successfully",
        sender: "user",
        timestamp: "Feb 16, 2026, 10:46 PM",
        image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=75&w=500&fm=webp",
        status: "read"
      }
    ]
  },
  {
    id: "contact-jewel-boutique",
    name: "Aura Royal Jewellery Boutique",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=75&w=500&fm=webp",
    lastMessage: "The 18K Venetian Chain is authentic Italian plated silver setting, yes.",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: "m4", text: "Good day! Is the 18K Venetian Chain solid gold or dipped sterling?", sender: "user", timestamp: "Yesterday" },
      { id: "m5", text: "The 18K Venetian Chain is authentic Italian plated silver setting, yes.", sender: "contact", timestamp: "Yesterday" }
    ]
  },
  {
    id: "contact-gaming-hub",
    name: "Alike Gaming Store Rep",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=75&w=500&fm=webp",
    lastMessage: "We have only 12 pieces of the Gold Plated Controller left in stock!",
    timestamp: "3 days ago",
    unreadCount: 0,
    isOnline: true,
    messages: [
      { id: "m6", text: "Do you have controllers in stock now?", sender: "user", timestamp: "3 days ago" },
      { id: "m7", text: "We have only 12 pieces of the Gold Plated Controller left in stock!", sender: "contact", timestamp: "3 days ago" }
    ]
  }
];
