import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ImageBackground } from 'react-native';

const COLLECTIONS = [
    {
        id: 1,
        name: 'Timeless Jewelry',
        count: '124 Items',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzVAwvpmtVw17lzWWmIrlh8EW_3499RkXMs6DRgAoh9uBN1sQ5S7W_4S_V_7ySLC2D58U4GRPEDfq-ZZ6AgmqmHlSyPBmaKm1A5xlqduOqbqUGjk-6T3friMsqY5psnPpMq2kUr12aubYBo5HeXN0VQcjgF3Vr6sgFf-IoPrlx2isKvcvnRB0DL1ogbwO2yD7GRT6XiCngshpyRglDyw7b7RAbUlewjZD9q_v4HgFsUYiUZGJEV-ckaF51LJahPgZPmVkr77p0wkmJ',
    },
    {
        id: 2,
        name: 'Urban Streetwear',
        count: '85 Items',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDceUPyxSQ4Dhl3-7Xf5-UkXypYG3fdAl5AzFv1CTkGxONUUKTsRiK1FpAr61o7GH6dn0_TZRRyIcbMpvVma9ryZCgMKLv52XzOKMLMU48ComgRUe6j9lYk5hsYr1qQTlDvVzQQ6zbfGCXHaxZGEbMwJqK3zz3pIEfjgTVF3lbb4fuz6XRiccbnGQSPjhEFOYHA-N84s2ywYxWkcE89JWW3XJdlvcf_3ssM8L1uUEaJWJimKbmuxj7yB_Ck-BKvU6GIGAfa629Vt4Et',
    },
    {
        id: 3,
        name: 'Office Essentials',
        count: '56 Items',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3oYSTxRSGSst827hns1rSyGqVfYRK_rzgQC9uUvhFmRLXbokTeoKYIEVrZinS2XbB6TgJbMdwqAKLK1MwKU8Ld9rCsG5ko7PUNByPAmip3Y1HRyndJKalFiPsyuOJ7Lf-sM7GP6gWaKjrzQgYiQiyYffHL5PEcnHZMRrvnvoBPnYeZ7XccHvLVRXNPQoGt9Qvjk_S8-JyOXEKhQCOXNiUSo5zVOETuoBTTRzMEfFJNJlDJRm9Ish0st48R3sZKhgc1iZgPnMLGUvr',
    },
];

export function CollectionCarousel() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Trending Collections</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {COLLECTIONS.map((c) => (
                    <Pressable key={c.id} style={styles.card}>
                        <View style={styles.imageContainer}>
                            <ImageBackground source={{ uri: c.image }} style={styles.image} resizeMode="cover" />
                            <View style={styles.overlay} />
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{c.name}</Text>
                            <Text style={styles.count}>{c.count}</Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 16,
    },
    card: {
        width: 200,
        gap: 12,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 4 / 5,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    info: {},
    name: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },
    count: {
        fontSize: 12,
        color: '#64748B',
    },
});
