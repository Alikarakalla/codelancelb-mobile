import { Currency } from '@/types/schema';

/**
 * Format a price with currency symbol and exchange rate
 * @param price - The price in base currency
 * @param currency - The currency object to use for formatting
 * @returns Formatted price string (e.g., "$10.00", "€8.50", "L.L.15,000")
 */
export function formatPrice(price: number | null | undefined, currency?: Currency | null): string {
    if (price === null || price === undefined) {
        return currency ? `${currency.symbol}0.00` : '$0.00';
    }

    if (!currency) {
        return `$${price.toFixed(2)}`;
    }

    // Apply exchange rate
    const convertedPrice = price * currency.exchange_rate;

    // Format with appropriate decimals (for currencies like LBP, we might not want decimals)
    const decimals = shouldUseDecimals(currency.code) ? 2 : 0;
    const formatted = convertedPrice.toFixed(decimals);

    // Add thousand separators for readability
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedWithCommas = parts.join('.');

    // Format: symbol + price (customize based on currency if needed)
    return `${currency.symbol}${formattedWithCommas}`;
}

/**
 * Determine if currency should use decimal places
 * Some currencies like JPY, KRW, LBP typically don't use decimals
 */
function shouldUseDecimals(currencyCode: string): boolean {
    const noDecimalCurrencies = ['JPY', 'KRW', 'LBP', 'VND', 'CLP', 'ISK'];
    return !noDecimalCurrencies.includes(currencyCode.toUpperCase());
}

/**
 * Parse a formatted price string back to number (useful for forms)
 * @param priceString - Formatted price string
 * @returns Number value
 */
export function parsePrice(priceString: string): number {
    // Remove currency symbols and commas
    const cleaned = priceString.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
}

/**
 * Format price range (e.g., for products with variants)
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @param currency - Currency object
 * @returns Formatted range string (e.g., "$10.00 - $25.00" or just "$15.00" if equal)
 */
export function formatPriceRange(
    minPrice: number | null | undefined,
    maxPrice: number | null | undefined,
    currency?: Currency | null
): string {
    if (minPrice === maxPrice || !maxPrice || minPrice === null || minPrice === undefined) {
        return formatPrice(minPrice || maxPrice, currency);
    }

    const formattedMin = formatPrice(minPrice, currency);
    const formattedMax = formatPrice(maxPrice, currency);

    return `${formattedMin} - ${formattedMax}`;
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Discount percentage (e.g., 25 for 25% off)
 */
export function calculateDiscountPercentage(
    originalPrice: number | null | undefined,
    discountedPrice: number | null | undefined
): number {
    if (!originalPrice || !discountedPrice || originalPrice <= discountedPrice) {
        return 0;
    }

    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(discount);
}
