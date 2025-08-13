import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useFocusEffect } from '@react-navigation/native';
import UserScore from '../components/UserScore';
import EditProfileModal from '../components/EditProfileModal';

const ProfileScreen = ({ onForceReload }: { onForceReload?: () => void }) => {
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Personal' | 'Business'>('Personal');
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [confirmBeforeUpload, setConfirmBeforeUpload] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(Date.now());

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchUserPhone = async () => {
        try {
          const phone = await AsyncStorage.getItem('phone');
          if (phone) {
            setUserPhone(phone);
            fetchUserData(phone);
          } else {
            setError('Phone number not found in storage.');
            setLoading(false);
          }
        } catch {
          setError('Failed to retrieve phone number.');
          setLoading(false);
        }
      };
      fetchUserPhone();
    }, [])
  );

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setReloadKey(Date.now());
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  const fetchUserData = async (phone: string) => {
    try {
      const response = await fetch('https://www.giberode.com/giberode_app/selected_data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (data.success) {
        setUserData(data.user);
        setImageUri(data.user.profile_image);
        await AsyncStorage.setItem('profile_image', data.user.profile_image);
      } else {
        setError(data.message || 'User not found.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel || response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Image selection failed.');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setLocalImagePreview(uri);
        setImageRotation(0);
        setConfirmBeforeUpload(true);
      }
    });
  };

  const uploadImage = async (originalUri: string) => {
    if (!userPhone || !originalUri) return;

    setImageUploading(true);

    try {
      const rotatedImage = await ImageResizer.createResizedImage(
        originalUri,
        400,
        400,
        'JPEG',
        100,
        imageRotation
      );

      const formData = new FormData();
      formData.append('phone', userPhone);
      formData.append('profile_image', {
        uri: rotatedImage.uri,
        name: `profile_${userPhone}.jpg`,
        type: 'image/jpeg',
      } as any);

      const response = await fetch('https://www.giberode.com/giberode_app/upload_image.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        Alert.alert('Success', 'Rotated image uploaded successfully!');
        setImageUri(data.image_url);
        setLocalImagePreview(null);
        await AsyncStorage.setItem('profile_image', data.image_url);

        // 🔁 Trigger forced screen reload after short delay
        setTimeout(() => {
          onForceReload?.();
        }, 10);
      } else {
        Alert.alert('Upload failed', data.message || 'Try again.');
      }
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Error', 'Failed to upload rotated image.');
    } finally {
      setImageUploading(false);
    }
  };

  const personalInfo = userData
    ? [
        { label: 'Name', value: userData.name, icon: 'person' },
        { label: 'Phone', value: userData.phone, icon: 'phone' },
        { label: 'Date of Birth', value: userData.date_birth, icon: 'cake' },
        { label: 'Blood Group', value: userData.blood_group, icon: 'favorite' },
      ]
    : [];

  const businessInfo = userData
    ? [
        { label: 'Business Name', value: userData.business_name, icon: 'business' },
        { label: 'Team Name', value: userData.team_name, icon: 'group' },
        { label: 'Business Nature', value: userData.BusinessNature, icon: 'work' },
        { label: 'Company Address', value: userData.company_address, icon: 'location-on' },
      ]
    : [];

  const finalImageUri = localImagePreview
    ? localImagePreview
    : imageUri
    ? `${imageUri}?t=${reloadKey}`
    : null;

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity onPress={pickImage} disabled={imageUploading}>
          <Image
            source={finalImageUri ? { uri: finalImageUri } : require('../assets/icon.png')}
            style={[
              styles.profileImage,
              { transform: [{ rotate: `${imageRotation}deg` }] },
            ]}
          />
          {imageUploading && (
            <View style={styles.imageOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
          <View style={styles.editIcon}>
            <Entypo name="edit" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreSection}>
        <UserScore />
        <TouchableOpacity style={styles.editBtnSmall} onPress={() => setModalVisible(true)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['Personal', 'Business'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
            onPress={() => setSelectedTab(tab as 'Personal' | 'Business')}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(selectedTab === 'Personal' ? personalInfo : businessInfo).map((item) => (
        <View key={item.label} style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name={item.icon} size={20} color="#c2c2c2" style={{ marginRight: 8 }} />
            <Text style={styles.label}>{item.label}</Text>
          </View>
          <Text style={styles.value}>{item.value || '-'}</Text>
        </View>
      ))}

      <EditProfileModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      <Modal visible={confirmBeforeUpload} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              Do you want to rotate the image?
            </Text>
            {localImagePreview && (
              <Image
                source={{ uri: localImagePreview }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  marginVertical: 10,
                  transform: [{ rotate: `${imageRotation}deg` }],
                }}
              />
            )}

            <TouchableOpacity
              onPress={() => setImageRotation((prev) => (prev + 90) % 360)}
              style={styles.rotateButton}
            >
              <Text style={styles.rotateText}>↻ Rotate</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  setConfirmBeforeUpload(false);
                  if (localImagePreview) uploadImage(localImagePreview);
                }}
                style={[styles.editBtnSmall, { marginRight: 10 }]}
              >
                <Text style={styles.editBtnText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setLocalImagePreview(null);
                  setConfirmBeforeUpload(false);
                }}
                style={[styles.rotateButton, { backgroundColor: '#999' }]}
              >
                <Text style={styles.rotateText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ⏱️ Higher-order component to support reload
const ReloadableProfileScreen = () => {
  const [screenKey, setScreenKey] = useState<number>(Date.now());

  const forceReload = () => {
    setScreenKey(Date.now());
  };

  return <ProfileScreen key={screenKey} onForceReload={forceReload} />;
};

export default ReloadableProfileScreen;

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  editIcon: {
    position: 'absolute',
    right: -10,
    bottom: 10,
    backgroundColor: 'green',
    padding: 6,
    borderRadius: 20,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  rotateButton: {
    marginTop: 8,
    backgroundColor: '#555',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  rotateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  editBtnSmall: {
    backgroundColor: 'green',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  editBtnText: { color: '#fff', fontWeight: 'bold' },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(153, 153, 153, 0.08)',
    borderRadius: 20,
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  tabBtnActive: { backgroundColor: 'green' },
  tabText: { color: '#333', fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  label: { fontWeight: 'bold', color: '#555' },
  value: { color: '#333', maxWidth: '60%', textAlign: 'right' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
});
