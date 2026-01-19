import React, { useMemo, useCallback, useState, useRef, useEffect, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    Platform,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetScrollView,
    BottomSheetBackdrop,
    BottomSheetFooter,
    BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/apiClient';
import { ColorOption } from '@/utils/colorHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { Category, Brand } from '@/types/schema';

interface ShopFilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    categories?: Category[];
    brands?: Brand[];
}

// Optimized Price Display to prevent whole modal re-renders
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
    onToggleExpand,
    isDark,
    level = 0
}: {
    category: Category,
    selectedIds: number[],
    expandedIds: number[],
    onSelect: (id: number) => void,
    onToggleExpand: (id: number) => void,
    isDark: boolean,
    level?: number
}) => {
    const isSelected = selectedIds.includes(category.id);
    const isExpanded = expandedIds.includes(category.id);

    // Combine sub and sub-sub categories for rendering
    const children = [
        ...(category.sub_categories || []),
        ...(category.sub_sub_categories || [])
    ];
    const hasChildren = children.length > 0;

    return (
        <View style={level > 0 ? styles.nestedCategory : null}>
            <View style={styles.categoryRow}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        style={styles.checkboxWrapper}
                        onPress={() => onSelect(category.id)}
                        hitSlop={8}
                    >
                        <View style={[styles.checkbox, isDark && { borderColor: '#444' }, isSelected && styles.checkboxActive]}>
                            {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                        </View>
                    </Pressable>

                    <Pressable
                        style={{ flex: 1, paddingVertical: 12 }}
                        onPress={() => {
                            if (hasChildren) {
                                onToggleExpand(category.id);
                            }
                            // Always allow selecting the category as well
                            onSelect(category.id);
                        }}
                    >
                        <Text style={[
                            styles.checkboxLabel,
                            isDark && { color: '#94A3B8' },
                            isSelected && (isDark ? { color: '#fff' } : styles.checkboxLabelActive),
                            level === 0 && { fontWeight: '700', fontSize: 16, color: isDark ? '#fff' : '#0F172A' }
                        ]}>
                            {category.name}
                        </Text>
                    </Pressable>
                </View>

                {hasChildren && (
                    <Pressable
                        onPress={() => onToggleExpand(category.id)}
                        style={styles.expandTrigger}
                        hitSlop={12}
                    >
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={isDark ? "#64748B" : "#94A3B8"}
                        />
                    </Pressable>
                )}
            </View>

            {hasChildren && isExpanded && (
                <View style={[styles.subCategoryList, isDark && { borderLeftColor: '#222' }]}>
                    {children.map(child => (
                        <CategoryNode
                            key={child.id}
                            category={child}
                            selectedIds={selectedIds}
                            expandedIds={expandedIds}
                            onSelect={onSelect}
                            onToggleExpand={onToggleExpand}
                            isDark={isDark}
                            level={level + 1}
                        />
                    ))}
                </View>
            )}
        </View>
    );
});

export function ShopFilterModal({ visible, onClose, onApply, categories, brands }: ShopFilterModalProps) {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Filter metadata state
    const [availableColors, setAvailableColors] = useState<ColorOption[]>([]);
    const [availableSizes, setAvailableSizes] = useState<string[]>([]);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(1000);
    const [loadingMetadata, setLoadingMetadata] = useState(true);

    // Load filter metadata
    useEffect(() => {
        const loadFilterMetadata = async () => {
            try {
                setLoadingMetadata(true);
                const metadata = await api.getFilterMetadata();
                setAvailableColors(metadata.colors);
                setAvailableSizes(metadata.sizes);
                setPriceMin(metadata.minPrice);
                setPriceMax(metadata.maxPrice);
                // Initialize price range to full range
                setPriceRange([metadata.minPrice, metadata.maxPrice]);
            } catch (error) {
                console.error('Error loading filter metadata:', error);
            } finally {
                setLoadingMetadata(false);
            }
        };
        loadFilterMetadata();
    }, []);

    useEffect(() => {
        if (visible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

    // Custom Blur Backdrop
    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => {
            const containerAnimatedStyle = useAnimatedStyle(() => ({
                opacity: interpolate(
                    props.animatedIndex.value,
                    [-1, 0],
                    [0, 1],
                    Extrapolate.CLAMP
                ),
            }));

            return (
                <View style={StyleSheet.absoluteFill}>
                    <BottomSheetBackdrop
                        {...props}
                        disappearsOnIndex={-1}
                        appearsOnIndex={0}
                        opacity={0} // We use our custom animated view for blur
                    />
                    <Animated.View style={[StyleSheet.absoluteFill, containerAnimatedStyle, { pointerEvents: 'none' }]}>
                        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.65)' }]} />
                    </Animated.View>
                </View>
            );
        },
        []
    );

    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        colors: true,
        sizes: true,
        brands: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const [selectedCategory, setSelectedCategory] = useState<number[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const handleApply = useCallback(() => {
        onApply({
            category_ids: selectedCategory,
            brand_ids: selectedBrands,
            priceRange: { min: priceRange[0], max: priceRange[1] },
            color: selectedColor,
            size: selectedSize
        });
        onClose();
    }, [onApply, priceRange, selectedCategory, selectedBrands, selectedColor, selectedSize, onClose]);

    const renderFooter = useCallback(
        (props: any) => (
            <BottomSheetFooter {...props} bottomInset={0}>
                <View style={[styles.footer, isDark && { backgroundColor: '#111', borderTopColor: '#222' }]}>
                    <Pressable style={[styles.clearButton, isDark && { borderColor: '#444' }]}>
                        <Text style={[styles.clearButtonText, isDark && { color: '#fff' }]}>Clear All</Text>
                    </Pressable>
                    <Pressable style={[styles.applyButton, isDark && { backgroundColor: '#fff' }]} onPress={handleApply}>
                        <Text style={[styles.applyButtonText, isDark && { color: '#000' }]}>Apply Filters (3)</Text>
                    </Pressable>
                </View>
            </BottomSheetFooter>
        ),
        [handleApply, isDark]
    );

    const categoriesList = ['T-Shirts & Tops', 'Jeans & Denim', 'Jackets'];

    // Colors already have hex values from database, just add border for light colors
    const colorsList = availableColors.map(color => ({
        name: color.name,
        value: color.hex,
        border: (color.hex === '#FFFFFF' || color.name.toLowerCase() === 'white' || color.name.toLowerCase() === 'beige')
            ? '#E2E8F0'
            : (color.hex === '#000000' && isDark) ? '#333' : undefined
    }));

    const sizesList = availableSizes;

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            footerComponent={renderFooter}
            handleIndicatorStyle={[styles.handleIndicator, isDark && { backgroundColor: '#444' }]}
            backgroundStyle={[styles.sheetBackground, isDark && { backgroundColor: '#000' }]}
            enablePanDownToClose
        >
            <View style={[styles.header, isDark && { backgroundColor: '#000', borderBottomColor: '#222' }]}>
                <Text style={[styles.headerTitle, isDark && { color: '#fff' }]}>Filters</Text>
                <Pressable onPress={() => bottomSheetModalRef.current?.dismiss()} style={[styles.closeButton, isDark && { backgroundColor: '#222' }]}>
                    <Ionicons name="close" size={20} color={isDark ? "#fff" : "#64748b"} />
                </Pressable>
            </View>

            <BottomSheetScrollView
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
                            {categories?.map(cat => (
                                <CategoryNode
                                    key={cat.id}
                                    category={cat}
                                    selectedIds={selectedCategory}
                                    expandedIds={expandedCategories}
                                    onSelect={(id) => {
                                        setSelectedCategory(prev =>
                                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                        );
                                    }}
                                    onToggleExpand={(id) => {
                                        setExpandedCategories(prev =>
                                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                        );
                                    }}
                                    isDark={isDark}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View style={[styles.divider, isDark && { backgroundColor: '#222' }]} />

                {/* Price Range */}
                <View style={styles.section}>
                    <Pressable style={styles.sectionHeader} onPress={() => toggleSection('price')}>
                        <Text style={[styles.sectionTitle, isDark && { color: '#fff' }]}>Price Range</Text>
                        <Ionicons name={expandedSections.price ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
                    </Pressable>

                    {expandedSections.price && (
                        <View style={styles.sectionContent}>
                            <View style={styles.sliderWrapper}>
                                <MultiSlider
                                    values={[priceRange[0], priceRange[1]]}
                                    sliderLength={SCREEN_WIDTH - 80}
                                    onValuesChange={setPriceRange}
                                    min={priceMin}
                                    max={priceMax}
                                    step={1}
                                    allowOverlap={false}
                                    snapped
                                    selectedStyle={{ backgroundColor: '#1152d4' }}
                                    unselectedStyle={{ backgroundColor: isDark ? '#333' : '#e2e8f0' }}
                                    trackStyle={{ height: 6, borderRadius: 3 }}
                                    markerStyle={styles.sliderThumb}
                                    pressedMarkerStyle={styles.sliderThumbPressed}
                                />
                            </View>

                            <PriceRangeDisplay
                                values={priceRange}
                                onMinChange={(v) => setPriceRange([parseInt(v) || 0, priceRange[1]])}
                                onMaxChange={(v) => setPriceRange([priceRange[0], parseInt(v) || 0])}
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
                                        onPress={() => setSelectedColor(c.name)}
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
                                        onPress={() => setSelectedSize(s)}
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
                            {brands?.map((brand) => {
                                const isSelected = selectedBrands.includes(brand.id);
                                return (
                                    <Pressable
                                        key={brand.id}
                                        style={[styles.sizeBox, isDark && { borderColor: '#333' }, isSelected && styles.sizeBoxActive]}
                                        onPress={() => {
                                            if (isSelected) {
                                                setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                                            } else {
                                                setSelectedBrands([...selectedBrands, brand.id]);
                                            }
                                        }}
                                    >
                                        <Text style={[styles.sizeText, isDark && { color: '#94A3B8' }, isSelected && styles.sizeTextActive]}>{brand.name}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                    {!expandedSections.brands && (
                        <View style={styles.brandPreview}>
                            {brands?.slice(0, 2).map(b => (
                                <View key={b.id} style={[styles.previewTag, isDark && { backgroundColor: '#222' }]}><Text style={[styles.previewTagText, isDark && { color: '#94A3B8' }]}>{b.name}</Text></View>
                            ))}
                            {brands && brands.length > 2 && <Text style={styles.moreText}>+{brands.length - 2} more</Text>}
                        </View>
                    )}
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24, // rounded-t-3xl
        borderTopRightRadius: 24,
    },
    handleIndicator: {
        backgroundColor: '#cbd5e1', // gray-300
        width: 48,
        height: 6,
        marginTop: 12,
        borderRadius: 3,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6', // gray-100
        backgroundColor: '#fff',
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
        paddingBottom: 100,
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
        marginTop: 8,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    checkboxWrapper: {
        paddingRight: 10,
        paddingVertical: 6,
    },
    checkbox: {
        width: 16, // h-4 w-4
        height: 16,
        borderRadius: 4, // rounded
        borderWidth: 1,
        borderColor: '#d1d5db', // gray-300
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#1152d4',
        borderColor: '#1152d4',
    },
    checkboxLabel: {
        fontSize: 14, // text-sm
        color: '#4b5563', // text-gray-600
    },
    checkboxLabelActive: {
        color: '#111827', // text-gray-900
        fontWeight: '500', // font-medium
    },
    expandTrigger: {
        padding: 4,
    },
    subCategoryList: {
        paddingLeft: 28, // pl-7
        borderLeftWidth: 2,
        borderLeftColor: '#f3f4f6', // border-gray-100
        marginLeft: 8,
        marginTop: 4,
        gap: 8, // space-y-2
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6', // border-gray-100
        marginVertical: 12,
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
        // HTML uses ring-2 ring-primary ring-offset-2
        // We can simulate with border
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
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6', // border-gray-100
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
