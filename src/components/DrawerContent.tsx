import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';


interface UserData {
  name?: string;
  profile_image?: string;
}

export default function DrawerContent(props: DrawerContentComponentProps) {
  const [userData, setUserData] = useState<UserData>({});
  const [loading, setLoading] = useState(true); 

useEffect(() => {
  const loadUserData = async () => {
    const phone = await AsyncStorage.getItem('phone');
    try {
      const res = await fetch('https://www.giberode.com/giberode_app/selected_data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUserData({
          name: data.user.name,
          profile_image: data.user.profile_image,
        });
      }
    } catch (error) {
      console.error('Drawer fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  loadUserData();
  const intervalId = setInterval(() => {
    loadUserData();
  }, 5000);

  return () => clearInterval(intervalId);
}, []);


  return (
    <>
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : (
          <>
            <Image
              source={
                userData.profile_image
                  ? { uri: userData.profile_image }
                  : require('../assets/icon.png')
              }
              style={styles.profileImage}
            />
            <Text style={styles.userName}>{userData.name}</Text>
          </>
        )}
      </View>

      {/* <DrawerItemList {...props} /> */}

    <TouchableOpacity
  style={styles.logoutButton}
  onPress={() => props.navigation.navigate('LogoutScreen')}
>
  <Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>


  
    </DrawerContentScrollView>
        <View style={styles.header}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Text style={styles.welcomeText}>Gounders In Business</Text>
        <Text style={styles.tagline}>
          உறவுகளை வளர்போம்!{'\n'}கலாச்சாரத்தை மீட்டெடுப்போம்!!
        </Text>
      </View>
      </>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
  backgroundColor: '#E53935',
  marginHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 30,
  alignItems: 'center',
  marginTop: 20,
  elevation: 2, // for Android shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
},
logoutText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
    
  },
profileImage: {
  width: 100,
  height: 100,
  borderRadius: 50, // perfect circle
  marginBottom: 12,
  // borderWidth: 2,
  borderColor: '#4CAF50', // elegant green border
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5, // for Android shadow
  backgroundColor: '#fff', // fallback in case image fails
},

  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 10,
    marginBottom:50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4E9F3D',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
