import { Product, CartItem, User, WishlistItem, CarouselSlide, Category, HighlightSection, Brand, Banner, CMSFeature, ProductReview } from '@/types/schema';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_BANNERS, MOCK_HIGHLIGHTS, MOCK_FEATURES } from '@/constants/mockData';

// 1. CHANGE THIS in your .env file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const IS_DEV = __DEV__;
const IS_PLACEHOLDER = !BASE_URL || BASE_URL.includes('your-website.com');

// Helper to handle response
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Expected JSON but got:', text.substring(0, 100));
        throw new Error('Invalid response format: Expected JSON');
    }

    try {
        return await response.json();
    } catch (err) {
        console.error('JSON Parse Error:', err);
        throw new Error('Failed to parse response');
    }
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
        try {
            if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
            const res = await fetch(`${BASE_URL}/products/${id}?include=variants,options,images,reviews,brand,category`);
            return await handleResponse<Product>(res);
        } catch (err) {
            if (!IS_PLACEHOLDER) console.error(`Error fetching product ${id}:`, err);
            // Fallback to mock in DEV
            if (IS_DEV) {
                const mock = MOCK_PRODUCTS.find(p => p.id.toString() === id.toString());
                if (mock) return mock;
            }
            throw err;
        }
    },

    async getRelatedProducts(productId: number | string): Promise<Product[]> {
        const res = await fetch(`${BASE_URL}/products/${productId}/related`);
        return handleResponse<Product[]>(res);
    },

    async getProductReviews(productId: number | string): Promise<ProductReview[]> {
        const res = await fetch(`${BASE_URL}/products/${productId}/reviews`);
        return handleResponse<ProductReview[]>(res);
    },

    // --- Content ---
    async getCarouselSlides(): Promise<CarouselSlide[]> {
        const res = await fetch(`${BASE_URL}/content/carousel`);
        return handleResponse<CarouselSlide[]>(res);
    },

    // --- Categories ---
    async getCategories(): Promise<Category[]> {
        try {
            if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
            const res = await fetch(`${BASE_URL}/categories`);
            return await handleResponse<Category[]>(res);
        } catch (err) {
            if (!IS_PLACEHOLDER) console.error('Error fetching categories:', err);
            if (IS_DEV) return MOCK_CATEGORIES as any;
            throw err;
        }
    },

    // --- Highlight Sections ---
    async getHighlightSections(): Promise<HighlightSection[]> {
        try {
            if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
            const res = await fetch(`${BASE_URL}/content/highlights`);
            return await handleResponse<HighlightSection[]>(res);
        } catch (err) {
            if (!IS_PLACEHOLDER) console.error('Error fetching highlights:', err);
            if (IS_DEV) return MOCK_HIGHLIGHTS as any;
            throw err;
        }
    },

    // --- Brands ---
    async getBrands(): Promise<Brand[]> {
        try {
            if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
            const res = await fetch(`${BASE_URL}/brands`);
            return await handleResponse<Brand[]>(res);
        } catch (err) {
            if (!IS_PLACEHOLDER) console.error('Error fetching brands:', err);
            if (IS_DEV) return MOCK_BRANDS as any;
            throw err;
        }
    },

    // --- Banners ---
    async getBanners(): Promise<Banner[]> {
        try {
            if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
            const res = await fetch(`${BASE_URL}/banners`);
            return await handleResponse<Banner[]>(res);
        } catch (err) {
            if (!IS_PLACEHOLDER) console.error('Error fetching banners:', err);
            if (IS_DEV) return MOCK_BANNERS as any;
            throw err;
        }
    },

    // --- CMS Features ---
    async getCMSFeatures(): Promise<CMSFeature[]> {
        try {
            if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
            const res = await fetch(`${BASE_URL}/content/features`);
            return await handleResponse<CMSFeature[]>(res);
        } catch (err) {
            if (!IS_PLACEHOLDER) console.error('Error fetching features:', err);
            if (IS_DEV) return MOCK_FEATURES as any;
            throw err;
        }
    },

    // --- Products ---
    async getProducts(params?: { category_id?: number; brand_id?: number; is_featured?: boolean; limit?: number }): Promise<Product[]> {
        try {
            if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
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
            return await handleResponse<Product[]>(res);
        } catch (err) {
            if (!IS_PLACEHOLDER) console.error('Error fetching products:', err);
            if (IS_DEV) {
                let filtered = [...MOCK_PRODUCTS];
                if (params?.category_id) {
                    filtered = filtered.filter(p => p.category_id === params.category_id);
                }
                if (params?.brand_id) {
                    filtered = filtered.filter(p => p.brand_id === params.brand_id);
                }
                if (params?.is_featured !== undefined) {
                    filtered = filtered.filter(p => p.is_featured === params.is_featured);
                }
                if (params?.limit) {
                    filtered = filtered.slice(0, params.limit);
                }
                return filtered;
            }
            throw err;
        }
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
