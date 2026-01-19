import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
    isReady: boolean;
}

export default function SplashScreen({ onFinish, isReady }: SplashScreenProps) {
    const opacity = useSharedValue(1);
    const scale = useSharedValue(0.9);
    const textOpacity = useSharedValue(0);
    const [minTimePassed, setMinTimePassed] = React.useState(false);

    useEffect(() => {
        // Animation sequence
        scale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
        textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

        // Ensure minimum duration of 2 seconds
        const timer = setTimeout(() => {
            setMinTimePassed(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isReady && minTimePassed) {
            opacity.value = withTiming(0, { duration: 500 }, (finished) => {
                if (finished) {
                    runOnJS(onFinish)();
                }
            });
        }
    }, [isReady, minTimePassed]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.content}>
                <Animated.View style={logoStyle}>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={styles.logo}
                        contentFit="contain"
                    />
                </Animated.View>

                <Animated.Text style={[styles.appName, textStyle]}>
                    LUXE
                </Animated.Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#ffffff',
        zIndex: 99999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    logo: {
        width: width * 0.4,
        height: width * 0.2,
    },
    appName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000000',
        letterSpacing: 4,
        textTransform: 'uppercase',
    }
});
