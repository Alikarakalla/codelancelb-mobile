import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductOption, ProductVariant } from '@/types/schema';

interface ProductSelectorsProps {
    options?: ProductOption[];
    variants?: ProductVariant[];
}

export function ProductSelectors({ options = [], variants = [] }: ProductSelectorsProps) {
    // Find specific options
    const colorOption = options.find(o => o.name === 'Color');
    const sizeOption = options.find(o => o.name === 'Size');

    // Safe defaults if data is missing
    const allColors = colorOption?.values || [];
    const allSizes = sizeOption?.values || [];

    // Initialize state
    // Default to the first color/size that is available?
    // Let's just default to the first one in list for now, then effect will fix it.
    const [selectedColor, setSelectedColor] = React.useState(allColors[0] || '');
    const [selectedSize, setSelectedSize] = React.useState('');

    // --- LOGIC: Dependent Options ---
    // When selectedColor changes, what sizes are available?
    const availableSizes = React.useMemo(() => {
        if (!selectedColor) return allSizes;
        // Filter variants that match the selected color and have >= 1 stock
        const validVariants = variants.filter(v =>
            v.color === selectedColor &&
            v.stock_quantity > 0
        );
        // Extract the sizes from these variants
        const validSizes = validVariants.map(v => v.size).filter(Boolean);
        return allSizes.filter(size => validSizes.includes(size));
    }, [selectedColor, variants, allSizes]);

    // Ensure selectedSize is valid when availableSizes changes.
    // If current selectedSize is NOT in availableSizes, switch to the first available one.
    useEffect(() => {
        if (availableSizes.length > 0) {
            if (!selectedSize || !availableSizes.includes(selectedSize)) {
                setSelectedSize(availableSizes[0]);
            }
        } else {
            setSelectedSize(''); // No sizes available for this color
        }
    }, [availableSizes, selectedSize]);

    // Map color names to hex codes
    const getColorHex = (name: string) => {
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
                    <Text style={styles.heading}>
                        Color: <Text style={styles.value}>{selectedColor}</Text>
                    </Text>
                    <View style={styles.colorsRow}>
                        {allColors.map((colorName) => {
                            const isSelected = selectedColor === colorName;
                            const hex = getColorHex(colorName);
                            // Border for white
                            const isWhite = hex.toLowerCase() === '#ffffff';
                            return (
                                <Pressable
                                    key={colorName}
                                    onPress={() => setSelectedColor(colorName)}
                                    style={[
                                        styles.colorDot,
                                        { backgroundColor: hex },
                                        isSelected && styles.colorSelected,
                                        isWhite && styles.colorBorder
                                    ]}
                                >
                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark"
                                            size={16}
                                            color={isWhite ? '#000' : '#fff'}
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Sizes */}
            {allSizes.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sizeHeader}>
                        <Text style={styles.heading}>
                            Size: <Text style={styles.value}>{selectedSize}</Text>
                        </Text>
                        <Pressable>
                            <Text style={styles.sizeGuide}>Size Guide</Text>
                        </Pressable>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizesRow}>
                        {allSizes.map((s) => {
                            const isSelected = selectedSize === s;
                            const isAvailable = availableSizes.includes(s);
                            const isDisabled = !isAvailable;

                            return (
                                <Pressable
                                    key={s}
                                    onPress={() => !isDisabled && setSelectedSize(s)}
                                    style={[
                                        styles.sizeBox,
                                        isSelected && styles.sizeBoxSelected,
                                        isDisabled && styles.sizeBoxDisabled
                                    ]}
                                >
                                    <Text style={[
                                        styles.sizeText,
                                        isSelected && styles.sizeTextSelected,
                                        isDisabled && styles.sizeTextDisabled
                                    ]}>
                                        {s}
                                    </Text>
                                    {/* Optional: Add diagonal line for disabled? Or just gray out */}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                    {availableSizes.length === 0 && selectedColor && (
                        <Text style={styles.outOfStockText}>Out of stock in {selectedColor}</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 24,
        gap: 24,
    },
    section: {
        paddingHorizontal: 20,
        gap: 12,
    },
    heading: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },
    value: {
        fontWeight: '400',
        color: '#64748B',
    },
    colorsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    colorDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorBorder: {
        borderColor: '#E2E8F0', // faint border for white
    },
    colorSelected: {
        borderColor: '#1152d4', // active ring
    },
    sizeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sizeGuide: {
        color: '#1152d4',
        fontWeight: '600',
        fontSize: 14,
    },
    sizesRow: {
        gap: 12,
    },
    sizeBox: {
        width: 56,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sizeBoxSelected: {
        backgroundColor: '#0F172A',
        borderColor: '#0F172A',
    },
    sizeBoxDisabled: {
        backgroundColor: '#F8FAFC',
        borderColor: '#F1F5F9',
    },
    sizeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    sizeTextSelected: {
        color: '#fff',
    },
    sizeTextDisabled: {
        color: '#CBD5E1',
    },
    outOfStockText: {
        marginTop: 8,
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '500'
    }
});
