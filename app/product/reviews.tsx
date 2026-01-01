import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LuxeHeader } from '@/components/home/LuxeHeader';
import { RatingSummary } from '@/components/reviews/RatingSummary';
import { ReviewFilters } from '@/components/reviews/ReviewFilters';
import { ReviewItem } from '@/components/reviews/ReviewItem';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductReviewsScreen() {
    const insets = useSafeAreaInsets();

    const mockReviews = [
        { id: 1, author: 'Emily Parker', initials: 'EP', colorClass: '#DBEAFE', date: '2 days ago', rating: 5, text: 'The quality of this trench coat is exceptional. Fits true to size and the color is exactly as shown in the pictures. Highly recommend!', helpfulCount: 12 },
        { id: 2, author: 'Michael Chen', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeRMrRf_BHafVXGg0d4VXpRDssxRMCpeVHPIPR5Y8_fM3XateoFM46xwjj_H2KKvI4a7P38QJ6Kgk5gUqANykLNYn1ElrpL0ylkcdbjLtoYNZlRXpExFuBY_G-bTMoU1Mv6JfWRq7_b4AymBEdRRzEcadqEpoT5-92LxDOEFm7BiiUo704mShT0uswZX3mXPTLMEjGr9qKGesyZ4wkkeN7qS0XrUNDcaOKbBmVM_7_caScuquHkabMyW_nowmSNoNlSFjNeuDmqrFp', date: '1 week ago', rating: 4, text: 'Great coat, very stylish. The sleeves are a bit long for me, but otherwise perfect. The water resistance works well in light rain.', helpfulCount: 4, images: ['placeholder1', 'placeholder2'], colorClass: '' },
        { id: 3, author: 'Sarah Jones', initials: 'SJ', colorClass: '#FFE4E6', date: '2 weeks ago', rating: 5, text: 'Absolutely in love! It\'s warm enough for chilly evenings but light enough for spring. The beige color is versatile and goes with everything.', helpfulCount: 8 },
        { id: 4, author: 'David Wilson', initials: 'DW', colorClass: '#D1FAE5', date: '1 month ago', rating: 3, text: 'It\'s okay. The material feels a bit stiffer than I expected. Hopefully it softens up after a few wears. Delivery was fast though.', helpfulCount: 2 },
    ];

    return (
        <View style={styles.container}>
            {/* Header - Reusing Home Header with Back Button */}
            <LuxeHeader showBackButton title="Customer Reviews" />

            <ScrollView contentContainerStyle={{ paddingTop: 60 + insets.top, paddingBottom: 100 }}>
                <RatingSummary
                    rating={4.2}
                    reviewCount={128}
                    distribution={{ 5: 65, 4: 20, 3: 10, 2: 3, 1: 2 }}
                />

                <View style={{ height: 24 }} />
                <ReviewFilters />

                <View style={styles.list}>
                    {mockReviews.map((r) => (
                        <ReviewItem key={r.id} {...r} />
                    ))}
                </View>
            </ScrollView>

            {/* Write Review Footer */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <Pressable style={styles.writeButton}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.writeText}>Write a Review</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingHorizontal: 20,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
    },
    writeButton: {
        height: 56,
        backgroundColor: '#1152d4',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#1152d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    writeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
