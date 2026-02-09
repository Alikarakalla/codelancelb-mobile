import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform, Dimensions, LayoutAnimation, UIManager } from 'react-native';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { Category, Brand } from '@/types/schema';
import { useFilters } from '@/context/FilterContext';
import { ColorOption } from '@/utils/colorHelpers';
import { IconSymbol } from '@/components/ui/icon-symbol';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Changed from transparent for non-modal page
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    section: {
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    sectionContent: {
        paddingBottom: 16,
    },
    // Categories
    nestedCategory: {
        marginTop: 4,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    checkboxWrapper: {
        paddingRight: 12,
        paddingVertical: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    checkboxLabelActive: {
        color: '#000',
        fontWeight: '900',
    },
    expandTrigger: {
        padding: 8,
    },
    subCategoryList: {
        paddingLeft: 24,
        borderLeftWidth: 2,
        borderLeftColor: '#eee',
        marginLeft: 9,
        marginTop: 4,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    // Slider
    sliderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    sliderThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 20,
        height: 20,
        borderRadius: 50,
        backgroundColor: 'transparent', // Important: Let the system provide the glass
        justifyContent: 'center',
        alignItems: 'center',
        // On iOS 26, the system wraps this Pressable in a glass bubble automatically
        // if it's inside a native header and has a fixed width/height.
        ...Platform.select({
            ios: {
                shadowColor: 'transparent',
                marginHorizontal: 8,
            },
            android: {
                backgroundColor: 'rgba(0,0,0,0.05)',
                marginHorizontal: 8,
            }
        })
    },
    priceInputGroup: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: 'rgba(0,0,0,0.5)',
        letterSpacing: 1,
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    currencySymbol: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000',
    },
    textInput: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000',
        padding: 0,
        flex: 1,
    },
    rangeDivider: {
        color: '#000',
        fontSize: 12,
        fontWeight: '900',
    },
    // Colors
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorDot: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#eee',
    },
    colorSelected: {
        borderColor: '#000',
        borderWidth: 3,
        transform: [{ scale: 1.05 }],
    },
    // Sizes
    sizeBox: {
        height: 48,
        minWidth: 60,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sizeBoxActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    sizeText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#000',
        letterSpacing: 0.5,
    },
    sizeTextActive: {
        color: '#fff',
        fontWeight: '900',
    },
    brandPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    previewTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
    },
    previewTagText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#666',
        textTransform: 'uppercase',
    },
    moreText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#999',
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
    onSelect: (category: Category) => void,
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
            <View style={styles.categoryRow}>
                {/* Select Action Area */}
                <Pressable
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingLeft: 8 }}
                    onPress={() => onSelect(category)}
                >
                    <View style={[
                        styles.checkbox,
                        isDark && { borderColor: '#555' },
                        isSelected && styles.checkboxActive
                    ]}>
                        {isSelected && <Ionicons name="checkmark" size={12} color={isDark && isSelected ? '#000' : '#fff'} />}
                    </View>

                    <Text style={[
                        styles.checkboxLabel,
                        isDark && { color: 'rgba(255,255,255,0.5)' },
                        isSelected && (isDark ? { color: '#fff' } : styles.checkboxLabelActive),
                        level === 0 && { fontWeight: '900', fontSize: 16, color: isDark ? '#fff' : '#000', letterSpacing: 1 }
                    ]}>
                        {(category.name_en || category.name).toUpperCase()}
                    </Text>
                </Pressable>

                {/* Expand Action Area */}
                {hasChildren && (
                    <Pressable
                        style={{ padding: 10, paddingLeft: 16 }}
                        onPress={() => onExpand(category.id)}
                    >
                        <Ionicons
                            name={isExpanded ? "remove" : "add"}
                            size={20}
                            color={isDark ? "#fff" : "#000"}
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


export default function FilterPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { filters, updateFilter } = useFilters();
    const insets = useSafeAreaInsets();

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    // Filter metadata state
    const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(1000);

    // Context State


    // Local UI State
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    // Local Filter States (deferred application)
    const [localPriceRange, setLocalPriceRange] = useState<number[]>(filters.priceRange);
    const [localCategoryIds, setLocalCategoryIds] = useState<number[]>(filters.categoryIds);
    const [localBrandIds, setLocalBrandIds] = useState<number[]>(filters.brandIds);
    const [localColor, setLocalColor] = useState<string | null>(filters.color);
    const [localSize, setLocalSize] = useState<string | null>(filters.size);

    // Sync local state if external filters change (e.g. from Shop screen or Reset)
    useEffect(() => {
        setLocalPriceRange(filters.priceRange);
        setLocalCategoryIds(filters.categoryIds);
        setLocalBrandIds(filters.brandIds);
        setLocalColor(filters.color);
        setLocalSize(filters.size);
    }, [filters]);

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

    const applyFiltersAndNavigate = useCallback((newFilters: any) => {
        // Update context - ShopScreen will react to context changes
        // Merge with existing filters to ensure we don't lose state
        const updated = {
            categoryIds: filters.categoryIds,
            brandIds: filters.brandIds,
            priceRange: filters.priceRange,
            color: filters.color,
            size: filters.size,
            ...newFilters
        };

        Object.entries(updated).forEach(([key, value]) => {
            updateFilter(key as keyof typeof filters, value);
        });
    }, [filters, updateFilter]);

    const handleApply = () => {
        // Apply all local state to context
        applyFiltersAndNavigate({
            priceRange: localPriceRange,
            categoryIds: localCategoryIds,
            brandIds: localBrandIds,
            color: localColor,
            size: localSize
        });
        router.dismiss();
    };

    const handleCategorySelect = useCallback((category: Category) => {
        const id = category.id;
        setLocalCategoryIds(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        );
    }, []);

    const handlePriceChange = (values: number[]) => {
        setLocalPriceRange(values);
    };

    const handlePriceChangeComplete = (values: number[]) => {
        setLocalPriceRange(values);
    };

    const handleBrandSelect = (id: number) => {
        setLocalBrandIds(prev =>
            prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
        );
    };

    const handleColorSelect = (colorName: string) => {
        setLocalColor(prev => prev === colorName ? null : colorName);
    };

    const handleSizeSelect = (size: string) => {
        setLocalSize(prev => prev === size ? null : size);
    };

    // Initialize data
    useEffect(() => {
        const load = async () => {
            const catsTask = api.getCategories()
                .then((cats) => setCategories(cats || []))
                .catch((err) => console.error('Failed loading categories in filter page:', err));

            const brandsTask = api.getBrands()
                .then((brs) => setBrands(brs || []))
                .catch((err) => console.error('Failed loading brands in filter page:', err));

            const metadataTask = api.getFilterMetadata()
                .then((metadata) => {
                    setAvailableColors(metadata.colors);
                    setAvailableSizes(metadata.sizes);
                    setPriceMin(metadata.minPrice);
                    setPriceMax(metadata.maxPrice);

                    // Update price range in context if it's still at default
                    if (filters.priceRange[0] === 0 && filters.priceRange[1] === 1000) {
                        updateFilter('priceRange', [metadata.minPrice, metadata.maxPrice]);
                    }
                })
                .catch((err) => console.error('Failed loading filter metadata in filter page:', err));

            await Promise.allSettled([catsTask, brandsTask, metadataTask]);
        };
        // Only load once
        if (categories.length === 0) load();
    }, []);

    const handleClear = () => {
        // Reset local state to defaults
        setLocalCategoryIds([]);
        setLocalBrandIds([]);
        setLocalPriceRange([priceMin, priceMax]);
        setLocalColor(null);
        setLocalSize(null);
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

    // Count active filters
    const activeFilterCount = localCategoryIds.length + localBrandIds.length +
        (localColor ? 1 : 0) + (localSize ? 1 : 0) +
        ((localPriceRange[0] !== priceMin || localPriceRange[1] !== priceMax) ? 1 : 0);


    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: "",
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <IconSymbol
                                name="chevron.left"
                                color={isDark ? '#fff' : '#000'}
                                size={24}
                            />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <BlurView
                            intensity={Platform.OS === 'ios' ? 20 : 100}
                            tint={isDark ? 'dark' : 'light'}
                            style={{
                                flexDirection: 'row',
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                borderRadius: 24,
                                padding: 4,
                                marginRight: 4,
                                overflow: 'hidden',
                                gap: 4,
                            }}
                        >
                            <Pressable
                                onPress={handleClear}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                }}
                            >
                                <Text style={{ fontSize: 11, fontWeight: '900', color: isDark ? '#fff' : '#000', letterSpacing: 1 }}>RESET</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleApply}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    backgroundColor: isDark ? '#fff' : '#000',
                                    borderRadius: 20,
                                }}
                            >
                                <Text style={{ fontSize: 11, fontWeight: '900', color: isDark ? '#000' : '#fff', letterSpacing: 1 }}>APPLY</Text>
                            </Pressable>
                        </BlurView>
                    ),
                    presentation: 'card'
                }}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
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
                                    selectedIds={localCategoryIds}
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
                                        <Text style={{ fontSize: 11, color: isDark ? '#fff' : '#000', fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>
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
                                        minimumTrackTintColor="#000"
                                        maximumTrackTintColor={isDark ? '#333' : '#e0e0e0'}
                                        thumbTintColor={isDark ? '#fff' : '#000'}
                                    />
                                </View>

                                {/* Max Price Slider */}
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 11, color: isDark ? '#fff' : '#000', fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>
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
                                        minimumTrackTintColor="#000"
                                        maximumTrackTintColor={isDark ? '#333' : '#e0e0e0'}
                                        thumbTintColor={isDark ? '#fff' : '#000'}
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
                                const isSelected = localColor === c.name;
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
                                const isSelected = localSize === s;
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
                                const isSelected = localBrandIds.includes(brand.id);
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
