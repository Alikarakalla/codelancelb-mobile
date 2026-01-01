import React from 'react';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue,
} from 'react-native-reanimated';
import { LayoutChangeEvent, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
    children: React.ReactNode;
    scrollY: SharedValue<number>;
    delay?: number;
}

export function RevealingItem({ children, scrollY, delay = 0 }: Props) {
    const [layout, setLayout] = React.useState({ y: 0, height: 0 });

    const onLayout = (event: LayoutChangeEvent) => {
        setLayout({
            y: event.nativeEvent.layout.y,
            height: event.nativeEvent.layout.height,
        });
    };

    const animatedStyle = useAnimatedStyle(() => {
        // Entrance from bottom
        const startPoint = layout.y - SCREEN_HEIGHT;
        const endPoint = layout.y - SCREEN_HEIGHT * 0.75;

        // Progress stays at 1 once it passes endPoint
        const progress = interpolate(
            scrollY.value,
            [startPoint, endPoint],
            [0, 1],
            Extrapolate.CLAMP
        );

        const translateY = interpolate(progress, [0, 1], [40, 0]);

        return {
            opacity: progress,
            transform: [{ translateY }],
        };
    }, [layout, scrollY]);

    return (
        <Animated.View onLayout={onLayout} style={animatedStyle}>
            {children}
        </Animated.View>
    );
}
