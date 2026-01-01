import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';

const RELATED = [
    { id: 1, name: 'Suede Loafers', price: 110, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoVW81NuhvapFrzuV9CvsDJ6eptrPodyQmTYXz3aT_t8WPXyb2C-3ImCXwcU4Tm_zpRNq5p4XWT20_6Ni8pqzEWXh4CPVH35ykxGjlona0T8Gu5VrkyGO-Jv-DBOvCpi0dyEO2-0JUCPLyNxEU-ZAiiFkFwga8hXFa8n2Iw1Ur8ikch6uv6BR94MuTEyPuX-_ujdFNc2tw6tnS6qt2eBV5scx7Uw75NWL1PD6hXg_V3NqdXmq3amoyNC2a4qFyEqt89oZuKhjohf5S' },
    { id: 2, name: 'Leather Tote', price: 120, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxwS98HYL0TbUR0aK5NFKRNB9SDgrdV7XVL6fM38cASnCDdAKuoPNIGyIiqVr3CwtXntL7Cpxpw6YFZk6dxCvMOlomZyarrD1RlDQp6HlFQCHRe7shdzYa8R_K51MKYF63DelKGD6nl1D5-bPpRQ6ASK2ehr2iNmiHNQBUO25vQVD3SsCeMRC14erpfCUa4J4XvD-jAp70UxKds8VrfcnnKAcpZ6CZTUC9RVjEXAsOWpZqrSEJUIFvpVyodoW3HeMBkLBEOh_za14s' },
    { id: 3, name: 'Chronograph', price: 250, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS3YiA1qmFnAjiS0dAmZzWR_9jwBPFnAEtjrHbms0Z7od1X4RUeWgE5bh1Jwq4k1omR3pUzBDBAjyFNgc43RNAgkDPtJ3kqbCevf20uaUff6X3ZErPBFtowcMDyPq0Bt-g4WNis63fo5KA3uPnfUCvKG71quoZAhdSPc2khU3HCqRe5SubpQZFbZI2Tj_BLf_IxJGTyAqs1MD45V0nOrKWUljMpYgAMNERTDi8ka7mdXF8R_WnhKL-UbePTkTKH0rbx5MMqmjCeLF4' },
];

export function RelatedProducts() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Related Products</Text>
                <Text style={styles.seeAll}>See All</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {RELATED.map((item) => (
                    <Pressable key={item.id} style={styles.card}>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                        </View>
                        <View>
                            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1152d4',
    },
    scroll: {
        paddingHorizontal: 20,
        gap: 16,
    },
    card: {
        width: 140,
        gap: 8,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    price: {
        fontSize: 12,
        color: '#64748B',
    },
});
