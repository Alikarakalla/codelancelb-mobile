import { Product, CartItem } from '@/types/schema';

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
    // --- Products ---
    async getProducts(): Promise<Product[]> {
        const res = await fetch(`${BASE_URL}/products`);
        return handleResponse<Product[]>(res);
    },

    async getProduct(id: number | string): Promise<Product> {
        const res = await fetch(`${BASE_URL}/products/${id}`);
        return handleResponse<Product>(res);
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
    }
};
