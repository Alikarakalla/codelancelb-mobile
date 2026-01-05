import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReviewItemProps {
    author: string;
    avatar?: string;
    initials?: string;
    date: string;
    rating: number;
    text: string;
    images?: string[];
    helpfulCount: number;
    colorClass: string; // for avatar bg
}

export function ReviewItem(props: ReviewItemProps) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.authorRow}>
                    {props.avatar ? (
                        <Image source={{ uri: props.avatar }} style={styles.avatarImg} />
                    ) : (
                        <View style={[styles.avatarBox, { backgroundColor: props.colorClass }]}>
                            <Text style={[styles.avatarText, { color: darken(props.colorClass) }]}>{props.initials}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={styles.authorName}>{props.author}</Text>
                        <View style={styles.metaRow}>
                            <View style={styles.stars}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Ionicons key={s} name="star" size={12} color={s <= props.rating ? "#FBBF24" : "#E2E8F0"} />
                                ))}
                            </View>
                            <Text style={styles.date}>{props.date}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Content */}
            <Text style={styles.text}>{props.text}</Text>

            {/* Images */}
            {props.images && (
                <View style={styles.imagesRow}>
                    {props.images.map((img, idx) => (
                        <View key={idx} style={styles.reviewImageContainer}>
                            <View style={styles.reviewImagePlaceholder} />
                            {/* Placeholder color or real image */}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

// Helper to simulate darker text for colored avatars
function darken(color: string) {
    if (color === '#DBEAFE') return '#2563EB'; // blue-100 -> blue-600
    if (color === '#FFE4E6') return '#E11D48'; // rose-100 -> rose-600
    if (color === '#D1FAE5') return '#059669'; // emerald-100 -> emerald-600
    return '#475569';
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    authorRow: {
        flexDirection: 'row',
        gap: 12,
    },
    avatarImg: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
    },
    authorName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    stars: {
        flexDirection: 'row',
        gap: 1,
    },
    date: {
        fontSize: 12,
        color: '#94A3B8',
    },
    text: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 24,
    },
    imagesRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    reviewImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
    },
    reviewImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E2E8F0',
    },
    footer: {
        marginTop: 12,
    },
    helpfulBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    helpfulText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94A3B8',
    },
});
