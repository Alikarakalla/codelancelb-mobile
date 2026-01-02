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
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ShoppingBag01Icon } from '@/components/ui/icons';
import { useCartAnimation } from '@/components/cart/CartAnimationProvider';
import { Product, ProductVariant } from '@/types/schema';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { triggerCartAnimation } = useCartAnimation();
    const cartButtonRef = React.useRef<View>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (!product) return null;

    const hasDiscount = product.discount_amount && product.discount_amount > 0;
    const finalPrice = hasDiscount
        ? (product.discount_type === 'percent'
            ? product.price! * (1 - product.discount_amount! / 100)
            : product.price! - product.discount_amount!)
        : product.price;

    // Extract unique sizes and colors from variants
    const sizes = useMemo(() => {
        const s = new Set<string>();
        product.variants?.forEach(v => v.size && s.add(v.size));
        return Array.from(s);
    }, [product]);

    const colors = useMemo(() => {
        const c = new Set<string>();
        product.variants?.forEach(v => v.color && c.add(v.color));
        return Array.from(c);
    }, [product]);

    const handleAddToCart = () => {
        if (cartButtonRef.current) {
            requestAnimationFrame(() => {
                cartButtonRef.current?.measure((x, y, w, h, px, py) => {
                    triggerCartAnimation(
                        { x: px + w / 2, y: py + h / 2 },
                        () => {
                            onAddToCart({
                                product,
                                quantity,
                                variant: product.variants?.find(v => v.size === selectedSize && v.color === selectedColor)
                            });
                            onClose();
                        }
                    );
                });
            });
        } else {
            onAddToCart({
                product,
                quantity,
                variant: product.variants?.find(v => v.size === selectedSize && v.color === selectedColor)
            });
            onClose();
        }
    }

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
                            source={{ uri: product.main_image || 'https://via.placeholder.com/400x300' }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>

                    <ScrollView style={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
                        {/* Title & Price */}
                        <View style={styles.header}>
                            <View style={{ flex: 1 }}>
                                {product.brand && (
                                    <Text style={[styles.brandName, isDark && { color: '#94A3B8' }]}>{product.brand.name}</Text>
                                )}
                                <Text style={[styles.productName, isDark && { color: '#fff' }]}>{product.name_en || product.name}</Text>
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={[styles.price, isDark && { color: '#1152d4' }]}>${finalPrice?.toFixed(2)}</Text>
                                {hasDiscount && (
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>
                                            -{product.discount_type === 'percent' ? `${product.discount_amount}%` : `$${product.discount_amount}`}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Color Selector */}
                        {colors.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, isDark && { color: '#e5e5e5' }]}>Available Colors</Text>
                                <View style={styles.colorRow}>
                                    {colors.map(color => (
                                        <Pressable
                                            key={color}
                                            onPress={() => setSelectedColor(color)}
                                            style={[
                                                styles.colorDot,
                                                { backgroundColor: color.toLowerCase() },
                                                selectedColor === color && styles.colorDotSelected,
                                                isDark && { borderColor: '#333' }
                                            ]}
                                        >
                                            {selectedColor === color && (
                                                <MaterialIcons name="check" size={16} color={color.toLowerCase() === 'white' ? '#000' : '#fff'} />
                                            )}
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Size Selector */}
                        {sizes.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, isDark && { color: '#e5e5e5' }]}>Select Size</Text>
                                    <Pressable><Text style={styles.sizeChartText}>Size Chart</Text></Pressable>
                                </View>
                                <View style={styles.sizeGrid}>
                                    {sizes.map(size => (
                                        <Pressable
                                            key={size}
                                            onPress={() => setSelectedSize(size)}
                                            style={[
                                                styles.sizeBox,
                                                selectedSize === size && styles.sizeBoxSelected,
                                                isDark && { borderColor: '#333' }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.sizeText,
                                                isDark && { color: '#94A3B8' },
                                                selectedSize === size && styles.sizeTextSelected
                                            ]}>{size}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}

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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    brandName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    productName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        lineHeight: 22,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1152d4',
    },
    discountBadge: {
        marginTop: 4,
        backgroundColor: '#fee2e2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#ef4444',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 12,
    },
    colorDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    colorDotSelected: {
        borderWidth: 2,
        borderColor: '#1152d4',
        transform: [{ scale: 1.1 }],
    },
    sizeChartText: {
        fontSize: 11,
        color: '#1152d4',
        fontWeight: '600',
    },
    sizeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sizeBox: {
        width: (360 - 80) / 5,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sizeBoxSelected: {
        backgroundColor: '#1152d4',
        borderColor: '#1152d4',
    },
    sizeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    sizeTextSelected: {
        color: '#fff',
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
