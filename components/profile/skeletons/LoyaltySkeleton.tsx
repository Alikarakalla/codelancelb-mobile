import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Skeleton } from '@/components/ui/SkeletonLoader';
import { LinearGradient } from 'expo-linear-gradient';

export function LoyaltySkeleton() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            <Skeleton width={150} height={24} borderRadius={8} style={{ marginBottom: 16 }} />

            <LinearGradient
                colors={['#1152d4', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Decorative Circles */}
                <View style={[styles.circle, styles.topCircle]} />
                <View style={[styles.circle, styles.bottomCircle]} />

                <View style={styles.content}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View>
                            <Skeleton width={100} height={14} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                            <View style={{ height: 8 }} />
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                                <Skeleton width={80} height={32} borderRadius={8} style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
                                <Skeleton width={40} height={18} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                            </View>
                        </View>
                        <Skeleton width={90} height={28} borderRadius={8} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                    </View>

                    {/* Progress Section */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressLabels}>
                            <Skeleton width={60} height={12} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                            <Skeleton width={120} height={12} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        </View>
                        <View style={{ height: 8 }} />
                        <View style={styles.progressBarBg}>
                            <Skeleton width="60%" height={8} borderRadius={4} style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} />
                        </View>
                    </View>

                    {/* Button */}
                    <Skeleton width="100%" height={48} borderRadius={12} style={{ backgroundColor: 'rgba(255,255,255,0.9)' }} />
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    topCircle: {
        width: 128,
        height: 128,
        top: -40,
        right: -40,
    },
    bottomCircle: {
        width: 96,
        height: 96,
        bottom: -20,
        left: -20,
    },
    content: {
        zIndex: 1,
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    progressContainer: {
        gap: 8,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
});
