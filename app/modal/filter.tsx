import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform, Dimensions, LayoutAnimation, UIManager, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { Category, Brand } from '@/types/schema';
import { useFilters } from '@/context/FilterContext';
import { ColorOption } from '@/utils/colorHelpers';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent', // IMPORTANT for glass effect
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 20, // text-xl
        fontWeight: '700', // font-bold
        color: '#111827', // gray-900
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    section: {
        marginBottom: 16, // space-y-4 implies ~16px
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700', // font-bold
        color: '#111827', // gray-900
    },
    sectionContent: {
        paddingTop: 8,
        paddingBottom: 8,
    },
    // Categories
    nestedCategory: {
        marginTop: 4, // Reduce gap between nested items
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10, // More vertical padding for spaced look
        minHeight: 44, // Ensure touch target
    },
    checkboxWrapper: {
        paddingRight: 12,
        paddingVertical: 4,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#1152d4',
        borderColor: '#1152d4',
    },
    checkboxLabel: {
        fontSize: 15, // Unified font size (Standard: 15px)
        color: '#4b5563',
    },
    checkboxLabelActive: {
        color: '#111827',
        fontWeight: '600', // Semi-bold for active
    },
    expandTrigger: {
        padding: 4,
    },
    subCategoryList: {
        paddingLeft: 20, // Reduced indentation (was 28)
        borderLeftWidth: 1.5,
        borderLeftColor: '#f3f4f6',
        marginLeft: 9, // Slight adjustment for alignment line
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 16,
    },
    // Slider
    sliderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    sliderThumb: {
        width: 20, // h-5
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#1152d4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sliderThumbPressed: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    priceInputGroup: {
        flex: 1,
        backgroundColor: '#f9fafb', // bg-gray-50
        borderWidth: 1,
        borderColor: '#e5e7eb', // border-gray-200
        borderRadius: 8, // rounded-lg
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    inputLabel: {
        fontSize: 12, // text-xs
        color: '#6b7280', // text-gray-500
        marginBottom: 2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    currencySymbol: {
        fontSize: 14, // text-sm
        fontWeight: '700', // font-bold
        color: '#111827', // text-gray-900
    },
    textInput: {
        fontSize: 14, // text-sm
        fontWeight: '700', // font-bold
        color: '#111827', // text-gray-900
        padding: 0,
        flex: 1,
    },
    rangeDivider: {
        color: '#9ca3af', // text-gray-400
        fontSize: 18,
    },
    // Colors
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12, // gap-3
    },
    colorDot: {
        width: 32, // h-8 w-8
        height: 32,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    colorSelected: {
        borderWidth: 2,
        borderColor: '#fff',
        transform: [{ scale: 1.1 }],
    },
    // Sizes
    sizeBox: {
        height: 40, // h-10
        minWidth: 40, // min-w-[40px]
        paddingHorizontal: 12, // px-3
        borderRadius: 8, // rounded-lg
        borderWidth: 1,
        borderColor: '#e5e7eb', // border-gray-200
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sizeBoxActive: {
        backgroundColor: '#1152d4',
        borderColor: '#1152d4',
        shadowColor: '#1152d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, // shadow-primary/30
        shadowRadius: 6,
        elevation: 4,
    },
    sizeText: {
        fontSize: 14, // text-sm
        fontWeight: '500', // font-medium
        color: '#111827', // text-gray-900
    },
    sizeTextActive: {
        color: '#fff',
        fontWeight: '700', // font-bold
    },
    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        // backgroundColor: 'transparent',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    clearButton: {
        flex: 1,
        height: 54, // py-3.5 ~ 14px * 2 + lineheight ~ 24 = 52px. Fixed height ensures clickability
        borderRadius: 12, // rounded-xl
        borderWidth: 1,
        borderColor: '#e5e7eb', // border-gray-200
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)'
    },
    clearButtonText: {
        fontSize: 14, // text-sm
        fontWeight: '700', // font-bold
        color: '#111827', // text-gray-900
    },
    applyButton: {
        flex: 1,
        height: 54,
        borderRadius: 12, // rounded-xl
        backgroundColor: '#1152d4',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1152d4',
        shadowOffset: { width: 0, height: 4 }, // shadow-lg-ish
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    applyButtonText: {
        fontSize: 14, // text-sm
        fontWeight: '700', // font-bold
        color: '#fff',
    },
    brandPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: 0.8,
    },
    previewTag: {
        backgroundColor: '#f3f4f6', // bg-gray-100
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4, // rounded
    },
    previewTagText: {
        fontSize: 12, // text-xs
        color: '#6b7280', // text-gray-500
    },
    moreText: {
        fontSize: 12, // text-xs
        color: '#9ca3af', // text-gray-400
    }
});


// Optimized Price Display
const PriceRangeDisplay = memo(({ values, onMinChange, onMaxChange, isDark }: {
    values: number[],
    onMinChange: (v: string) => void,
    onMaxChange: (v: string) => void,
    isDark: boolean
}) => {
    return (
        <View style={styles.priceInputs}>
            <View style={[styles.priceInputGroup, isDark && { backgroundColor: '#111', borderColor: '#333' }]}>
                <Text style={styles.inputLabel}>Min Price</Text>
                <View style={styles.inputWrapper}>
                    <Text style={[styles.currencySymbol, isDark && { color: '#fff' }]}>$</Text>
                    <TextInput
                        style={[styles.textInput, isDark && { color: '#fff' }]}
                        value={values[0].toString()}
                        onChangeText={onMinChange}
                        keyboardType="numeric"
                        placeholderTextColor={isDark ? '#555' : '#999'}
                    />
                </View>
            </View>
            <Text style={[styles.rangeDivider, isDark && { color: '#555' }]}>-</Text>
            <View style={[styles.priceInputGroup, isDark && { backgroundColor: '#111', borderColor: '#333' }]}>
                <Text style={styles.inputLabel}>Max Price</Text>
                <View style={styles.inputWrapper}>
                    <Text style={[styles.currencySymbol, isDark && { color: '#fff' }]}>$</Text>
                    <TextInput
                        style={[styles.textInput, isDark && { color: '#fff' }]}
                        value={values[1].toString()}
                        onChangeText={onMaxChange}
                        keyboardType="numeric"
                        placeholderTextColor={isDark ? '#555' : '#999'}
                    />
                </View>
            </View>
        </View>
    );
});

const CategoryNode = memo(({
    category,
    selectedIds,
    expandedIds,
    onSelect,
    onExpand,
    isDark,
    level = 0
}: {
    category: Category,
    selectedIds: number[],
    expandedIds: number[],
    onSelect: (id: number) => void,
    onExpand: (id: number) => void,
    isDark: boolean,
    level?: number
}) => {
    const isSelected = selectedIds.includes(category.id);
    const isExpanded = expandedIds.includes(category.id);

    const children = [
        ...(category.sub_categories || []),
        ...(category.sub_sub_categories || [])
    ];
    const hasChildren = children.length > 0;

    return (
        <View style={level > 0 ? styles.nestedCategory : null}>
            <View style={[styles.categoryRow, isSelected && { backgroundColor: isDark ? '#222' : '#f8f9fa', borderRadius: 8 }]}>
                {/* Select Action Area */}
                <Pressable
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingLeft: 8 }}
                    onPress={() => onSelect(category.id)}
                >
                    <View style={[styles.checkbox, isDark && { borderColor: '#444' }, isSelected && styles.checkboxActive]}>
                        {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>

                    <Text style={[
                        styles.checkboxLabel,
                        isDark && { color: '#94A3B8' },
                        isSelected && (isDark ? { color: '#fff' } : styles.checkboxLabelActive),
                        level === 0 && { fontSize: 16 }
                    ]}>
                        {category.name_en || category.name}
                    </Text>
                </Pressable>

                {/* Expand Action Area */}
                {hasChildren && (
                    <Pressable
                        style={{ padding: 10, paddingLeft: 16 }}
                        onPress={() => onExpand(category.id)}
                    >
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={isSelected ? (isDark ? "#fff" : "#1152d4") : (isDark ? "#444" : "#9ca3af")}
                        />
                    </Pressable>
                )}
            </View>

            {hasChildren && isExpanded && (
                <View style={[styles.subCategoryList, isDark && { borderLeftColor: '#333' }]}>
                    {children.map(child => (
                        <CategoryNode
                            key={child.id}
                            category={child}
                            selectedIds={selectedIds}
                            expandedIds={expandedIds}
                            onSelect={onSelect}
                            onExpand={onExpand}
                            isDark={isDark}
                            level={level + 1}
                        />
                    ))}
                </View>
            )}
        </View>
    );
});


export default function FilterModalScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { filters, updateFilter } = useFilters();

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    // Filter metadata state
    const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(1000);

    // Context State
    const selectedCategory = filters.categoryIds;
    const selectedBrands = filters.brandIds;
    const priceRange = filters.priceRange;
    const selectedColor = filters.color;
    const selectedSize = filters.size;

    // Local UI State
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    // Local State for Sliders (to prevent filtering while dragging)
    const [localPriceRange, setLocalPriceRange] = useState<number[]>(priceRange);

    // Sync local state if external filters change (e.g. Clear All)
    useEffect(() => {
        setLocalPriceRange(filters.priceRange);
    }, [filters.priceRange]);

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        colors: true,
        sizes: true,
        brands: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleToggleExpand = useCallback((id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    }, []);

    const applyFiltersAndNavigate = useCallback((newFilters: Partial<typeof filters>) => {
        // Update context - ShopScreen will react to context changes
        Object.entries(newFilters).forEach(([key, value]) => {
            updateFilter(key as keyof typeof filters, value);
        });
    }, [filters, updateFilter]);

    const handleCategorySelect = useCallback((id: number) => {
        const prev = filters.categoryIds;
        const isSelected = prev.includes(id);
        const newIds = isSelected ? prev.filter(cid => cid !== id) : [...prev, id];
        applyFiltersAndNavigate({ categoryIds: newIds });
    }, [filters.categoryIds, applyFiltersAndNavigate]);

    const handlePriceChange = (values: number[]) => {
        setLocalPriceRange(values);
        // Don't navigate immediately on price change, wait for user to finish sliding
    };

    const handlePriceChangeComplete = (values: number[]) => {
        setLocalPriceRange(values); // Ensure UI stays synced
        applyFiltersAndNavigate({ priceRange: values as [number, number] });
    };

    const handleBrandSelect = (id: number) => {
        const prev = filters.brandIds;
        const newIds = prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id];
        applyFiltersAndNavigate({ brandIds: newIds });
    };

    const handleColorSelect = (colorName: string) => {
        const newColor = selectedColor === colorName ? null : colorName;
        applyFiltersAndNavigate({ color: newColor });
    };

    const handleSizeSelect = (size: string) => {
        const newSize = selectedSize === size ? null : size;
        applyFiltersAndNavigate({ size: newSize });
    };

    // Initialize data
    useEffect(() => {
        const load = async () => {
            try {
                const [cats, brs, metadata] = await Promise.all([
                    api.getCategories(),
                    api.getBrands(),
                    api.getFilterMetadata()
                ]);

                console.log(`API Success: Loaded ${cats ? cats.length : 0} categories.`);
                if (cats) {
                    // Log just the top level structure to act as a summary
                    console.log('Categories Summary (IDs/Names):', JSON.stringify(cats.map(c => ({ id: c.id, name: c.name, sub_count: c.sub_categories?.length })), null, 2));

                    // Log the full detailed structure for deep inspection
                    console.log('FULL Categories Data:', JSON.stringify(cats, null, 2));
                }

                setCategories(cats || []);
                setBrands(brs || []);
                setAvailableColors(metadata.colors);
                setAvailableSizes(metadata.sizes);
                setPriceMin(metadata.minPrice);
                setPriceMax(metadata.maxPrice);

                // Update price range in context if it's still at default
                if (filters.priceRange[0] === 0 && filters.priceRange[1] === 1000) {
                    updateFilter('priceRange', [metadata.minPrice, metadata.maxPrice]);
                }
            } catch (err) {
                console.error('API Failed in FilterModal:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleClear = () => {
        updateFilter('categoryIds', []);
        updateFilter('brandIds', []);
        updateFilter('priceRange', [priceMin, priceMax]);
        updateFilter('color', null);
        updateFilter('size', null);
    };

    // Colors already have hex values from database, just add border for light colors
    const colorsList = availableColors.map(color => ({
        name: color.name,
        value: color.hex,
        border: (color.hex === '#FFFFFF' || color.name.toLowerCase() === 'white' || color.name.toLowerCase() === 'beige')
            ? '#E2E8F0'
            : (color.hex === '#000000' && isDark) ? '#333' : undefined
    }));

    const sizesList = availableSizes;

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={isDark ? '#fff' : '#1152d4'} />
            </View>
        );
    }

    // Count active filters
    const activeFilterCount = selectedCategory.length + selectedBrands.length +
        (selectedColor ? 1 : 0) + (selectedSize ? 1 : 0) +
        ((priceRange[0] !== priceMin || priceRange[1] !== priceMax) ? 1 : 0);

    return (
        <View style={styles.container}>
            <View style={[styles.header, isDark && { borderBottomColor: '#222' }]}>
                <Text style={[styles.headerTitle, isDark && { color: '#fff' }]}>Filters</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {activeFilterCount > 0 && (
                        <Pressable onPress={handleClear} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                            <Text style={{ color: '#1152d4', fontSize: 14, fontWeight: '600' }}>Clear All</Text>
                        </Pressable>
                    )}
                    <Pressable onPress={() => router.dismiss()} style={[styles.closeButton, isDark && { backgroundColor: '#222' }]}>
                        <Ionicons name="close" size={20} color={isDark ? "#fff" : "#64748b"} />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Categories */}
                <View style={[styles.section, { marginTop: 10 }]}>
                    <Pressable style={styles.sectionHeader} onPress={() => toggleSection('categories')}>
                        <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Categories</Text>
                        <Ionicons name={expandedSections.categories ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
                    </Pressable>

                    {expandedSections.categories && (
                        <View style={styles.sectionContent}>
                            {categories.map(cat => (
                                <CategoryNode
                                    key={cat.id}
                                    category={cat}
                                    selectedIds={selectedCategory}
                                    expandedIds={expandedCategories}
                                    onSelect={handleCategorySelect}
                                    onExpand={handleToggleExpand}
                                    isDark={isDark}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View style={[styles.divider, isDark && { backgroundColor: '#222' }]} />

                {/* Price Range */}
                <View style={[styles.section, { marginTop: 10 }]}>
                    <Pressable style={styles.sectionHeader} onPress={() => toggleSection('price')}>
                        <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Price Range</Text>
                        <Ionicons name={expandedSections.price ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
                    </Pressable>

                    {expandedSections.price && (
                        <View style={styles.sectionContent}>
                            <View style={{ paddingVertical: 10, paddingHorizontal: 10, gap: 24 }}>
                                {/* Min Price Slider */}
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 13, color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '500' }}>
                                            Min Price: ${localPriceRange[0]}
                                        </Text>
                                    </View>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={priceMin}
                                        maximumValue={localPriceRange[1]} // Cap at local Max
                                        step={1}
                                        value={localPriceRange[0]}
                                        onValueChange={(val: number) => handlePriceChange([val, localPriceRange[1]])}
                                        onSlidingComplete={(val: number) => handlePriceChangeComplete([val, localPriceRange[1]])}
                                        minimumTrackTintColor="#1152d4"
                                        maximumTrackTintColor={isDark ? '#333' : '#e2e8f0'}
                                        thumbTintColor={isDark ? '#fff' : '#fff'}
                                    />
                                </View>

                                {/* Max Price Slider */}
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 13, color: isDark ? '#9ca3af' : '#6b7280', fontWeight: '500' }}>
                                            Max Price: ${localPriceRange[1]}
                                        </Text>
                                    </View>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={localPriceRange[0]} // Cap at local Min
                                        maximumValue={priceMax}
                                        step={1}
                                        value={localPriceRange[1]}
                                        onValueChange={(val: number) => handlePriceChange([localPriceRange[0], val])}
                                        onSlidingComplete={(val: number) => handlePriceChangeComplete([localPriceRange[0], val])}
                                        minimumTrackTintColor="#1152d4"
                                        maximumTrackTintColor={isDark ? '#333' : '#e2e8f0'}
                                        thumbTintColor={isDark ? '#fff' : '#fff'}
                                    />
                                </View>
                            </View>

                            <PriceRangeDisplay
                                values={localPriceRange}
                                onMinChange={(v) => handlePriceChangeComplete([parseInt(v) || 0, localPriceRange[1]])}
                                onMaxChange={(v) => handlePriceChangeComplete([localPriceRange[0], parseInt(v) || 0])}
                                isDark={isDark}
                            />
                        </View>
                    )}
                </View>

                <View style={[styles.divider, isDark && { backgroundColor: '#222' }]} />

                {/* Colors */}
                <View style={styles.section}>
                    <Pressable style={styles.sectionHeader} onPress={() => toggleSection('colors')}>
                        <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Colors</Text>
                        <Ionicons name={expandedSections.colors ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
                    </Pressable>

                    {expandedSections.colors && (
                        <View style={[styles.sectionContent, styles.rowWrap]}>
                            {colorsList.map((c) => {
                                const isSelected = selectedColor === c.name;
                                return (
                                    <Pressable
                                        key={c.name}
                                        style={[
                                            styles.colorDot,
                                            { backgroundColor: c.value },
                                            c.border ? { borderWidth: 1, borderColor: c.border } : null,
                                            isSelected && styles.colorSelected
                                        ]}
                                        onPress={() => handleColorSelect(c.name)}
                                    />
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={[styles.divider, isDark && { backgroundColor: '#222' }]} />

                {/* Sizes */}
                <View style={styles.section}>
                    <Pressable style={styles.sectionHeader} onPress={() => toggleSection('sizes')}>
                        <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Sizes</Text>
                        <Ionicons name={expandedSections.sizes ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
                    </Pressable>

                    {expandedSections.sizes && (
                        <View style={[styles.sectionContent, styles.rowWrap]}>
                            {sizesList.map((s) => {
                                const isSelected = selectedSize === s;
                                return (
                                    <Pressable
                                        key={s}
                                        style={[styles.sizeBox, isDark && { borderColor: '#333' }, isSelected && styles.sizeBoxActive]}
                                        onPress={() => handleSizeSelect(s)}
                                    >
                                        <Text style={[styles.sizeText, isDark && { color: '#94A3B8' }, isSelected && styles.sizeTextActive]}>{s}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={[styles.divider, isDark && { backgroundColor: '#222' }]} />

                {/* Brands */}
                <View style={styles.section}>
                    <Pressable style={styles.sectionHeader} onPress={() => toggleSection('brands')}>
                        <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Brands</Text>
                        <Ionicons name={expandedSections.brands ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
                    </Pressable>
                    {expandedSections.brands && (
                        <View style={[styles.sectionContent, styles.rowWrap]}>
                            {brands.map((brand) => {
                                const isSelected = selectedBrands.includes(brand.id);
                                return (
                                    <Pressable
                                        key={brand.id}
                                        style={[styles.sizeBox, isDark && { borderColor: '#333' }, isSelected && styles.sizeBoxActive]}
                                        onPress={() => handleBrandSelect(brand.id)}
                                    >
                                        <Text style={[styles.sizeText, isDark && { color: '#94A3B8' }, isSelected && styles.sizeTextActive]}>{brand.name}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                    {!expandedSections.brands && (
                        <View style={styles.brandPreview}>
                            {brands.slice(0, 2).map(b => (
                                <View key={b.id} style={[styles.previewTag, isDark && { backgroundColor: '#222' }]}><Text style={[styles.previewTagText, isDark && { color: '#94A3B8' }]}>{b.name}</Text></View>
                            ))}
                            {brands.length > 2 && <Text style={styles.moreText}>+{brands.length - 2} more</Text>}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

