import React, { useEffect, useMemo } from 'react';
import { Alert, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { DynamicProductOption, VariantMatrixEntry, ProductOptionValue } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColorHex } from '@/utils/colorHelpers';

interface ProductSelectorsProps {
    productOptions?: DynamicProductOption[];
    variantMatrix?: Record<string, VariantMatrixEntry>;
    onVariantChange?: (variantId: number | null, variantData: VariantMatrixEntry | null) => void;
    onSelectionsChange?: (selections: Record<string, string>) => void;
}

export function ProductSelectors({
    productOptions = [],
    variantMatrix = {},
    onVariantChange,
    onSelectionsChange,
}: ProductSelectorsProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // State: Store selected value for each option
    const [selections, setSelections] = React.useState<Record<string, string>>({});

    // Pre-select first value for each option ONLY if selections are empty
    useEffect(() => {
        if (productOptions.length > 0 && Object.keys(selections).length === 0) {
            const initialSelections: Record<string, string> = {};
            productOptions.forEach(option => {
                if (option.values.length > 0) {
                    const firstValue = option.values[0];
                    initialSelections[option.name] = typeof firstValue === 'string'
                        ? firstValue
                        : firstValue.value;
                }
            });
            setSelections(initialSelections);
        }
    }, [productOptions]);

    // Build variant matrix key from current selections
    const buildMatrixKey = (currentSelections: Record<string, string>) => {
        return productOptions
            .map(opt => currentSelections[opt.name] || '')
            .filter(Boolean)
            .join('|');
    };

    // Get available values for an option based on current selections of OTHER options
    const getAvailableValues = (optionName: string, optionValues: (string | ProductOptionValue)[]) => {
        // Create a temporary selection without this option to see what's possible
        const tempSelections = { ...selections };
        delete tempSelections[optionName];

        const availableSet = new Set<string>();

        // Check each entry in the matrix
        Object.entries(variantMatrix).forEach(([key, entry]) => {
            // REMOVED: if (entry.stock <= 0) return; 
            // We now want to allow selecting out-of-stock items so the "Notify Me" button appears.

            const keyParts = key.split('|');
            const keyMap: Record<string, string> = {};

            // If the matrix key is just the single value string, handle that legacy case
            // Or if it's a dynamic pipe-joined key
            const isSingle = !key.includes('|') && productOptions.length === 1;

            if (isSingle) {
                keyMap[productOptions[0].name] = key;
            } else {
                productOptions.forEach((opt, idx) => {
                    if (keyParts[idx]) {
                        keyMap[opt.name] = keyParts[idx];
                    }
                });
            }

            // If all OTHER selections match, this option value is available (exists as a variant)
            const matchesOthers = Object.entries(tempSelections).every(
                ([name, value]) => keyMap[name] === value
            );

            if (matchesOthers && keyMap[optionName]) {
                availableSet.add(keyMap[optionName]);
            }
        });

        return optionValues.filter(val => {
            const valueStr = typeof val === 'string' ? val : val.value;
            // If the matrix is empty (legacy or single variant), everything is "available"
            if (Object.keys(variantMatrix).length === 0) return true;
            return availableSet.has(valueStr);
        });
    };

    // Notify parent when selections change
    useEffect(() => {
        const matrixKey = buildMatrixKey(selections);
        const variantData = variantMatrix[matrixKey];

        if (variantData) {
            onVariantChange?.(variantData.variant_id, variantData);
        } else {
            onVariantChange?.(null, null);
        }
        onSelectionsChange?.(selections);
    }, [selections, variantMatrix]);

    // Check availability (stock > 0) specifically for styling
    const checkStockAvailability = (optionName: string, val: string) => {
        const tempSelections = { ...selections, [optionName]: val };
        const matrixKey = buildMatrixKey(tempSelections);
        const entry = variantMatrix[matrixKey];
        return entry && entry.stock > 0;
    }

    // Helper for Hex
    const getColorHexVal = (val: string | ProductOptionValue) => {
        if (!val) return '#94A3B8';
        if (typeof val === 'object' && val.hex) return val.hex;
        const name = typeof val === 'string' ? val : val.value;
        return getColorHex(name);
    };

    // Current selected variant data
    const currentVariant = React.useMemo(() => {
        const matrixKey = buildMatrixKey(selections);
        return variantMatrix[matrixKey];
    }, [selections, variantMatrix]);

    if (productOptions.length === 0) return null;

    return (
        <View style={styles.container}>
            {productOptions.map((option) => {
                const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
                const availableValues = getAvailableValues(option.name, option.values);
                const selectedValue = selections[option.name];

                return (
                    <View key={option.name} style={styles.section}>
                        <View style={styles.optionHeader}>
                            <View style={styles.optionTitleRow}>
                                <Text style={[styles.heading, isDark && { color: '#fff' }]}>
                                    {option.name}
                                </Text>
                                {selectedValue && (
                                    <Text style={[styles.selectedLabel, isDark && { color: '#94A3B8' }]}>
                                        {selectedValue}
                                    </Text>
                                )}
                            </View>
                            {!isColor && option.name.toLowerCase().includes('size') && (
                                <Pressable
                                    style={styles.sizeGuideButton}
                                    onPress={() => Alert.alert('Size Guide', 'Adult apparel: S 36-38, M 39-41, L 42-44, XL 45-47, 2XL 48-50.')}
                                >
                                    <Text style={styles.sizeGuideText}>Size Guide</Text>
                                </Pressable>
                            )}
                        </View>

                        {isColor ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsRow}>
                                {option.values.map((val, idx) => {
                                    const valueStr = val && (typeof val === 'string' ? val : val.value) || `opt-${idx}`;
                                    const isSelected = selectedValue === valueStr;
                                    const isPossibleVariant = availableValues.some(av => (typeof av === 'string' ? av : av.value) === valueStr);

                                    // Check if it's actually in stock for styling purposes
                                    const inStock = checkStockAvailability(option.name, valueStr);

                                    const hex = getColorHexVal(val) || '#ccc';
                                    const isWhite = hex.toLowerCase() === '#ffffff';

                                    return (
                                        <Pressable
                                            key={`${option.name}-${valueStr}-${idx}`}
                                            onPress={() => isPossibleVariant && setSelections(prev => ({ ...prev, [option.name]: valueStr }))}
                                            style={[
                                                styles.colorPill,
                                                isDark && { backgroundColor: '#111', borderColor: '#333' },
                                                isSelected && { borderColor: isDark ? '#fff' : hex, borderWidth: 1.5 },
                                                !isPossibleVariant && { opacity: 0.3 }, // Dim if it doesn't exist at all
                                                (isPossibleVariant && !inStock) && { opacity: 0.8 } // Slightly dim if exists but out of stock
                                            ]}
                                            disabled={!isPossibleVariant}
                                        >
                                            <View style={[
                                                styles.innerDot,
                                                { backgroundColor: hex },
                                                (isWhite || isDark) && styles.dotBorder
                                            ]} />
                                            <Text style={[
                                                styles.colorName,
                                                isDark && { color: '#fff' },
                                                isSelected && styles.colorNameSelectedBold,
                                                !inStock && { textDecorationLine: 'line-through', opacity: 0.6 } // Strike through if out of stock
                                            ]}>
                                                {valueStr}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        ) : (
                            <View style={styles.sizesRow}>
                                {option.values.map((val, idx) => {
                                    const valueStr = val && (typeof val === 'string' ? val : val.value) || `opt-${idx}`;
                                    const isSelected = selectedValue === valueStr;
                                    const isPossibleVariant = availableValues.some(av => (typeof av === 'string' ? av : av.value) === valueStr);

                                    // Check if it's actually in stock for styling purposes
                                    const inStock = checkStockAvailability(option.name, valueStr);

                                    return (
                                        <Pressable
                                            key={`${option.name}-${valueStr}-${idx}`}
                                            onPress={() => isPossibleVariant && setSelections(prev => ({ ...prev, [option.name]: valueStr }))}
                                            style={[
                                                styles.sizeBox,
                                                { width: 'auto', paddingHorizontal: 16, minWidth: 64 },
                                                isDark && { backgroundColor: '#111', borderColor: '#333' },
                                                isSelected && styles.sizeBoxSelected,
                                                isSelected && isDark && { borderColor: '#fff' },
                                                !isPossibleVariant && styles.sizeBoxDisabled,
                                                !isPossibleVariant && isDark && { backgroundColor: '#222', borderColor: '#333' }
                                            ]}
                                            disabled={!isPossibleVariant}
                                        >
                                            <Text style={[
                                                styles.sizeText,
                                                isDark && { color: '#94A3B8' },
                                                isSelected && styles.sizeTextSelected,
                                                isSelected && isDark && { color: '#fff' },
                                                !isPossibleVariant && styles.sizeTextDisabled,
                                                (isPossibleVariant && !inStock) && { textDecorationLine: 'line-through', opacity: 0.6 } // Strike through if out of stock
                                            ]}>
                                                {valueStr}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}

                        {!selectedValue && (
                            <Text style={styles.outOfStockText}>Please select an option</Text>
                        )}
                    </View>
                );
            })}

            {currentVariant && (
                <View style={styles.stockStatusContainer}>
                    <View style={[styles.stockDot, { backgroundColor: currentVariant.stock > 0 ? '#22c55e' : '#ef4444' }]} />
                    <Text style={[styles.stockText, isDark && { color: '#fff' }]}>
                        {currentVariant.stock > 0
                            ? `${currentVariant.stock} units available`
                            : 'Out of stock - Join Waiting List'}
                    </Text>
                </View>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        gap: 22,
    },
    section: {
        paddingHorizontal: 20,
        gap: 12,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    optionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 0,
        flex: 1,
    },
    selectedLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
        flexShrink: 1,
    },
    stockStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 8,
        marginTop: -8,
    },
    stockDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    heading: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: 0,
    },
    sizeGuideButton: {
        paddingVertical: 3,
    },
    sizeGuideText: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    colorsRow: {
        gap: 8,
        paddingRight: 20,
    },
    colorPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
        gap: 8,
    },
    innerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    dotBorder: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    colorName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
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
        gap: 8,
    },
    sizeBox: {
        width: 45,
        minWidth: 45,
        height: 36,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    sizeBoxSelected: {
        borderColor: '#000',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
    },
    sizeBoxDisabled: {
        backgroundColor: '#F9FAFB',
        borderColor: '#F3F4F6',
        opacity: 0.5,
    },
    sizeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
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
