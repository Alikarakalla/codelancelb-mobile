import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    SharedValue,
    measure,
    useAnimatedRef,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
} from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export interface OrderTimelineMilestone {
    year: string;
    title: string;
    description: string;
}

interface OrderTimelineProps {
    scrollY: SharedValue<number>;
    milestones?: OrderTimelineMilestone[];
    heading?: string | null;
    theme?: 'football' | 'lego';
    footballSrc?: string;
    legoSrc?: string;
}

const DEFAULT_FOOTBALL_SRC =
    'https://mrfootball-lb.com/cdn/shop/files/3D-football-isolated-on-transparent-background-PNG.png?v=1760938206&width=120';

const DEFAULT_MILESTONES: OrderTimelineMilestone[] = [
    {
        year: 'Today',
        title: 'Order Placed',
        description: "We've received your order and our team's getting ready to kick things off.",
    },
    {
        year: 'Within 24–48 hours',
        title: 'In Progress',
        description: 'Your jersey is being customized with your name and number.',
    },
    {
        year: 'Within 1 week',
        title: 'Order Dispatched',
        description: 'Your order has been shipped and is heading straight to you.',
    },
    {
        year: 'Within 3 weeks',
        title: 'Order Delivered',
        description: "The wait's over — your kit has arrived.",
    },
];

const MARKER_SIZE = 56;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const ACCENT_FOOTBALL = '#27831b';
const ACCENT_LEGO = '#e10600';
const DOT_BORDER_FOOTBALL = '#ffe000';
const DOT_BORDER_LEGO = '#ffe000';

interface MilestoneItemProps {
    item: OrderTimelineMilestone;
    index: number;
    centersSv: SharedValue<number[]>;
    scrollY: SharedValue<number>;
    isFirst: boolean;
    isLast: boolean;
    accent: string;
    dotBorder: string;
    isDark: boolean;
}

function MilestoneItem({
    item,
    index,
    centersSv,
    scrollY,
    isFirst,
    isLast,
    accent,
    dotBorder,
    isDark,
}: MilestoneItemProps) {
    const dotRef = useAnimatedRef<Animated.View>();
    // Gate measure() with a shared flag so we don't trigger the Reanimated
    // "view has undefined LayoutMetrics" warning before the dot has been laid out.
    const isLaidOut = useSharedValue(false);

    useDerivedValue(() => {
        // Re-run whenever scroll changes; measure() returns current screen position.
        scrollY.value;
        if (!isLaidOut.value) return;
        const measured = measure(dotRef);
        if (!measured) return;
        const centerY = measured.pageY + measured.height / 2;
        const next = [...centersSv.value];
        next[index] = centerY;
        centersSv.value = next;
    }, [scrollY]);

    return (
        <View style={styles.milestone}>
            <View style={[styles.connector, isFirst && styles.connectorFirst, isLast && styles.connectorLast]}>
                <Animated.View
                    ref={dotRef}
                    onLayout={() => {
                        isLaidOut.value = true;
                    }}
                    style={[
                        styles.dot,
                        { backgroundColor: accent, borderColor: dotBorder },
                    ]}
                />
            </View>
            <View style={[styles.card, isDark && styles.cardDark]}>
                <Text style={[styles.year, { color: accent }]}>{item.year.toUpperCase()}</Text>
                <Text style={[styles.title, isDark && styles.titleDark]}>{item.title}</Text>
                <Text style={[styles.description, isDark && styles.descriptionDark]}>{item.description}</Text>
            </View>
        </View>
    );
}

export function OrderTimeline({
    scrollY,
    milestones = DEFAULT_MILESTONES,
    heading = null,
    theme = 'football',
    footballSrc = DEFAULT_FOOTBALL_SRC,
    legoSrc,
}: OrderTimelineProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const wrapperRef = useAnimatedRef<Animated.View>();
    const centersSv = useSharedValue<number[]>([]);
    const wrapperLaidOut = useSharedValue(false);

    const accent = theme === 'lego' ? ACCENT_LEGO : ACCENT_FOOTBALL;
    const dotBorder = theme === 'lego' ? DOT_BORDER_LEGO : DOT_BORDER_FOOTBALL;
    const markerSrc = theme === 'lego' ? legoSrc : footballSrc;

    const markerTop = useDerivedValue(() => {
        scrollY.value; // dependency to trigger re-measure
        if (!wrapperLaidOut.value) return 0;
        const wrapper = measure(wrapperRef);
        if (!wrapper) return 0;
        const centers = centersSv.value;
        if (!centers.length) return 0;

        const viewportCenterPageY = SCREEN_HEIGHT / 2;
        let closestIdx = 0;
        let closestDistance = Infinity;
        for (let i = 0; i < centers.length; i++) {
            const c = centers[i];
            if (c == null) continue;
            const d = Math.abs(c - viewportCenterPageY);
            if (d < closestDistance) {
                closestDistance = d;
                closestIdx = i;
            }
        }
        const target = centers[closestIdx];
        if (target == null) return 0;
        const local = target - wrapper.pageY;
        return Math.max(0, Math.min(wrapper.height, local));
    }, [scrollY]);

    const markerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: markerTop.value - MARKER_SIZE / 2 }],
    }));

    const progressStyle = useAnimatedStyle(() => ({
        height: markerTop.value,
    }));

    const milestoneItems = useMemo(() => milestones, [milestones]);

    return (
        <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.heading, isDark && styles.headingDark]}>
                {heading ?? 'Order Journey'}
            </Text>

            <Animated.View
                ref={wrapperRef}
                onLayout={() => {
                    wrapperLaidOut.value = true;
                }}
                style={styles.wrapper}
            >
                <View style={styles.lineRail} pointerEvents="none">
                    <View style={[styles.lineTrack, isDark && styles.lineTrackDark]} />
                    <Animated.View style={[styles.lineProgress, { backgroundColor: accent }, progressStyle]} />
                </View>

                <Animated.View style={[styles.marker, markerStyle]} pointerEvents="none">
                    {markerSrc ? (
                        <Image
                            source={{ uri: markerSrc }}
                            style={styles.markerImage}
                            contentFit="contain"
                            transition={0}
                        />
                    ) : (
                        <View style={styles.markerFallback}>
                            <Text style={styles.markerFallbackText}>{theme === 'lego' ? '🧱' : '⚽'}</Text>
                        </View>
                    )}
                </Animated.View>

                <View style={styles.milestonesList}>
                    {milestoneItems.map((item, index) => (
                        <MilestoneItem
                            key={`${item.title}-${index}`}
                            item={item}
                            index={index}
                            centersSv={centersSv}
                            scrollY={scrollY}
                            isFirst={index === 0}
                            isLast={index === milestoneItems.length - 1}
                            accent={accent}
                            dotBorder={dotBorder}
                            isDark={isDark}
                        />
                    ))}
                </View>
            </Animated.View>
        </View>
    );
}

const RAIL_WIDTH = 3;
const CONNECTOR_HEIGHT = 132;
const CONNECTOR_FIRST_HEIGHT = 64;

const styles = StyleSheet.create({
    section: {
        paddingVertical: 28,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
    },
    sectionDark: {
        backgroundColor: '#000',
    },
    heading: {
        fontSize: 27,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 18,
        lineHeight: 33,
    },
    headingDark: {
        color: '#F8FAFC',
    },
    wrapper: {
        position: 'relative',
        paddingVertical: 28,
        alignItems: 'center',
    },
    lineRail: {
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: RAIL_WIDTH,
        marginLeft: -RAIL_WIDTH / 2,
        borderRadius: RAIL_WIDTH,
        overflow: 'hidden',
    },
    lineTrack: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#E5E7EB',
        borderRadius: RAIL_WIDTH,
    },
    lineTrackDark: {
        backgroundColor: '#1F2937',
    },
    lineProgress: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        borderRadius: RAIL_WIDTH,
    },
    marker: {
        position: 'absolute',
        left: '50%',
        top: 0,
        marginLeft: -MARKER_SIZE / 2,
        width: MARKER_SIZE,
        height: MARKER_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
    },
    markerImage: {
        width: MARKER_SIZE,
        height: MARKER_SIZE,
    },
    markerFallback: {
        width: MARKER_SIZE,
        height: MARKER_SIZE,
        borderRadius: MARKER_SIZE / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    markerFallbackText: {
        fontSize: 30,
    },
    milestonesList: {
        width: '100%',
        alignItems: 'center',
    },
    milestone: {
        width: '100%',
        alignItems: 'center',
    },
    connector: {
        width: '100%',
        height: CONNECTOR_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    connectorFirst: {
        height: CONNECTOR_FIRST_HEIGHT,
    },
    connectorLast: {
        // same as default
    },
    dot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 3,
        zIndex: 3,
        shadowColor: '#27831b',
        shadowOpacity: 0.25,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 0 },
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 22,
        paddingBottom: 24,
        alignItems: 'center',
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        elevation: 3,
    },
    cardDark: {
        backgroundColor: '#0B1220',
        shadowOpacity: 0.4,
    },
    year: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 10,
        textAlign: 'center',
    },
    title: {
        fontSize: 21,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 28,
        marginBottom: 12,
        textAlign: 'center',
    },
    titleDark: {
        color: '#F8FAFC',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: '#666666',
        textAlign: 'center',
    },
    descriptionDark: {
        color: '#94A3B8',
    },
});
