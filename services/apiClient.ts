import { Product, CartItem, User, WishlistItem, CarouselSlide, Category, HighlightSection, Brand, Banner, CMSFeature, ProductReview, Order, Coupon, Currency } from '@/types/schema';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_BANNERS, MOCK_HIGHLIGHTS, MOCK_FEATURES } from '@/constants/mockData';

// 1. CHANGE THIS in your .env file
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;
// If env url is placeholder or missing, use the real one
const BASE_URL = (!ENV_URL || ENV_URL.includes('your-website.com'))
    ? 'https://sadekabdelsater.com/api/v1'
    : ENV_URL;

console.log('API Client Initialized with BASE_URL:', BASE_URL);

const IS_DEV = __DEV__;
const IS_PLACEHOLDER = false;

let apiToken: string | null = null;

export const setApiToken = (token: string | null) => {
    apiToken = token;
};

// Helper to get headers
function getHeaders(extraHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...extraHeaders,
    };
    if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`;
    }
    return headers;
}

// Helper to handle response
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error [${response.status}] at ${response.url}:`, errorBody.substring(0, 200));
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Invalid Response Format!');
        console.error('URL:', response.url);
        console.error('Status:', response.status);
        console.error('Received Body Preview:', text.substring(0, 500));
        throw new Error('Invalid response format: Expected JSON');
    }

    try {
        return await response.json();
    } catch (err) {
        console.error('JSON Parse Error at', response.url, err);
        throw new Error('Failed to parse response');
    }
}

// Helper to fix image URL
const fixUrl = (url?: string | null) =>
    (url && !url.startsWith('http')) ? `https://sadekabdelsater.com/storage/${url}` : url;

// Helper to transform product data (fix images, convert prices)
function transformProduct(p: any): Product {
    const product = {
        ...p,
        price: p.price ? parseFloat(p.price) : null,
        compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
        cost_price: p.cost_price ? parseFloat(p.cost_price) : null,
        discount_amount: p.discount_amount ? parseFloat(p.discount_amount) : null,
        main_image: fixUrl(p.main_image),
        // Transform Relations if present
        variants: Array.isArray(p.variants) ? p.variants.map(transformVariant) : [],
        images: Array.isArray(p.images) ? p.images.map(transformImage) : [],
        // Brand logo if loaded
        brand: p.brand ? { ...p.brand, logo: fixUrl(p.brand.logo) } : p.brand
    };

    // Ensure options values are parsed if they come as strings (sometimes API returns json-stringified columns)
    if (Array.isArray(product.options)) {
        product.options = product.options.map((opt: any) => ({
            ...opt,
            values: Array.isArray(opt.values) ? opt.values : (typeof opt.values === 'string' ? JSON.parse(opt.values) : opt.values)
        }));
    }

    return product;
}

function transformVariant(v: any): any {
    return {
        ...v,
        price: v.price ? parseFloat(v.price) : null,
        compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
        cost_price: v.cost_price ? parseFloat(v.cost_price) : null,
        image_path: fixUrl(v.image_path)
    };
}

function transformImage(img: any): any {
    return {
        ...img,
        path: fixUrl(img.path)
    };
}

export const api = {
    // --- Auth ---
    async register(data: { name: string; email: string; password: string; password_confirmation: string }) {
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse<{ message: string; access_token: string; user: User }>(res);
    },

    async login(data: { email: string; password: string }) {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse<{ message: string; access_token: string; user: User }>(res);
    },

    async logout() {
        if (!apiToken) return;
        const res = await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse<{ message: string }>(res);
    },

    async getMe() {
        const res = await fetch(`${BASE_URL}/me`, {
            headers: getHeaders()
        });
        return handleResponse<User>(res);
    },



    async getProduct(id: number | string): Promise<Product> {
        try {
            // 1. Fetch Main Product
            const productRes = await fetch(`${BASE_URL}/products/${id}`);
            const product = await handleResponse<any>(productRes);

            // 2. Conditionally Fetch details if missing from main response
            const fetches: Promise<Response>[] = [];
            const keys: string[] = [];

            // If variants missing, fetch them
            if (!product.variants || !Array.isArray(product.variants)) {
                fetches.push(fetch(`${BASE_URL}/products/${id}/variants`));
                keys.push('variants');
            }
            // If options missing, fetch them (The main API example lacked options)
            if (!product.options || !Array.isArray(product.options)) {
                fetches.push(fetch(`${BASE_URL}/products/${id}/options`));
                keys.push('options');
            }
            // If images missing or empty (Example showed empty images array, might need fetch)
            if (!product.images || product.images.length === 0) {
                fetches.push(fetch(`${BASE_URL}/products/${id}/images`));
                keys.push('images');
            }

            if (fetches.length > 0) {
                const results = await Promise.allSettled(fetches);
                for (let i = 0; i < results.length; i++) {
                    const res = results[i];
                    if (res.status === 'fulfilled' && res.value.ok) {
                        try {
                            const data = await handleResponse<any>(res.value);
                            const list = Array.isArray(data) ? data : (data.data || []);
                            product[keys[i]] = list;
                        } catch (e) {
                            console.warn(`Failed to load ${keys[i]} for product ${id}`, e);
                        }
                    }
                }
            }

            return transformProduct(product);
        } catch (err) {
            console.error(`Error fetching product ${id}:`, err);
            if (IS_DEV) {
                const mock = MOCK_PRODUCTS.find(p => p.id.toString() === id.toString());
                if (mock) return mock;
            }
            throw err;
        }
    },

    async getRelatedProducts(productId: number | string): Promise<Product[]> {
        try {
            // 1. Try Dedicated Related Products Endpoint
            const res = await fetch(`${BASE_URL}/products/${productId}/related`);
            if (res.status === 200) {
                const responseData = await handleResponse<any>(res);
                const related = Array.isArray(responseData) ? responseData : (responseData.data || []);
                if (related.length > 0) return related.map(transformProduct);
            }

            // 2. Fallback: Fetch products from the same category to ensure section isn't empty
            const product = await this.getProduct(productId);
            if (product.category_id) {
                const results = await this.getProducts({
                    category_id: product.category_id,
                    limit: 6
                });
                // Exclude current product
                return results.filter(p => p.id.toString() !== productId.toString());
            }

            return [];
        } catch (err) {
            console.warn(`Error fetching related products for ${productId}:`, err);
            return [];
        }
    },

    async getProductReviews(productId: number | string): Promise<ProductReview[]> {
        try {
            const res = await fetch(`${BASE_URL}/products/${productId}/reviews`);
            if (res.status === 404) return [];
            const responseData = await handleResponse<any>(res);
            // Handle both raw array and { data: [...] }
            return Array.isArray(responseData) ? responseData : (responseData.data || []);
        } catch (err) {
            console.warn(`Error fetching reviews for ${productId} (using fallback):`, err);
            if (IS_DEV) {
                // Return dummy reviews if API fails
                return [
                    { id: 1, product_id: Number(productId), user_id: 101, rating: 5, review: 'Absolutely love this! The quality is outstanding.', created_at: '2 days ago' },
                    { id: 2, product_id: Number(productId), user_id: 102, rating: 4, review: 'Great value for money. Fits perfectly.', created_at: '1 week ago' }
                ] as ProductReview[];
            }
            return [];
        }
    },

    // --- Content ---
    async getCarouselSlides(): Promise<CarouselSlide[]> {
        const res = await fetch(`${BASE_URL}/carousel`);
        const slides = await handleResponse<CarouselSlide[]>(res);

        // Transform image URLs
        return slides.map(slide => ({
            ...slide,
            image_desktop: slide.image_desktop?.startsWith('http')
                ? slide.image_desktop
                : `https://sadekabdelsater.com/storage/${slide.image_desktop}`,
            image_mobile: slide.image_mobile?.startsWith('http')
                ? slide.image_mobile
                : `https://sadekabdelsater.com/storage/${slide.image_mobile}`
        }));
    },

    // --- Categories ---
    async getCategories(): Promise<Category[]> {
        try {
            const res = await fetch(`${BASE_URL}/categories`);
            const responseData = await handleResponse<any>(res);
            const categories: Category[] = Array.isArray(responseData) ? responseData : (responseData.data || []);

            const transformCat = (c: Category): Category => ({
                ...c,
                thumbnail: fixUrl(c.thumbnail),
                sub_categories: Array.isArray(c.sub_categories) ? c.sub_categories.map(transformCat) : undefined,
                sub_sub_categories: Array.isArray(c.sub_sub_categories) ? c.sub_sub_categories.map(transformCat) : undefined
            });

            return categories.map(transformCat);
        } catch (err) {
            console.error('Error fetching categories:', err);
            if (IS_DEV) return MOCK_CATEGORIES as any;
            throw err;
        }
    },

    // --- Highlight Sections ---
    async getHighlightSections(): Promise<HighlightSection[]> {
        try {
            // if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
            const res = await fetch(`${BASE_URL}/highlights`);
            const highlights = await handleResponse<HighlightSection[]>(res);
            return highlights.map(h => ({
                ...h,
                image: h.image?.startsWith('http') ? h.image : `https://sadekabdelsater.com/storage/${h.image}`
            }));
        } catch (err) {
            console.error('Error fetching highlights:', err);
            if (IS_DEV) return MOCK_HIGHLIGHTS as any;
            throw err;
        }
    },

    // --- Brands ---
    async getBrands(): Promise<Brand[]> {
        try {
            const res = await fetch(`${BASE_URL}/brands`);
            if (res.status === 404) return [];
            const brands = await handleResponse<Brand[]>(res);
            return brands.map(b => ({
                ...b,
                logo: fixUrl(b.logo)
            }));
        } catch (err) {
            console.warn('Error fetching brands (using fallback):');
            if (IS_DEV) return MOCK_BRANDS as any;
            return [];
        }
    },

    // --- Banners ---
    async getBanners(): Promise<Banner[]> {
        try {
            // if (IS_PLACEHOLDER) throw new Error('Using placeholder data');
            const res = await fetch(`${BASE_URL}/banners`);
            const banners = await handleResponse<Banner[]>(res);
            return banners.map(b => ({
                ...b,
                image: b.image?.startsWith('http') ? b.image : `https://sadekabdelsater.com/storage/${b.image}`,
                image_mobile: b.image_mobile?.startsWith('http') ? b.image_mobile : `https://sadekabdelsater.com/storage/${b.image_mobile}`
            }));
        } catch (err) {
            console.error('Error fetching banners:', err);
            if (IS_DEV) return MOCK_BANNERS as any;
            throw err;
        }
    },

    // --- CMS Features ---
    async getCMSFeatures(): Promise<CMSFeature[]> {
        try {
            const res = await fetch(`${BASE_URL}/features`);
            if (res.status === 404) return [];
            const features = await handleResponse<CMSFeature[]>(res);
            return features.map(f => ({
                ...f,
                image: fixUrl(f.image),
                // Icons might be library names (like 'truck') or URLs. if it has a dot, it's likely a URL
                icon: (f.icon && f.icon.includes('.')) ? fixUrl(f.icon)! : f.icon
            }));
        } catch (err) {
            console.warn('Error fetching features (using fallback):');
            if (IS_DEV) return MOCK_FEATURES as any;
            return [];
        }
    },

    // --- Products ---
    async getProducts(params: { category_id?: number, brand_id?: number, category_ids?: number[], brand_ids?: number[], search?: string, limit?: number } = {}): Promise<Product[]> {
        try {
            const url = new URL(`${BASE_URL}/products`);
            if (params.category_id) url.searchParams.append('category_id', params.category_id.toString());
            if (params.brand_id) url.searchParams.append('brand_id', params.brand_id.toString());

            if (params.category_ids?.length) {
                params.category_ids.forEach(id => url.searchParams.append('category_ids[]', id.toString()));
            }
            if (params.brand_ids?.length) {
                params.brand_ids.forEach(id => url.searchParams.append('brand_ids[]', id.toString()));
            }

            if (params.search) url.searchParams.append('search', params.search);
            if (params.limit) url.searchParams.append('limit', params.limit.toString());

            const res = await fetch(url.toString(), {
                headers: getHeaders()
            });
            const responseData = await handleResponse<any>(res);
            // Products endpoint also usually wraps in { data: [] }
            const products = Array.isArray(responseData) ? responseData : (responseData.data || []);
            return products.map(transformProduct);
        } catch (err) {
            console.error('Error fetching products:', err);
            if (IS_DEV) {
                let filtered = [...MOCK_PRODUCTS];
                // Mock filtering logic...
                if (params?.category_id) filtered = filtered.filter(p => p.category_id === params.category_id);
                if (params?.brand_id) filtered = filtered.filter(p => p.brand_id === params.brand_id);
                if (params?.category_ids?.length) filtered = filtered.filter(p => p.category_id && params.category_ids?.includes(p.category_id));
                if (params?.brand_ids?.length) filtered = filtered.filter(p => p.brand_id && params.brand_ids?.includes(p.brand_id));
                if (params?.search) filtered = filtered.filter(p => p.name.toLowerCase().includes(params.search!.toLowerCase()));
                if (params?.limit) filtered = filtered.slice(0, params.limit);
                return filtered;
            }
            return [];
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

    async toggleWishlist(productId: number) {
        const res = await fetch(`${BASE_URL}/wishlist/toggle`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ product_id: productId })
        });
        return handleResponse(res);
    },

    // --- Checkout ---
    async createOrder(orderData: any): Promise<Order> {
        const res = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return handleResponse<Order>(res);
    },

    async validateCoupon(code: string): Promise<Coupon> {
        if (IS_DEV) {
            // Mock validation
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Match mock code 'rrTest' from SQL
                    if (code === 'rrTest') {
                        resolve({
                            id: 1,
                            code: 'rrTest',
                            name: 'Test Coupon',
                            type: 'free_shipping', // from SQL
                            value: 0,
                            minimum_amount: 20,
                            is_active: true
                        });
                    } else if (code === 'TEST20') {
                        resolve({
                            id: 2,
                            code: 'TEST20',
                            name: '20% Off',
                            type: 'percentage',
                            value: 20,
                            is_active: true
                        });
                    } else {
                        reject(new Error('Invalid or expired coupon code'));
                    }
                }, 800);
            });
        }

        const res = await fetch(`${BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        return handleResponse<Coupon>(res);
    },

    // --- Loyalty ---
    async getLoyaltyInfo() {
        const res = await fetch(`${BASE_URL}/loyalty`, {
            headers: getHeaders()
        });
        return handleResponse<any>(res);
    },

    async getLoyaltyHistory() {
        const res = await fetch(`${BASE_URL}/loyalty/history`, {
            headers: getHeaders()
        });
        return handleResponse<any>(res);
    },

    async getLoyaltyRewards() {
        const res = await fetch(`${BASE_URL}/loyalty/rewards`, {
            headers: getHeaders()
        });
        return handleResponse<any>(res);
    },

    async redeemLoyaltyReward(rewardId: number) {
        const res = await fetch(`${BASE_URL}/loyalty/redeem/${rewardId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse<any>(res);
    },

    // --- Orders ---
    async getOrders(page: number = 1) {
        const res = await fetch(`${BASE_URL}/orders?page=${page}`, {
            headers: getHeaders()
        });
        return handleResponse<any>(res);
    },

    async getOrderDetails(orderId: number) {
        const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
            headers: getHeaders()
        });
        return handleResponse<any>(res);
    },

    // --- Addresses ---
    async getAddresses() {
        const res = await fetch(`${BASE_URL}/addresses`, {
            headers: getHeaders()
        });
        return handleResponse<any>(res);
    },

    async createAddress(data: any) {
        const res = await fetch(`${BASE_URL}/addresses`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse<any>(res);
    },

    async updateAddress(id: number, data: any) {
        const res = await fetch(`${BASE_URL}/addresses/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse<any>(res);
    },

    async deleteAddress(id: number) {
        const res = await fetch(`${BASE_URL}/addresses/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse<any>(res);
    },

    async updatePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }) {
        const res = await fetch(`${BASE_URL}/update-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse<any>(res);
    },

    // --- Orders ---
    async placeOrder(data: any) {
        console.log('=== PLACE ORDER DEBUG ===');
        console.log('Request URL:', `${BASE_URL}/checkout`);
        console.log('Request Data:', JSON.stringify(data, null, 2));
        console.log('========================');

        const res = await fetch(`${BASE_URL}/checkout`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse<any>(res);
    },

    // --- Config ---
    async getStoreSettings() {
        const res = await fetch(`${BASE_URL}/config/store-settings`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse<any>(res);
    },

    // --- Currencies ---
    async getCurrencies(): Promise<Currency[]> {
        const res = await fetch(`${BASE_URL}/currencies`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const response = await handleResponse<{ data: Currency[] }>(res);
        return response.data || [];
    },

    async getDefaultCurrency(): Promise<Currency | null> {
        try {
            const res = await fetch(`${BASE_URL}/currencies/default`, {
                method: 'GET',
                headers: getHeaders(),
            });
            const response = await handleResponse<{ data: Currency }>(res);
            return response.data || null;
        } catch (error) {
            console.warn('Error fetching default currency, using fallback:', error);
            // Fallback to USD if API fails
            return {
                id: 0,
                code: 'USD',
                name_en: 'US Dollar',
                name_ar: 'الدولار الأمريكي',
                symbol: '$',
                exchange_rate: 1,
                is_base: true,
                is_active: true,
                sort_order: 0,
            };
        }
    },

};
