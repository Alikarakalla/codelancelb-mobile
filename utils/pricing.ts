import { Category, Product, ProductVariant } from '@/types/schema';

type DiscountType = 'fixed' | 'percent';
export type DiscountSource =
    | 'flash_sale'
    | 'sub_sub_category'
    | 'sub_category'
    | 'category'
    | 'variant'
    | 'product'
    | 'compare_at_price'
    | 'none';

interface DiscountCandidate {
    amount: number;
    type: DiscountType;
    startDate?: string | null;
    endDate?: string | null;
    targetParents: string[];
    source: Exclude<DiscountSource, 'compare_at_price' | 'none'>;
}

export interface ProductPricingResult {
    basePrice: number;
    finalPrice: number;
    originalPrice?: number;
    hasDiscount: boolean;
    discountValue: number;
    discountPercent: number;
    badgeText?: string;
    source: DiscountSource;
}

interface CalculateProductPricingOptions {
    selectedVariant?: ProductVariant | null;
    selectedVariantPrice?: number | null;
    now?: Date;
}

interface CalculateListingPricingOptions {
    selectedVariant?: ProductVariant | null;
    now?: Date;
}

interface ParentIds {
    categoryId?: number;
    subCategoryId?: number;
    subSubCategoryId?: number;
}

function parseNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}

function normalizeDiscountType(type: unknown): DiscountType | null {
    if (typeof type !== 'string') return null;
    const normalized = type.toLowerCase();
    if (normalized === 'percent' || normalized === 'percentage') return 'percent';
    if (normalized === 'fixed') return 'fixed';
    return null;
}

function parseTargets(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map(v => String(v).trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map(v => String(v).trim()).filter(Boolean);
                }
            } catch {
                return trimmed.split(',').map(v => v.trim()).filter(Boolean);
            }
        }
        return trimmed.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
}

function parseDate(value: unknown): Date | null {
    if (!value || typeof value !== 'string') return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isDateWindowValid(now: Date, startDate?: string | null, endDate?: string | null): boolean {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (startDate && !start) return false;
    if (endDate && !end) return false;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
}

function resolveSubCategory(product: Product): Category | undefined {
    return product.subCategory || product.sub_category;
}

function resolveSubSubCategory(product: Product): Category | undefined {
    if (product.subSubCategory || product.sub_sub_category) {
        return product.subSubCategory || product.sub_sub_category;
    }
    if (Array.isArray(product.subSubCategories) && product.subSubCategories.length > 0) {
        return product.subSubCategories[0];
    }
    if (Array.isArray(product.sub_sub_categories) && product.sub_sub_categories.length > 0) {
        return product.sub_sub_categories[0];
    }
    return undefined;
}

function buildParentIds(product: Product): ParentIds {
    return {
        categoryId: product.category_id ?? product.category?.id ?? undefined,
        subCategoryId: product.sub_category_id ?? resolveSubCategory(product)?.id ?? undefined,
        subSubCategoryId: product.sub_sub_category_id ?? resolveSubSubCategory(product)?.id ?? undefined,
    };
}

function buildParentTokenSet(parentIds: ParentIds): Set<string> {
    const tokens = new Set<string>();

    const addIdTokens = (id: number, prefixes: string[]) => {
        tokens.add(String(id));
        prefixes.forEach(prefix => tokens.add(`${prefix}_${id}`));
    };

    if (parentIds.categoryId !== undefined) addIdTokens(parentIds.categoryId, ['cat', 'category']);
    if (parentIds.subCategoryId !== undefined) addIdTokens(parentIds.subCategoryId, ['sub', 'subcat', 'sub_category']);
    if (parentIds.subSubCategoryId !== undefined) addIdTokens(parentIds.subSubCategoryId, ['subsub', 'sub_sub', 'sub_sub_category']);

    return tokens;
}

function targetMatchesHierarchy(target: string, parentIds: ParentIds, parentTokens: Set<string>): boolean {
    const normalized = target.trim().toLowerCase();
    if (!normalized) return true;
    if (parentTokens.has(normalized)) return true;

    if (/^\d+$/.test(normalized)) {
        const id = Number(normalized);
        return [parentIds.categoryId, parentIds.subCategoryId, parentIds.subSubCategoryId].includes(id);
    }

    const match = normalized.match(/^(cat|category|sub|subcat|subcategory|sub_category|subsub|sub_sub|subsubcategory|sub_sub_category)[_:-]?(\d+)$/);
    if (!match) return false;

    const prefix = match[1];
    const id = Number(match[2]);
    if (prefix === 'cat' || prefix === 'category') return parentIds.categoryId === id;
    if (prefix === 'sub' || prefix === 'subcat' || prefix === 'subcategory' || prefix === 'sub_category') return parentIds.subCategoryId === id;
    return parentIds.subSubCategoryId === id;
}

function matchesTargetParents(targets: string[], parentIds: ParentIds, parentTokens: Set<string>): boolean {
    if (!targets.length) return true;
    return targets.every(target => targetMatchesHierarchy(target, parentIds, parentTokens));
}

function extractDiscountCandidate(
    entity: any,
    source: Exclude<DiscountSource, 'compare_at_price' | 'none'>
): DiscountCandidate | null {
    if (!entity || typeof entity !== 'object') return null;

    const amount = parseNumber(entity.discount_amount);
    const type = normalizeDiscountType(entity.discount_type);
    if (!amount || amount <= 0 || !type) return null;

    return {
        amount,
        type,
        startDate: entity.discount_start_date ?? entity.start_date ?? entity.starts_at ?? null,
        endDate: entity.discount_end_date ?? entity.end_date ?? entity.ends_at ?? null,
        targetParents: parseTargets(entity.discount_target_parents ?? entity.target_parents),
        source,
    };
}

function extractFlashSaleCandidate(product: Product, basePrice: number): DiscountCandidate | null {
    const flashSale = product.flash_sale as any;
    if (flashSale && typeof flashSale === 'object') {
        const isExplicitlyInactive =
            flashSale.is_active === false ||
            flashSale.active === false ||
            String(flashSale.status || '').toLowerCase() === 'inactive';
        if (isExplicitlyInactive) return null;

        const salePrice = parseNumber(flashSale.sale_price ?? flashSale.price);
        if (salePrice !== null && salePrice < basePrice) {
            return {
                amount: basePrice - salePrice,
                type: 'fixed',
                startDate: flashSale.discount_start_date ?? flashSale.start_date ?? flashSale.starts_at ?? null,
                endDate: flashSale.discount_end_date ?? flashSale.end_date ?? flashSale.ends_at ?? null,
                targetParents: parseTargets(flashSale.discount_target_parents ?? flashSale.target_parents),
                source: 'flash_sale',
            };
        }

        const fromFlash = extractDiscountCandidate(flashSale, 'flash_sale');
        if (fromFlash) return fromFlash;
    }

    const topLevelSalePrice = parseNumber(product.flash_sale_price);
    if (topLevelSalePrice !== null && topLevelSalePrice < basePrice) {
        return {
            amount: basePrice - topLevelSalePrice,
            type: 'fixed',
            startDate: product.flash_sale_start_date ?? null,
            endDate: product.flash_sale_end_date ?? null,
            targetParents: [],
            source: 'flash_sale',
        };
    }

    const topLevelAmount = parseNumber(product.flash_sale_discount_amount);
    const topLevelType = normalizeDiscountType(product.flash_sale_discount_type);
    if (topLevelAmount && topLevelAmount > 0 && topLevelType) {
        return {
            amount: topLevelAmount,
            type: topLevelType,
            startDate: product.flash_sale_start_date ?? null,
            endDate: product.flash_sale_end_date ?? null,
            targetParents: [],
            source: 'flash_sale',
        };
    }

    return null;
}

function applyDiscount(basePrice: number, amount: number, type: DiscountType) {
    const discountValue = type === 'percent' ? basePrice * (amount / 100) : amount;
    const finalPrice = Math.max(basePrice - discountValue, 0);
    const appliedDiscount = Math.max(basePrice - finalPrice, 0);
    const percent = basePrice > 0 ? Math.round((appliedDiscount / basePrice) * 100) : 0;

    return { finalPrice, discountValue: appliedDiscount, percent };
}

export function calculateProductPricing(
    product: Product | null | undefined,
    options: CalculateProductPricingOptions = {}
): ProductPricingResult {
    if (!product) {
        return {
            basePrice: 0,
            finalPrice: 0,
            hasDiscount: false,
            discountValue: 0,
            discountPercent: 0,
            source: 'none',
        };
    }

    const selectedVariant = options.selectedVariant || null;
    const now = options.now || new Date();

    const basePrice = Math.max(
        parseNumber(options.selectedVariantPrice) ??
        parseNumber(selectedVariant?.price) ??
        parseNumber(product.price) ??
        0,
        0
    );

    const parentIds = buildParentIds(product);
    const parentTokens = buildParentTokenSet(parentIds);

    const candidateOrder: Array<DiscountCandidate | null> = [
        extractFlashSaleCandidate(product, basePrice),
        extractDiscountCandidate(resolveSubSubCategory(product), 'sub_sub_category'),
        extractDiscountCandidate(resolveSubCategory(product), 'sub_category'),
        extractDiscountCandidate(product.category, 'category'),
        selectedVariant ? extractDiscountCandidate(selectedVariant, 'variant') : null,
        extractDiscountCandidate(product, 'product'),
    ];

    for (const candidate of candidateOrder) {
        if (!candidate) continue;
        if (!isDateWindowValid(now, candidate.startDate, candidate.endDate)) continue;
        if (!matchesTargetParents(candidate.targetParents, parentIds, parentTokens)) continue;

        const applied = applyDiscount(basePrice, candidate.amount, candidate.type);
        if (applied.discountValue <= 0) continue;

        return {
            basePrice,
            finalPrice: applied.finalPrice,
            originalPrice: basePrice,
            hasDiscount: true,
            discountValue: applied.discountValue,
            discountPercent: applied.percent,
            badgeText: applied.percent > 0 ? `-${applied.percent}%` : undefined,
            source: candidate.source,
        };
    }

    const compareAtPrice =
        parseNumber(selectedVariant?.compare_at_price) ??
        parseNumber(product.compare_at_price);

    if (compareAtPrice && compareAtPrice > basePrice) {
        const discountValue = compareAtPrice - basePrice;
        const discountPercent = Math.round((discountValue / compareAtPrice) * 100);
        return {
            basePrice,
            finalPrice: basePrice,
            originalPrice: compareAtPrice,
            hasDiscount: true,
            discountValue,
            discountPercent,
            badgeText: discountPercent > 0 ? `-${discountPercent}%` : undefined,
            source: 'compare_at_price',
        };
    }

    return {
        basePrice,
        finalPrice: basePrice,
        hasDiscount: false,
        discountValue: 0,
        discountPercent: 0,
        source: 'none',
    };
}

/**
 * Listing-safe resolver:
 * 1) Always applies hierarchical priority first.
 * 2) If no discount from hierarchy/product, falls back to best discounted variant for cards.
 */
export function calculateProductListingPricing(
    product: Product | null | undefined,
    options: CalculateListingPricingOptions = {}
): ProductPricingResult {
    const base = calculateProductPricing(product, {
        selectedVariant: options.selectedVariant,
        now: options.now,
    });

    // If user selected a specific variant, or hierarchy/product already produced a discount, keep it.
    if (options.selectedVariant || !product || base.hasDiscount) {
        return base;
    }

    if (!product.variants?.length) {
        return base;
    }

    let best = base;
    product.variants.forEach((variant) => {
        const variantPricing = calculateProductPricing(product, {
            selectedVariant: variant,
            now: options.now,
        });
        if (!variantPricing.hasDiscount) return;
        if (!best.hasDiscount || variantPricing.discountValue > best.discountValue) {
            best = variantPricing;
        }
    });

    return best;
}
