import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function ModalLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Slot />
        </View>
    );
}
