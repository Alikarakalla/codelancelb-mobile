// Helper function to get hex color from color name
export function getColorHex(colorName: string | null | undefined): string {
    if (!colorName) return '#94A3B8'; // Default gray if no color name provided

    const colorMap: Record<string, string> = {
        'white': '#FFFFFF',
        'black': '#000000',
        'blue': '#2563EB',
        'red': '#EF4444',
        'beige': '#F5F5DC',
        'green': '#16A34A',
        'yellow': '#EAB308',
        'purple': '#9333EA',
        'pink': '#EC4899',
        'orange': '#F97316',
        'gray': '#6B7280',
        'grey': '#6B7280',
        'brown': '#92400E',
        'navy': '#1E3A8A',
        'gold': '#D4AF37',
        'silver': '#C0C0C0',
        'bronze': '#CD7F32',
    };
    return colorMap[colorName.toLowerCase()] || '#94A3B8'; // Default gray
}

export interface ColorOption {
    name: string;
    hex: string;
}

/**
 * Parse color value from database - handles both string and object formats
 */
export function parseColorValue(colorValue: any): ColorOption | null {
    if (!colorValue) return null;

    try {
        // If it's a string, try to parse as JSON first
        if (typeof colorValue === 'string') {
            try {
                const parsed = JSON.parse(colorValue);
                if (parsed.name && parsed.hex) {
                    return { name: parsed.name, hex: parsed.hex };
                }
            } catch {
                // Not JSON, treat as color name
                return { name: colorValue, hex: getColorHex(colorValue) };
            }
        }

        // If it's already an object
        if (typeof colorValue === 'object' && colorValue.name) {
            return {
                name: colorValue.name,
                hex: colorValue.hex || getColorHex(colorValue.name)
            };
        }

        return null;
    } catch {
        return null;
    }
}
