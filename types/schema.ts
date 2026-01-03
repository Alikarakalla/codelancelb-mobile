export interface Product {
    id: number;
    category_id: number;
    sub_category_id?: number | null;
    brand_id?: number | null;
    name: string; // fallback
    name_en?: string;
    name_ar?: string;
    slug: string;
    sku?: string | null;
    barcode?: string | null;
    main_image?: string | null;
    short_description?: string;
    short_description_en?: string;
    short_description_ar?: string;
    description?: string;
    description_en?: string;
    description_ar?: string;
    is_visible: boolean; // tinyint(1) -> boolean
    is_featured: boolean;
    has_variants: boolean;
    stock_quantity: number;
    track_inventory: boolean;
    price?: number | null; // decimal(10,2)
    compare_at_price?: number | null;
    cost_price?: number | null;
    weight?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
    discount_amount?: number | null;
    discount_type?: 'fixed' | 'percent' | null;
    published_at?: string | null; // timestamp
    created_at?: string;
    updated_at?: string;

    // Relations (Loaded typically)
    variants?: ProductVariant[];
    options?: ProductOption[];
    images?: ProductImage[];
    reviews?: ProductReview[];
    brand?: Brand;
    category?: Category;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    slug: string;
    color?: string | null;
    size?: string | null;
    option_values?: Record<string, any> | null; // json
    image_path?: string | null;
    gallery?: string[] | null; // json array of strings
    sku?: string | null;
    barcode?: string | null;
    hs_code?: string | null;
    price?: number | null;
    compare_at_price?: number | null;
    cost_price?: number | null;
    discount_amount?: number | null;
    discount_type?: 'fixed' | 'percent' | null;
    stock_quantity: number;
    is_visible: boolean;
    prevent_listing: boolean;
    is_default: boolean;
}

export interface ProductOption {
    id: number;
    product_id: number;
    name: string;
    values: string[]; // json array
    sort_order: number;
}

export interface ProductImage {
    id: number;
    product_id: number;
    path: string;
    sort_order: number;
}

export interface ProductReview {
    id: number;
    product_id: number;
    user_id: number;
    rating: number; // int
    review: string; // text
    status: 'pending' | 'approved' | 'rejected';
    created_at?: string;
    user?: { id: number; name: string; avatar?: string };
}

export interface Category {
    id: number;
    parent_id?: number | null;
    name: string;
    name_en?: string;
    name_ar?: string;
    slug: string;
    thumbnail?: string | null;
    description?: string;
    description_en?: string;
    description_ar?: string;
    is_active: boolean;
    show_in_header: boolean;
    sort_order: number;
    sub_categories?: Category[];
    sub_sub_categories?: Category[];
}

export interface HighlightSection {
    id: number;
    eyebrow_en?: string | null;
    eyebrow_ar?: string | null;
    title_en: string;
    title_ar: string;
    subtitle_en?: string | null;
    subtitle_ar?: string | null;
    cta_text_en?: string | null;
    cta_text_ar?: string | null;
    cta_url?: string | null;
    image?: string | null;
    image_position: 'left' | 'right';
    is_active: boolean;
    sort_order: number;
}

export interface Brand {
    id: number;
    name: string;
    name_en: string;
    name_ar: string;
    slug: string;
    logo?: string | null;
    is_active: boolean;
}

export interface Banner {
    id: number;
    image: string;
    image_mobile?: string | null;
    button_text_en?: string | null;
    button_text_ar?: string | null;
    button_url?: string | null;
    is_active: boolean;
    sort_order: number;
}

export interface CMSFeature {
    id: number;
    store_id: number;
    icon: string;
    image?: string | null;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    sort_order: number;
    is_active: boolean;
}

export interface CartItem {
    id: number;       // This might be pivot ID or unique item ID in cart table
    user_id?: number | null;
    session_id?: string | null;
    product_id: number;
    variant_key?: string | null; // potentially variant slug or ID reference
    options?: any; // json options selected
    qty: number;
    price: number;

    // Populated fields for UI
    product?: Product;
}

export interface User {
    id: number;
    name: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    phone?: string | null;
    phone_country?: string | null;
    city?: string | null;
    country?: string | null;
    avatar?: string | null;
    referral_code?: string | null;
    role: string;
    is_active: boolean;
    loyalty_points_balance: number;
    loyaltyTier?: { id: number; name: string } | null;
    loyalty_tier_id?: number | null;
    created_at?: string;
}

export interface WishlistItem {
    id: number;
    user_id?: number | null;
    session_id?: string | null;
    product_id: number;
    created_at?: string;

    // Populated relations
    product?: Product;
}

export interface CarouselSlide {
    id: number;
    title_en: string;
    title_ar: string;
    subtitle_en?: string | null;
    subtitle_ar?: string | null;
    cta_text_en?: string | null;
    cta_text_ar?: string | null;
    cta_url?: string | null;
    image_desktop?: string | null;
    image_mobile?: string | null;
    is_active: boolean;
    sort_order: number;
}

export interface Order {
    id: number;
    user_id?: number;
    session_id?: string;
    email: string;
    phone?: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    total_amount: number;
    currency: string;
    shipping_address: any; // json
    billing_address?: any; // json
    payment_method: string;
    items?: OrderItem[];
    created_at?: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    options?: any;
    product?: Product;
}

export interface Address {
    id: number;
    user_id: number;
    label: string; // Home, Office, etc.
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    zip_code: string;
    country: string;
    phone: string;
    is_default: boolean;
}

export interface Coupon {
    id: number;
    code: string;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    minimum_amount?: number;
    is_active: boolean;
    expires_at?: string;
}

// Currency Interface
export interface Currency {
    id: number;
    code: string;          // e.g., 'USD', 'EUR', 'LBP'
    name_en: string;       // e.g., 'US Dollar'
    name_ar: string;       // e.g., 'الدولار الأمريكي'
    symbol: string;        // e.g., '$', '€', 'L.L.'
    exchange_rate: number; // e.g., 1.00 for base currency
    is_base: boolean;      // true if this is the base currency
    is_active: boolean;
    sort_order: number;
}

export interface LoyaltyReward {
    id: number;
    name: string;
    description?: string;
    points_required: number;
    image?: string;
    is_active: boolean;
    can_redeem?: boolean; // Helper from API
}

export interface LoyaltyLog {
    id: number;
    user_id: number;
    points: number; // Signed integer (+/-)
    type: string;
    reference_id?: string;
    description?: string;
    created_at: string;
}
