import React, { useEffect, useState } from 'react';
import {  View,  Text,  StyleSheet,  ActivityIndicator,  Alert,  FlatList,  Image,  TouchableOpacity,  Modal,  TextInput,  ScrollView,PermissionsAndroid,  Platform,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import UserScore from '../../components/UserScore';
import EditProfileModal from '../../components/DoctorsEditProfileModal';
import ThanksnoteHistory from '../../components/ThanksnoteHistory';

const ProfileScreen = () => {
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Personal' | 'Business'>('Personal');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchUserPhone = async () => {
      try {
        const phone = await AsyncStorage.getItem('phone');
        if (phone) {
          setUserPhone(phone);
          fetchUserData(phone);
          interval = setInterval(() => fetchUserData(phone), 5000);
        } else {
          setError('Phone number not found in storage.');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to retrieve phone number.');
        setLoading(false);
      }
    };

    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }

    fetchUserPhone();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

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
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Image picker error');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) uploadImage(uri);
    });
  };

  const uploadImage = async (uri: string) => {
    if (!userPhone) {
      Alert.alert('Error', 'User phone number is missing.');
      return;
    }

    setImageUploading(true);

    const formData = new FormData();
    formData.append('phone', userPhone);
    formData.append('profile_image', {
      uri,
      name: `profile_${userPhone}.jpg`,
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch('https://www.giberode.com/giberode_app/upload_image.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        Alert.alert('Success', 'Profile picture updated successfully!');
        setImageUri(data.image_url);
        await AsyncStorage.setItem('profile_image', data.image_url);
      } else {
        Alert.alert('Error', 'Failed to update profile picture.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('https://www.giberode.com/giberode_app/changepassword.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, new_password: newPassword }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Password updated successfully!');
        setPasswordModalVisible(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to update password.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
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
        { label: 'Hospital Name', value: userData.hospital_name, icon: 'business' },
        { label: 'Specialist', value: userData.specialist, icon: 'group' },
        // { label: 'Business Nature', value: userData.BusinessNature, icon: 'work' },
        { label: 'Location', value: userData.service_location, icon: 'location-on' },
      ]
    : [];

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage} disabled={imageUploading}>
        <Image
          source={imageUri ? { uri: imageUri } : require('../../assets/icon.png')}
          style={styles.profileImage}
        />
        {imageUploading && (
          <View style={styles.imageOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
        <View style={styles.editIcon1}>
          <Entypo name="edit" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

 <View style={styles.profileActionSection}>
  <TouchableOpacity
    style={styles.profileEditButton}
    onPress={() => setModalVisible(true)}
  >
    <Entypo name="edit" size={18} color="#fff" style={styles.editIcon} />
    <Text style={styles.profileEditText}>Edit Profile</Text>
  </TouchableOpacity>
</View>

      <View style={styles.tabs}>
        {['Personal', 'Service'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
            onPress={() => setSelectedTab(tab as 'Personal' | 'Business')}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
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
{/* 
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              secureTextEntry={!isPasswordVisible}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
            />
            <TextInput
              secureTextEntry={!isPasswordVisible}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.togglePassword}>
              <MaterialIcons name={isPasswordVisible ? 'visibility-off' : 'visibility'} size={20} color="gray" />
              <Text style={{ color: 'gray', marginLeft: 8 }}>
                {isPasswordVisible ? 'Hide' : 'Show'} Password
              </Text>
            </TouchableOpacity>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} onPress={updatePassword}>
                <Text style={styles.modalBtnText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}

      <EditProfileModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </ScrollView>
  );
};

// export default ProfileScreen;


const styles = StyleSheet.create({
   profileActionSection: {
    alignItems: 'flex-end',
    margin: 10,
  },
  profileEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'green', 
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editIcon: {
    marginRight: 6,
  },
  profileEditText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    // backgroundColor:'green',
  },
  imageOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 100,
},

  container: { padding: 16, paddingBottom: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileImage: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 16 },
  editIcon1: {
    position: 'absolute',
    right: 120,
    bottom: 20,
    backgroundColor: 'green',
    padding: 6,
    borderRadius: 20,
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
  changePasswordBtn: {
    marginTop: 20,
    backgroundColor: '#098241',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  changePasswordText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  togglePassword: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: 'green',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#aaa',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
