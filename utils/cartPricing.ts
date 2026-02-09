import { CartItem } from '@/types/schema';
import { calculateProductPricing } from '@/utils/pricing';

export interface CartItemPricingResult {
    unitPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    hasDiscount: boolean;
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

export function resolveCartItemVariant(item: CartItem) {
    const variants = item.product?.variants;
    if (!variants || variants.length === 0) return null;

    if (item.variant_id != null) {
        const byId = variants.find(v => v.id === item.variant_id);
        if (byId) return byId;
    }

    if (item.variant_key) {
        const bySlug = variants.find(v => v.slug === item.variant_key);
        if (bySlug) return bySlug;
    }

    return null;
}

export function getCartItemPricing(item: CartItem): CartItemPricingResult {
    if (!item.product) {
        const fallbackPrice = round2(Number(item.price) || 0);
        return {
            unitPrice: fallbackPrice,
            hasDiscount: false,
        };
    }

    const selectedVariant = resolveCartItemVariant(item);
    const pricing = calculateProductPricing(item.product, { selectedVariant });
    const unitPrice = round2(pricing.finalPrice);
    const originalPrice = pricing.originalPrice != null ? round2(pricing.originalPrice) : undefined;

    return {
        unitPrice,
        originalPrice,
        discountPercent: pricing.discountPercent > 0 ? pricing.discountPercent : undefined,
        hasDiscount: pricing.hasDiscount,
    };
}

