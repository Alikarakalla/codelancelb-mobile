import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions, LayoutChangeEvent } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    Extrapolate,
    SharedValue
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
    scrollY?: SharedValue<number>;
}

export function StorefrontBanner({ scrollY }: Props) {
    const [containerY, setContainerY] = React.useState(0);

    const onLayout = (event: LayoutChangeEvent) => {
        setContainerY(event.nativeEvent.layout.y);
    };

    const shopButtonStyle = useAnimatedStyle(() => {
        if (!scrollY) return { opacity: 1 };

        const start = containerY - SCREEN_HEIGHT * 0.8;
        const end = containerY - SCREEN_HEIGHT * 0.5;

        const progress = interpolate(
            scrollY.value,
            [start, end],
            [0, 1],
            Extrapolate.CLAMP
        );

        return {
            opacity: progress,
            transform: [{ translateX: interpolate(progress, [0, 1], [-20, 0]) }]
        };
    }, [containerY, scrollY]);

    return (
        <View onLayout={onLayout} style={styles.container}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.image}
                resizeMode="cover"
            />

            <View style={styles.overlay}>
                <Animated.View style={shopButtonStyle}>
                    <Pressable style={styles.shopButton}>
                        <Text style={styles.shopText}>SHOP NOW</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 1.2,
        backgroundColor: '#f1f5f9',
        overflow: 'hidden',
        marginTop: 20,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    shopButton: {
        width: 120,
        height: 48,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    shopText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
    }
});
