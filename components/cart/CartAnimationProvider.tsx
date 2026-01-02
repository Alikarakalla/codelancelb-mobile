import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
    Easing
} from 'react-native-reanimated';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Point {
    x: number;
    y: number;
}

interface CartAnimationContextType {
    triggerCartAnimation: (startPoint: Point, onLand?: () => void) => void;
    setCartTargetPoint: (point: Point) => void;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
    const [animations, setAnimations] = useState<{ id: number; start: Point; onLand?: () => void }[]>([]);
    // Default estimate for cart icon in GlobalHeader (top right)
    const targetPoint = useRef<Point>({
        x: SCREEN_WIDTH - 40,
        y: Platform.OS === 'ios' ? 60 : 40
    });
    const nextId = useRef(0);

    const setCartTargetPoint = useCallback((point: Point) => {
        targetPoint.current = point;
    }, []);

    const triggerCartAnimation = useCallback((startPoint: Point, onLand?: () => void) => {
        const id = nextId.current++;
        setAnimations(prev => [...prev, { id, start: startPoint, onLand }]);
    }, []);

    const removeAnimation = useCallback((id: number) => {
        setAnimations(prev => prev.filter(a => a.id !== id));
    }, []);

    return (
        <CartAnimationContext.Provider value={{ triggerCartAnimation, setCartTargetPoint }}>
            {children}
            {animations.map(anim => (
                <FlyingBag
                    key={anim.id}
                    start={anim.start}
                    target={targetPoint.current}
                    onLand={anim.onLand}
                    onComplete={() => removeAnimation(anim.id)}
                />
            ))}
        </CartAnimationContext.Provider>
    );
}

function FlyingBag({ start, target, onLand, onComplete }: { start: Point; target: Point; onLand?: () => void; onComplete: () => void }) {
    const progress = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(1);

    React.useEffect(() => {
        // Snappy scale in
        scale.value = withTiming(1.8, { duration: 100 });

        // Fast flight
        progress.value = withTiming(1, {
            duration: 400,
            easing: Easing.bezier(0.2, 1, 0.4, 1)
        }, () => {
            if (onLand) runOnJS(onLand)();
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);

            // Fast fade out on landing
            scale.value = withTiming(0, { duration: 100 });
            opacity.value = withTiming(0, { duration: 100 }, () => {
                runOnJS(onComplete)();
            });
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const x = start.x + (target.x - start.x) * progress.value;
        // Inverted arc for cart (since it's moving up)
        const yOffset = -80 * Math.sin(Math.PI * progress.value);
        const y = start.y + (target.y - start.y) * progress.value + yOffset;

        return {
            position: 'absolute',
            left: x - 18, // Center 36px wide container
            top: y - 18,  // Center 36px high container
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            zIndex: 9999,
        };
    });

    return (
        <Animated.View style={animatedStyle} pointerEvents="none">
            <View style={styles.bagContainer}>
                <Feather name="shopping-bag" size={20} color="#18181B" />
            </View>
        </Animated.View>
    );
}

export function useCartAnimation() {
    const context = useContext(CartAnimationContext);
    if (!context) {
        throw new Error('useCartAnimation must be used within a CartAnimationProvider');
    }
    return context;
}

const styles = StyleSheet.create({
    bagContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#fff',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    }
});
