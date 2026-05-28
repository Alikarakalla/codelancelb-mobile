import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface WorldCupCounterProps {
    data?: {
        target_date?: string;
        title?: string;
        hosts?: string[];
    };
}

const getParts = (targetDate?: string) => {
    const target = targetDate ? new Date(targetDate).getTime() : new Date('2026-06-11T00:00:00Z').getTime();
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return { days, hours, minutes };
};

export function WorldCupCounter({ data }: WorldCupCounterProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [now, setNow] = useState(Date.now());
    const parts = useMemo(() => getParts(data?.target_date), [data?.target_date, now]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <Text style={[styles.eyebrow, isDark && styles.muted]}>{(data?.hosts || ['United States', 'Mexico', 'Canada']).join(' / ')}</Text>
            <Text style={[styles.title, isDark && styles.light]}>{data?.title || 'FIFA World Cup 2026'}</Text>
            <View style={styles.countdown}>
                <CounterCell label="Days" value={parts.days} />
                <CounterCell label="Hours" value={parts.hours} />
                <CounterCell label="Min" value={parts.minutes} />
            </View>
            <Pressable style={styles.cta} onPress={() => router.push('/shop')}>
                <Text style={styles.ctaText}>Shop the Collection</Text>
            </Pressable>
        </View>
    );
}

function CounterCell({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.cell}>
            <Text style={styles.value}>{String(value).padStart(2, '0')}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginVertical: 28,
        padding: 20,
        borderRadius: 8,
        backgroundColor: '#0f172a',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    eyebrow: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 18,
    },
    countdown: {
        flexDirection: 'row',
        gap: 10,
    },
    cell: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.10)',
        alignItems: 'center',
    },
    value: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
    },
    label: {
        color: 'rgba(255,255,255,0.68)',
        fontSize: 11,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    cta: {
        alignSelf: 'flex-start',
        marginTop: 18,
        minHeight: 42,
        paddingHorizontal: 18,
        borderRadius: 5,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    light: {
        color: '#fff',
    },
    muted: {
        color: 'rgba(255,255,255,0.65)',
    },
});
