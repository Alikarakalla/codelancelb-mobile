import { Product, CartItem, User, WishlistItem, CarouselSlide, Category, HighlightSection, Brand, Banner, CMSFeature } from '@/types/schema';

// 1. CHANGE THIS in your .env file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper to handle response
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }
    return response.json();
}

export const api = {
    // --- Auth ---
    async register(data: { name: string; email: string; password: string; phone?: string; phone_country?: string; referral_code?: string }) {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return handleResponse<{ user: User; token: string }>(res);
    },

    async login(data: { email: string; password: string }) {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return handleResponse<{ user: User; token: string }>(res);
    },



    async getProduct(id: number | string): Promise<Product> {
        const res = await fetch(`${BASE_URL}/products/${id}`);
        return handleResponse<Product>(res);
    },

    // --- Content ---
    async getCarouselSlides(): Promise<CarouselSlide[]> {
        const res = await fetch(`${BASE_URL}/content/carousel`);
        return handleResponse<CarouselSlide[]>(res);
    },

    // --- Categories ---
    async getCategories(): Promise<Category[]> {
        const res = await fetch(`${BASE_URL}/categories`);
        return handleResponse<Category[]>(res);
    },

    // --- Highlight Sections ---
    async getHighlightSections(): Promise<HighlightSection[]> {
        const res = await fetch(`${BASE_URL}/content/highlights`);
        return handleResponse<HighlightSection[]>(res);
    },

    // --- Brands ---
    async getBrands(): Promise<Brand[]> {
        const res = await fetch(`${BASE_URL}/brands`);
        return handleResponse<Brand[]>(res);
    },

    // --- Banners ---
    async getBanners(): Promise<Banner[]> {
        const res = await fetch(`${BASE_URL}/banners`);
        return handleResponse<Banner[]>(res);
    },

    // --- CMS Features ---
    async getCMSFeatures(): Promise<CMSFeature[]> {
        const res = await fetch(`${BASE_URL}/content/features`);
        return handleResponse<CMSFeature[]>(res);
    },

    // --- Products ---
    async getProducts(params?: { category_id?: number; brand_id?: number; is_featured?: boolean; limit?: number }): Promise<Product[]> {
        let url = `${BASE_URL}/products`;
        if (params) {
            const query = new URLSearchParams();
            if (params.category_id) query.append('category_id', params.category_id.toString());
            if (params.brand_id) query.append('brand_id', params.brand_id.toString());
            if (params.is_featured !== undefined) query.append('is_featured', params.is_featured ? '1' : '0');
            if (params.limit) query.append('limit', params.limit.toString());
            const queryString = query.toString();
            if (queryString) url += `?${queryString}`;
        }
        const res = await fetch(url);
        return handleResponse<Product[]>(res);
    },

    // --- Cart ---
    // Assuming you use a session token or auth token stored in the device
    async getCart(sessionId: string): Promise<CartItem[]> {
        const res = await fetch(`${BASE_URL}/cart`, {
            headers: { 'X-Session-ID': sessionId }
        });
        return handleResponse<CartItem[]>(res);
    },

    async addToCart(sessionId: string, productId: number, qty: number, options: any) {
        const res = await fetch(`${BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId
            },
            body: JSON.stringify({ product_id: productId, quantity: qty, options })
        });
        return handleResponse(res);
    },

    // --- Wishlist ---
    /**
     * Get wishlist items. 
     * Supports both sessionId (header) and Auth token (likely header handled globally or passed).
     */
    async getWishlist(sessionId?: string, token?: string): Promise<WishlistItem[]> {
        const headers: any = {};
        if (sessionId) headers['X-Session-ID'] = sessionId;
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${BASE_URL}/wishlist`, { headers });
        return handleResponse<WishlistItem[]>(res);
    },

    async toggleWishlist(productId: number, sessionId?: string, token?: string) {
        const headers: any = { 'Content-Type': 'application/json' };
        if (sessionId) headers['X-Session-ID'] = sessionId;
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${BASE_URL}/wishlist/toggle`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ product_id: productId })
        });
        return handleResponse(res);
    },
};
