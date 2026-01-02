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
    const colorOption = options.find(o => o.name.toLowerCase() === 'color');
    const secondOption = options.find(o => o.name.toLowerCase() !== 'color');

    // Safe defaults if data is missing
    const allColors = colorOption?.values || [];
    const allSecondOptionValues = secondOption?.values || [];

    // Initialize state
    const [selectedColor, setSelectedColor] = React.useState(allColors[0] || '');
    const [selectedSecond, setSelectedSecond] = React.useState('');

    // --- LOGIC: Dependent Options ---
    // Filter variants that match the selected color
    const availableSecondValues = React.useMemo(() => {
        if (!selectedColor) return allSecondOptionValues;

        // Match color column in variants
        const validVariants = variants.filter(v =>
            v.color === selectedColor &&
            v.stock_quantity > 0
        );

        // Extract second option values (stored in 'size' column if color is first)
        const validValues = validVariants.map(v => v.size).filter(Boolean);
        return allSecondOptionValues.filter(val => validValues.includes(val));
    }, [selectedColor, variants, allSecondOptionValues]);

    // Update selectedSecond when availableSecondValues changes
    useEffect(() => {
        if (availableSecondValues.length > 0) {
            if (!selectedSecond || !availableSecondValues.includes(selectedSecond)) {
                setSelectedSecond(availableSecondValues[0]);
            }
        } else {
            setSelectedSecond('');
        }
    }, [availableSecondValues, selectedSecond]);

    // Notify parent of variant change
    useEffect(() => {
        if (selectedColor) {
            // Find variant matching color and (if exists) the second option
            const variant = variants.find(v =>
                v.color === selectedColor &&
                (!secondOption || v.size === selectedSecond)
            ) || null;
            onVariantChange?.(variant);
        } else {
            onVariantChange?.(null);
        }
    }, [selectedColor, selectedSecond, variants, onVariantChange, secondOption]);

    // Map color names to hex codes dynamically from variants if possible
    const getColorHex = (name: string) => {
        // Try to find the hex code in variant option_values
        const variantWithColor = variants.find(v => v.color === name);
        if (variantWithColor?.option_values?.color?.code) {
            return variantWithColor.option_values.color.code;
        }

        const map: Record<string, string> = {
            'Black': '#111827',
            'White': '#ffffff',
            'Red': '#ef4444',
            'Blue': '#3b82f6',
            'Navy': '#1e3a8a',
            'Beige': '#d6cbb6'
        };
        return map[name] || '#ccc';
    };

    return (
        <View style={styles.container}>
            {/* Colors */}
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

            {/* Secondary Option (Size, Hardware, etc.) */}
            {allSecondOptionValues.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sizeHeader}>
                        <Text style={[styles.heading, isDark && { color: '#fff' }]}>Select {secondOption?.name || 'Option'}</Text>
                    </View>

                    <View style={styles.sizesRow}>
                        {allSecondOptionValues.map((val) => {
                            const isSelected = selectedSecond === val;
                            const isAvailable = availableSecondValues.includes(val);
                            const isDisabled = !isAvailable;

                            return (
                                <Pressable
                                    key={val}
                                    onPress={() => !isDisabled && setSelectedSecond(val)}
                                    style={[
                                        styles.sizeBox,
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
                    {availableSecondValues.length === 0 && selectedColor && (
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
