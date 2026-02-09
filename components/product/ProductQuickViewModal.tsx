import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Image,
    Dimensions,
    ScrollView,
    Platform,
    Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ShoppingBag01Icon } from '@/components/ui/icons';
import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { Product, ProductVariant } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductSelectors } from '@/components/product/ProductSelectors';
import { calculateProductPricing } from '@/utils/pricing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProductQuickViewModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onAddToCart: (params: { product: Product, variant?: ProductVariant, quantity: number }) => void;
    onViewDetails: (product: Product) => void;
}

export const ProductQuickViewModal = ({
    visible,
    product,
    onClose,
    onAddToCart,
    onViewDetails
}: ProductQuickViewModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedVariantData, setSelectedVariantData] = useState<any>(null); // NEW
    const { triggerCartAnimation } = useCartAnimation();
    const cartButtonRef = React.useRef<View>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // ...

    // Reset quantity when product changes
    React.useEffect(() => {
        if (product) {
            setQuantity(1);
            setSelectedVariantData(null);
            // Default variant logic is partially handled by ProductSelectors, 
            // but we reset our local state for a clean selection.
            if (product.variants?.length && !product.product_options?.length) {
                const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
                setSelectedVariant(defaultVariant);
            } else {
                setSelectedVariant(null);
            }
        }
    }, [product]);

    if (!product) return null;

    const handleVariantChange = (variantId: number | null, variantData: any | null) => {
        setSelectedVariantData(variantData);
        if (variantId && product?.variants) {
            const found = product.variants.find(v => v.id === variantId);
            setSelectedVariant(found || null);
        } else {
            setSelectedVariant(null);
        }
    };

    const priceData = useMemo(
        () => calculateProductPricing(product, {
            selectedVariant,
            selectedVariantPrice: selectedVariantData?.price ?? null,
        }),
        [product, selectedVariant, selectedVariantData]
    );

    const handleAddToCart = () => {
        if (product.has_variants && !selectedVariant) {
            // Should theoretically be handled by valid default, but good safety
            Alert.alert('Selection Required', 'Please select an option');
            return;
        }

        const addAction = () => {
            onAddToCart({
                product,
                quantity,
                variant: selectedVariant || undefined
            });
            onClose();
        };

        if (cartButtonRef.current) {
            requestAnimationFrame(() => {
                cartButtonRef.current?.measure((x, y, w, h, px, py) => {
                    triggerCartAnimation(
                        { x: px + w / 2, y: py + h / 2 },
                        addAction
                    );
                });
            });
        } else {
            addAction();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </BlurView>

                <View style={[styles.modalContainer, isDark && { backgroundColor: '#111' }]}>
                    {/* Close Button */}
                    <Pressable style={[styles.closeButton, isDark && { backgroundColor: 'rgba(50,50,50,0.8)' }]} onPress={onClose}>
                        <MaterialIcons name="close" size={20} color={isDark ? "#fff" : "#64748b"} />
                    </Pressable>

                    {/* Product Image */}
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: selectedVariant?.image_path || product.main_image || 'https://via.placeholder.com/400x300' }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>

                    <ScrollView style={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
                        {/* Title & Price using ProductInfo */}
                        <View style={{ marginHorizontal: -20, marginTop: -20 }}>
                            <ProductInfo
                                brand={product.brand?.name}
                                title={product.name_en || product.name || ''}
                                price={priceData.finalPrice}
                                originalPrice={priceData.originalPrice}
                                rating={4.8}
                                reviewCount={product.reviews?.length || 0}
                            />
                        </View>

                        {/* Selectors */}
                        <View style={{ marginHorizontal: -20, marginTop: 10 }}>
                            <ProductSelectors
                                key={product.id}
                                productOptions={product.product_options}
                                variantMatrix={product.variant_matrix}
                                onVariantChange={handleVariantChange}
                            />
                        </View>

                        {/* Quantity Selector */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, isDark && { color: '#e5e5e5' }]}>Quantity</Text>
                            <View style={[styles.quantityContainer, isDark && { borderColor: '#333' }]}>
                                <Pressable
                                    style={styles.qtyBtn}
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <MaterialIcons name="remove" size={20} color={isDark ? "#94A3B8" : "#64748b"} />
                                </Pressable>
                                <View style={[styles.qtyValue, isDark && { backgroundColor: '#222', borderColor: '#333' }]}>
                                    <Text style={[styles.qtyText, isDark && { color: '#fff' }]}>{quantity}</Text>
                                </View>
                                <Pressable
                                    style={styles.qtyBtn}
                                    onPress={() => setQuantity(quantity + 1)}
                                >
                                    <MaterialIcons name="add" size={20} color={isDark ? "#94A3B8" : "#64748b"} />
                                </Pressable>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actions}>
                            <Pressable
                                style={styles.addToCartBtn}
                                onPress={handleAddToCart}
                                ref={cartButtonRef}
                            >
                                <HugeiconsIcon icon={ShoppingBag01Icon} size={20} color="#fff" />
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                            </Pressable>
                            <Pressable style={[styles.detailsBtn, isDark && { borderColor: '#333' }]} onPress={() => { onClose(); onViewDetails(product); }}>
                                <Text style={[styles.detailsText, isDark && { color: '#fff' }]}>View Full Details</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        width: Math.min(SCREEN_WIDTH - 40, 360),
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        maxHeight: SCREEN_HEIGHT * 0.85,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrapper: {
        width: '100%',
        height: 240,
        backgroundColor: '#f1f5f9',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    newBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    newBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0f172a',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        width: 120,
    },
    qtyBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyValue: {
        flex: 1,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#e2e8f0',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    actions: {
        gap: 12,
        marginTop: 8,
        paddingBottom: 10,
    },
    addToCartBtn: {
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1152d4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#1152d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    detailsBtn: {
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsText: {
        color: '#1e293b',
        fontSize: 14,
        fontWeight: '600',
    }
});
