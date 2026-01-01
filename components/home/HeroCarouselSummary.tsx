import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2; // (Screen - padding - gap) / 2

interface SummaryProps {
    slides: any[];
    activeIndex: number;
}

export function HeroCarouselSummary({ slides, activeIndex }: SummaryProps) {
    const currentSlide = slides[activeIndex];
    const nextSlide = slides[(activeIndex + 1) % slides.length];

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Image
                    source={{ uri: currentSlide.image }}
                    style={styles.image}
                />
                <View style={[StyleSheet.absoluteFill, styles.overlay]} />
                <View style={styles.textContainer}>
                    <Text style={styles.subtitle}>0{activeIndex + 1} / CURRENT</Text>
                    <Text style={styles.title} numberOfLines={2}>{currentSlide.title}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Image
                    source={{ uri: nextSlide.image }}
                    style={styles.image}
                />
                <View style={[StyleSheet.absoluteFill, styles.overlay]} />
                <View style={styles.textContainer}>
                    <Text style={styles.subtitle}>0{((activeIndex + 1) % slides.length) + 1} / NEXT</Text>
                    <Text style={styles.title} numberOfLines={2}>{nextSlide.title}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        marginTop: 20, // Add margin from carousel as requested
        zIndex: 10,
        marginBottom: 20,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 0.75,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1a1a1a',
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.8,
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    textContainer: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    title: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        lineHeight: 14,
    }
});
