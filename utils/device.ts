import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'secure_device_id';

export const getDeviceId = async (): Promise<string> => {
    try {
        // 1. Try to get existing ID
        let uuid = await SecureStore.getItemAsync(DEVICE_ID_KEY);

        // 2. If no ID exists, create one
        if (!uuid) {
            uuid = Crypto.randomUUID();
            await SecureStore.setItemAsync(DEVICE_ID_KEY, uuid);
        }

        return uuid;
    } catch (error) {
        console.error('Error getting device ID:', error);
        // Fallback if SecureStore fails (e.g. dev client issues)
        return 'fallback-' + Platform.OS + '-' + Math.random().toString(36).slice(2);
    }
};
