import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductOption, ProductVariant } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProductSelectorsProps {
    options?: ProductOption[];
    variants?: ProductVariant[];
    onVariantChange?: (variant: ProductVariant | null) => void;
}

export function ProductSelectors({ options = [], variants = [], onVariantChange }: ProductSelectorsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Find options dynamically
    const colorOption = options.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');
    const sizeOption = options.find(o => o.name.toLowerCase() === 'size' || o.name.toLowerCase() === 'shade'); // Added 'shade' just in case

    // Fallback: If no explicit size/color, pick the first non-color option as "secondary"
    const otherOption = !sizeOption ? options.find(o => o.name.toLowerCase() !== 'color') : sizeOption;

    // Defaults
    const allColors = colorOption?.values || [];
    const allOtherValues = otherOption?.values || [];

    // State
    const [selectedColor, setSelectedColor] = React.useState('');
    const [selectedOther, setSelectedOther] = React.useState('');

    // Pre-select defaults
    useEffect(() => {
        if (allColors.length > 0 && !selectedColor) setSelectedColor(allColors[0]);
        if (allOtherValues.length > 0 && !selectedOther) setSelectedOther(allOtherValues[0]);
    }, [allColors, allOtherValues]);

    // --- AVAILABILITY LOGIC ---
    // 1. Available Colors (if Size selected) - usually we pick color first, so keep all colors enabled or check stock

    // 2. Available Sizes (depend on Color if Color exists)
    const availableOtherValues = React.useMemo(() => {
        if (!otherOption) return [];

        // If we have Color, filter by it
        if (colorOption && selectedColor) {
            const validVariants = variants.filter(v =>
                v.color === selectedColor &&
                v.stock_quantity > 0
            );
            // In user data context: variant.size holds the value for the second option
            const validValues = validVariants.map(v => v.size).filter(Boolean);
            return allOtherValues.filter(val => validValues.includes(val));
        }

        // If NO Color option (e.g. Foundation only has Size/Shade), check generic stock
        // The variants list has `size` property corresponding to this option
        const validVariants = variants.filter(v => v.stock_quantity > 0);
        const validValues = validVariants.map(v => v.size).filter(Boolean);
        return allOtherValues.filter(val => validValues.includes(val));

    }, [colorOption, selectedColor, otherOption, variants, allOtherValues]);


    // Notify parent
    useEffect(() => {
        if (variants.length === 0) return;

        let found: ProductVariant | undefined;

        if (colorOption && otherOption) {
            // Both exist
            if (selectedColor && selectedOther) {
                found = variants.find(v => v.color === selectedColor && v.size === selectedOther);
            }
        } else if (colorOption && !otherOption) {
            // Only Color
            if (selectedColor) found = variants.find(v => v.color === selectedColor);
        } else if (!colorOption && otherOption) {
            // Only Size (Foundation case)
            if (selectedOther) found = variants.find(v => v.size === selectedOther);
        }

        onVariantChange?.(found || null);
    }, [selectedColor, selectedOther, variants, colorOption, otherOption]);


    // Helper for Hex
    const getColorHex = (name: string) => {
        const variantWithColor = variants.find(v => v.color === name);
        if (variantWithColor?.option_values?.color?.code) {
            return variantWithColor.option_values.color.code;
        }
        const map: Record<string, string> = {
            'Black': '#111827', 'White': '#ffffff', 'Red': '#ef4444',
            'Blue': '#3b82f6', 'Navy': '#1e3a8a', 'Beige': '#d6cbb6'
        };
        return map[name] || '#ccc';
    };

    return (
        <View style={styles.container}>
            {/* COLOR SELECTOR */}
            {allColors.length > 0 && (
                <View style={styles.section}>
                    <Text style={[styles.heading, isDark && { color: '#fff' }]}>Select Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsRow}>
                        {allColors.map((colorName) => {
                            const isSelected = selectedColor === colorName;
                            const hex = getColorHex(colorName);
                            const isWhite = hex.toLowerCase() === '#ffffff';
                            return (
                                <Pressable
                                    key={colorName}
                                    onPress={() => setSelectedColor(colorName)}
                                    style={[
                                        styles.colorPill,
                                        isDark && { backgroundColor: '#111', borderColor: '#333' },
                                        isSelected && { borderColor: isDark ? '#fff' : hex, borderWidth: 1.5 },
                                    ]}
                                >
                                    <View style={[
                                        styles.innerDot,
                                        { backgroundColor: hex },
                                        (isWhite || isDark) && styles.dotBorder
                                    ]} />
                                    <Text style={[
                                        styles.colorName,
                                        isDark && { color: '#fff' },
                                        isSelected && styles.colorNameSelectedBold
                                    ]}>
                                        {colorName}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* OTHER OPTION SELECTOR (Size/Shade) */}
            {allOtherValues.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sizeHeader}>
                        <Text style={[styles.heading, isDark && { color: '#fff' }]}>Select {otherOption?.name || 'Option'}</Text>
                    </View>

                    <View style={styles.sizesRow}>
                        {allOtherValues.map((val) => {
                            const isSelected = selectedOther === val;
                            const isAvailable = availableOtherValues.includes(val);
                            const isDisabled = !isAvailable;

                            // For Foundation shades, we might want purely text chips, or wider ones.
                            // keeping "sizeBox" style but maybe allow auto width? 
                            // existing sizeBox is fixed width 64. Might be too small for "110 Porcelain".
                            // Let's modify style to be flexible width.

                            return (
                                <Pressable
                                    key={val}
                                    onPress={() => !isDisabled && setSelectedOther(val)}
                                    style={[
                                        styles.sizeBox,
                                        { width: 'auto', paddingHorizontal: 12, minWidth: 64 }, // Flexible width
                                        isDark && { backgroundColor: '#111', borderColor: '#333' },
                                        isSelected && styles.sizeBoxSelected,
                                        isSelected && isDark && { borderColor: '#fff' },
                                        isDisabled && styles.sizeBoxDisabled,
                                        isDisabled && isDark && { backgroundColor: '#222', borderColor: '#333' }
                                    ]}
                                >
                                    <Text style={[
                                        styles.sizeText,
                                        isDark && { color: '#94A3B8' },
                                        isSelected && styles.sizeTextSelected,
                                        isSelected && isDark && { color: '#fff' },
                                        isDisabled && styles.sizeTextDisabled
                                    ]}>
                                        {val}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    {availableOtherValues.length === 0 && selectedColor && colorOption && (
                        <Text style={styles.outOfStockText}>Out of stock in {selectedColor}</Text>
                    )}
                </View>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        gap: 24,
    },
    section: {
        paddingHorizontal: 20,
        gap: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        letterSpacing: -0.2,
    },
    colorsRow: {
        gap: 12,
        paddingRight: 20,
    },
    colorPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
        gap: 10,
    },
    innerDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    dotBorder: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    colorName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1F2937',
    },
    colorNameSelectedBold: {
        fontWeight: '700',
    },
    sizeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sizesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    sizeBox: {
        width: 64,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    sizeBoxSelected: {
        borderColor: '#000',
        borderWidth: 2,
    },
    sizeBoxDisabled: {
        backgroundColor: '#F9FAFB',
        borderColor: '#F3F4F6',
        opacity: 0.5,
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    sizeTextSelected: {
        fontWeight: '800',
        color: '#000',
    },
    sizeTextDisabled: {
        color: '#94A3B8',
        textDecorationLine: 'line-through',
    },
    outOfStockText: {
        marginTop: 4,
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '500'
    }
});
