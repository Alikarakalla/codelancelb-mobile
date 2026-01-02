import { Product, CartItem } from '@/types/schema';

// --- REUSABLE MOCK DATA HELPERS ---
const MOCK_REVIEWS = [
    { id: 1, product_id: 1001, user_id: 1, rating: 5, review: 'Absolutely love this! Great quality.', status: 'approved' as const, created_at: '2025-12-15' },
    { id: 2, product_id: 1001, user_id: 2, rating: 4, review: 'Good value for money, fast delivery.', status: 'approved' as const, created_at: '2025-12-18' },
];

export const MOCK_PRODUCT_1: Product = {
    id: 1001,
    category_id: 8,
    brand_id: 22,
    name: 'Leather Crossbody Bag',
    name_en: 'Leather Crossbody Bag',
    name_ar: 'حقيبة جلدية كروس بودي',
    slug: 'leather-crossbody-bag',
    sku: 'BAG-LXB-001',
    main_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    short_description_en: 'Crafted from premium Italian leather with polished gold-tone hardware.',
    description_en: 'A versatile and elegant crossbody bag that transitions perfectly from day to night. Featuring a spacious interior lined with suede, an adjustable strap, and an internal zip pocket for organization. The gold-tone buckle adds a touch of luxury to this timeless piece.',
    is_visible: true,
    is_featured: true,
    has_variants: true,
    stock_quantity: 45,
    track_inventory: true,
    price: 245.00,
    compare_at_price: 295.00,
    options: [
        { id: 201, product_id: 1001, name: 'Color', values: ['Classic Black', 'Cognac Tan', 'Olive Green'], sort_order: 0 },
        { id: 202, product_id: 1001, name: 'Hardware', values: ['Gold', 'Silver'], sort_order: 1 }
    ],
    variants: [
        {
            id: 3001, product_id: 1001, slug: 'black-gold', color: 'Classic Black', size: 'Gold', stock_quantity: 10, is_visible: true, prevent_listing: false, is_default: true, price: 245.00,
            image_path: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=800&auto=format&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop'
            ],
            option_values: {
                color: { name: 'Classic Black', code: '#111827' },
                hardware: { name: 'Gold', code: '#d4af37' }
            }
        },
        {
            id: 3002, product_id: 1001, slug: 'tan-gold', color: 'Cognac Tan', size: 'Gold', stock_quantity: 15, is_visible: true, prevent_listing: false, is_default: false, price: 245.00,
            image_path: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop',
            gallery: [
                'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop'
            ],
            option_values: {
                color: { name: 'Cognac Tan', code: '#8B4513' },
                hardware: { name: 'Gold', code: '#d4af37' }
            }
        }
    ],
    images: [
        { id: 10, product_id: 1001, path: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', sort_order: 0 }
    ],
    reviews: MOCK_REVIEWS,
    brand: { id: 22, name: 'Gucci', name_en: 'Gucci', name_ar: 'غوكسي', slug: 'gucci', is_active: true }
};

export const MOCK_PRODUCT_2: Product = {
    id: 1002,
    category_id: 9,
    brand_id: 23,
    name: 'Wool Blend Overcoat',
    name_en: 'Wool Blend Overcoat',
    name_ar: 'معطف صوف فاخر',
    slug: 'wool-blend-overcoat',
    sku: 'CT-WBO-002',
    main_image: 'https://images.unsplash.com/photo-1539533727851-6a40510f01ba?q=80&w=800&auto=format&fit=crop',
    short_description_en: 'Tailored fit overcoat in a soft wool blend.',
    description_en: 'Exquisitely tailored from a mid-weight wool blend, this overcoat features a classic notched lapel, multiple utility pockets, and a button-down front. Perfect for layering over formal or casual attire during the cooler months.',
    is_visible: true,
    is_featured: true,
    has_variants: true,
    stock_quantity: 30,
    track_inventory: true,
    price: 350.00,
    compare_at_price: 420.00,
    options: [
        { id: 203, product_id: 1002, name: 'Color', values: ['Camel', 'Midnight Navy'], sort_order: 0 },
        { id: 204, product_id: 1002, name: 'Size', values: ['M', 'L', 'XL'], sort_order: 1 }
    ],
    variants: [
        {
            id: 4001, product_id: 1002, slug: 'camel-m', color: 'Camel', size: 'M', stock_quantity: 5, is_visible: true, prevent_listing: false, is_default: true, price: 350.00,
            image_path: 'https://images.unsplash.com/photo-1539533727851-6a40510f01ba?q=80&w=800&auto=format&fit=crop',
            option_values: {
                color: { name: 'Camel', code: '#C19A6B' }
            }
        },
        {
            id: 4002, product_id: 1002, slug: 'navy-m', color: 'Midnight Navy', size: 'M', stock_quantity: 8, is_visible: true, prevent_listing: false, is_default: false, price: 350.00,
            image_path: 'https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=800&auto=format&fit=crop',
            option_values: {
                color: { name: 'Midnight Navy', code: '#191970' }
            }
        }
    ],
    reviews: [],
    brand: { id: 23, name: 'Burberry', name_en: 'Burberry', name_ar: 'بربري', slug: 'burberry', is_active: true }
};

export const MOCK_PRODUCTS: Product[] = [
    MOCK_PRODUCT_1,
    MOCK_PRODUCT_2
];

export const MOCK_CATEGORIES = [
    { id: 8, name: 'HANDBAGS', slug: 'handbags', icon: 'handbag', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop' },
    { id: 9, name: 'OUTWEAR', slug: 'outwear', icon: 'shirt', image: 'https://images.unsplash.com/photo-1539533727851-6a40510f01ba?q=80&w=1000&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1539533727851-6a40510f01ba?q=80&w=1000&auto=format&fit=crop' },
    { id: 10, name: 'ACCESSORIES', slug: 'accessories', icon: 'watch', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop' },
    { id: 11, name: 'SHOES', slug: 'shoes', icon: 'walk', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop' },
];

export const MOCK_BRANDS = [
    { id: 22, name: 'Gucci', slug: 'gucci', logo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop' },
    { id: 23, name: 'Burberry', slug: 'burberry', logo: 'https://images.unsplash.com/photo-1617137968427-85924c809a10?q=80&w=800&auto=format&fit=crop' },
    { id: 24, name: 'Prada', slug: 'prada', logo: 'https://images.unsplash.com/photo-1529139574466-a302d2052574?q=80&w=800&auto=format&fit=crop' },
];

export const MOCK_BANNERS = [
    { id: 1, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000', button_text_en: 'EXPLORE COLLECTIONS' },
    { id: 2, image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000', button_text_en: 'NEW ARRIVALS' },
];

export const MOCK_HIGHLIGHTS = [
    { id: 1, title_en: 'Limited Edition', subtitle_en: 'Get 20% off on all luxury bags', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=800' },
];

export const MOCK_FEATURES = [
    { id: 1, title_en: 'Free Shipping', subtitle_en: 'On all orders over $500', icon: 'airplane-outline' },
    { id: 2, title_en: 'Premium Quality', subtitle_en: '100% Authentic products', icon: 'shield-checkmark-outline' },
];

export const MOCK_PRODUCT = MOCK_PRODUCT_1;

export const MOCK_CART_ITEMS: CartItem[] = [
    {
        id: 1,
        product_id: 1001,
        qty: 1,
        price: 245.00,
        options: { "Color": "Classic Black", "Hardware": "Gold" },
        product: MOCK_PRODUCT_1
    }
];
