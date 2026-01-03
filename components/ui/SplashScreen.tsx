import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        // Start entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Logo rotation animation
        Animated.loop(
            Animated.timing(logoRotate, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();

        // Shimmer effect
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();

        // Simulate loading progress
        const progressInterval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    // Fade out and finish
                    setTimeout(() => {
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                        }).start(() => {
                            onFinish();
                        });
                    }, 300);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        return () => clearInterval(progressInterval);
    }, []);

    // Update progress bar animation
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: loadingProgress,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [loadingProgress]);

    const spin = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-width, width],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Animated shimmer overlay */}
                <Animated.View
                    style={[
                        styles.shimmer,
                        {
                            transform: [{ translateX: shimmerTranslate }],
                        },
                    ]}
                />

                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Logo container with rotation */}
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                transform: [{ rotate: spin }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['#e94560', '#533483']}
                            style={styles.logoGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialIcons name="shopping-bag" size={60} color="#fff" />
                        </LinearGradient>
                    </Animated.View>

                    {/* App name */}
                    <Text style={styles.appName}>CodeLancelb</Text>
                    <Text style={styles.tagline}>Your Premium Shopping Experience</Text>

                    {/* Loading indicator */}
                    <View style={styles.loadingContainer}>
                        <View style={styles.progressBarBg}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: progressWidth,
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={['#e94560', '#533483', '#e94560']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.progressGradient}
                                />
                            </Animated.View>
                        </View>
                        <Text style={styles.loadingText}>{loadingProgress}%</Text>
                    </View>

                    {/* Loading message */}
                    <Text style={styles.loadingMessage}>
                        {loadingProgress < 30 && 'Initializing...'}
                        {loadingProgress >= 30 && loadingProgress < 60 && 'Loading products...'}
                        {loadingProgress >= 60 && loadingProgress < 90 && 'Preparing your experience...'}
                        {loadingProgress >= 90 && 'Almost ready...'}
                    </Text>
                </Animated.View>

                {/* Decorative circles */}
                <View style={styles.circle1} />
                <View style={styles.circle2} />
                <View style={styles.circle3} />
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        width: width * 0.5,
    },
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoGradient: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#e94560',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    appName: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 60,
        letterSpacing: 0.5,
    },
    loadingContainer: {
        width: width * 0.7,
        alignItems: 'center',
    },
    progressBarBg: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 10,
    },
    progressGradient: {
        flex: 1,
        borderRadius: 10,
    },
    loadingText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
        letterSpacing: 1,
    },
    loadingMessage: {
        marginTop: 20,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    // Decorative circles
    circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        top: -50,
        right: -50,
    },
    circle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(83, 52, 131, 0.1)',
        bottom: 50,
        left: -30,
    },
    circle3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(233, 69, 96, 0.15)',
        bottom: 200,
        right: 30,
    },
});
