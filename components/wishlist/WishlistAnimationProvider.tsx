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
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Point {
    x: number;
    y: number;
}

interface WishlistAnimationContextType {
    triggerAnimation: (startPoint: Point, onLand?: () => void) => void;
    setTargetPoint: (point: Point) => void;
}

const WishlistAnimationContext = createContext<WishlistAnimationContextType | undefined>(undefined);

export function WishlistAnimationProvider({ children }: { children: React.ReactNode }) {
    const [animations, setAnimations] = useState<{ id: number; start: Point; onLand?: () => void }[]>([]);
    // Estimate Wishlist tab position (4th item in a 5-tab layout = ~70% width)
    const targetPoint = useRef<Point>({
        x: SCREEN_WIDTH * 0.625,
        y: SCREEN_HEIGHT - (Platform.OS === 'ios' ? 70 : 50)
    });
    const nextId = useRef(0);

    const setTargetPoint = useCallback((point: Point) => {
        targetPoint.current = point;
    }, []);

    const triggerAnimation = useCallback((startPoint: Point, onLand?: () => void) => {
        const id = nextId.current++;
        setAnimations(prev => [...prev, { id, start: startPoint, onLand }]);
    }, []);

    const removeAnimation = useCallback((id: number) => {
        setAnimations(prev => prev.filter(a => a.id !== id));
    }, []);

    return (
        <WishlistAnimationContext.Provider value={{ triggerAnimation, setTargetPoint }}>
            {children}
            {animations.map(anim => (
                <FlyingHeart
                    key={anim.id}
                    start={anim.start}
                    target={targetPoint.current}
                    onLand={anim.onLand}
                    onComplete={() => removeAnimation(anim.id)}
                />
            ))}
        </WishlistAnimationContext.Provider>
    );
}

function FlyingHeart({ start, target, onLand, onComplete }: { start: Point; target: Point; onLand?: () => void; onComplete: () => void }) {
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
        const yOffset = -150 * Math.sin(Math.PI * progress.value);
        const y = start.y + (target.y - start.y) * progress.value + yOffset;

        return {
            position: 'absolute',
            left: x - 18, // Adjusted to match 36px container
            top: y - 18,  // Adjusted to match 36px container
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            zIndex: 9999,
        };
    });

    return (
        <Animated.View style={animatedStyle} pointerEvents="none">
            <View style={styles.bagContainer}>
                <MaterialIcons name="favorite" size={24} color="#ef4444" />
            </View>
        </Animated.View>
    );
}

export function useWishlistAnimation() {
    const context = useContext(WishlistAnimationContext);
    if (!context) {
        throw new Error('useWishlistAnimation must be used within a WishlistAnimationProvider');
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
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    }
});
