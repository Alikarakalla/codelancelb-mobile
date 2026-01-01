import React from 'react';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue,
    withTiming,
    useDerivedValue
} from 'react-native-reanimated';
import { View, LayoutChangeEvent, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
    children: React.ReactNode | ((progress: SharedValue<number>) => React.ReactNode);
    scrollY: SharedValue<number>;
    index: number;
    animationType?: 'fade-up' | 'zoom-in' | 'slide-left' | 'slide-right' | 'reveal' | 'none';
    style?: any;
}

export function RevealingSection({ children, scrollY, index, animationType = 'fade-up', style }: Props) {
    const [layout, setLayout] = React.useState({ y: 0, height: 0 });

    const onLayout = (event: LayoutChangeEvent) => {
        setLayout({
            y: event.nativeEvent.layout.y,
            height: event.nativeEvent.layout.height,
        });
    };

    const progress = useDerivedValue(() => {
        // Entrance from bottom (scrolling down)
        const startPoint = layout.y - SCREEN_HEIGHT;
        const endPoint = layout.y - SCREEN_HEIGHT * 0.7;

        return interpolate(
            scrollY.value,
            [startPoint, endPoint],
            [0, 1],
            Extrapolate.CLAMP
        );
    });

    const animatedStyle = useAnimatedStyle(() => {
        let transform = [];

        if (animationType === 'fade-up') {
            const translateY = interpolate(progress.value, [0, 1], [100, 0]);
            transform.push({ translateY });
        } else if (animationType === 'zoom-in') {
            const scale = interpolate(progress.value, [0, 1], [0.85, 1]);
            const translateY = interpolate(progress.value, [0, 1], [50, 0]);
            transform.push({ scale }, { translateY });
        } else if (animationType === 'slide-left') {
            const translateX = interpolate(progress.value, [0, 1], [-150, 0]);
            transform.push({ translateX });
        } else if (animationType === 'slide-right') {
            const translateX = interpolate(progress.value, [0, 1], [150, 0]);
            transform.push({ translateX });
        } else if (animationType === 'reveal') {
            const rotateX = interpolate(progress.value, [0, 1], [30, 0]);
            const translateY = interpolate(progress.value, [0, 1], [80, 0]);
            transform.push({ rotateX: `${rotateX}deg` }, { translateY });
        } else if (animationType === 'none') {
            // No transform for 'none' type
        }

        return {
            opacity: progress.value,
            transform,
        };
    }, [layout, animationType]);

    return (
        <Animated.View onLayout={onLayout} style={[style, animatedStyle]}>
            {typeof children === 'function' ? children(progress) : children}
        </Animated.View>
    );
}
