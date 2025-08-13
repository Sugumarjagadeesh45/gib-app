import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ActivityIndicator,
    ScrollView,
    ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface UserData {
    name?: string;
    phone?: string;
    business_name?: string;
    profile_image?: string;
    team_name?: string;
    type?: string;
    blood_group?: string;
    kootam?: string;
}

const ProfileView: React.FC = () => {
    const [userData, setUserData] = useState<UserData>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [imageUri, setImageUri] = useState<string>('https://www.giberode.com/giberode_app/logo/icon.png'); // Default fallback image

    useFocusEffect(
        useCallback(() => {
            loadData();

            const interval = setInterval(() => {
                loadData();
            }, 5000);

            return () => clearInterval(interval);
        }, [])
    );

    const loadData = async () => {
        const phone = await AsyncStorage.getItem('phone');
        try {
            const res = await fetch('https://www.giberode.com/giberode_app/selected_data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (data.success && data.user) {
                setUserData(data.user);
                setImageUri(data.user.profile_image || 'https://www.giberode.com/giberode_app/logo/icon.png'); // Fallback to default image if no profile image
            }
            setLoading(false);
        } catch (err) {
            console.error('Data fetch error:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00aa00" />
            </View>
        );
    }

    return (
        <View style={{ overflow: 'hidden', height: 300, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
            <ImageBackground source={require('../assets/bg.png')} style={styles.backgroundImage}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.card}>
                        <View style={styles.topRow}>
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.profileImage}
                                onError={() => setImageUri('https://www.giberode.com/giberode_app/logo/icon.png')} // Fallback on error
                            />
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>
                                    {userData?.name || 'Name Not Available'}
                                </Text>
                                <Text style={styles.userDetail}>
                                    🏢 {userData?.business_name || 'Not Available'}
                                </Text>
                                <Text style={styles.userDetail}>
                                    📞 {userData?.phone || 'Not Available'}
                                </Text>
                                <Text style={styles.userDetail}>
                                    🧑‍🤝‍🧑 {userData?.team_name || 'Not Available'}
                                </Text>
                                <Text style={styles.userDetail}>
                                    📛 {userData?.type || 'Not Available'}
                                </Text>
                                <Text style={styles.userDetail}>
                                    🩸 {userData?.blood_group || 'Not Available'}
                                </Text>
                                <Text style={styles.userDetail}>
                                    🏡 {userData?.kootam || 'Not Available'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

export default ProfileView;

const styles = StyleSheet.create({
    backgroundImage: {
        height: 400,
    },
    container: {
        paddingTop: 25,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderColor: 'rgba(255, 255, 255, 0.49)',
        borderWidth: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 120,
        height: 150,
        borderRadius: 35,
        marginRight: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    userDetail: {
        fontSize: 14,
        marginTop: 4,
        color: 'white',
    },
});
