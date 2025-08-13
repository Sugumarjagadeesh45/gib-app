import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Keyboard, Modal, TouchableWithoutFeedback, Platform, Alert, SafeAreaView, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native-gesture-handler';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';

import ThanksnoteHistory from '../components/ThanksnoteHistory';
import ThanksnoteGivenTake from '../components/ThanksnoteGivenTake';

interface UserData {
  phone: string;
  name: string;
  profile_image: string;
}

interface ApiData {
  total_given: string;
  total_taken: string;
}

interface UserItem {
  phone: string;
  name: string;
  business_name: string;
}

interface ImageAttachment {
  uri: string;
  name: string;
  type: string;
}

const ThanksNote: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserItem[]>([]);
  const [businessAmount, setBusinessAmount] = useState('');
  const [givenTake, setGivenTake] = useState<'Given' | 'Taken'>('Given');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [phone, name, profile_image] = await Promise.all([
          AsyncStorage.getItem('phone'),
          AsyncStorage.getItem('name'),
          AsyncStorage.getItem('profile_image'),
        ]);
        if (phone && name) {
          setUserData({ phone, name, profile_image: profile_image || '' });
          fetchCalculationData(phone);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fetchCalculationData = async (phone: string) => {
    try {
      const response = await fetch(
        'https://www.giberode.com/giberode_app/thanksnote_calculation.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `phone=${phone}`,
        }
      );
      const result = await response.json();
      if (result.status === 'success') {
        setApiData(result.data);
      } else {
        console.warn('Failed to fetch stats:', result.message);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      axios
        .get('https://www.giberode.com/giberode_app/search_userbyname.php')
        .then((res) => {
          if (res.data.success) setUsers(res.data.users);
        })
        .catch((err) => console.error('Search user error:', err));
    };
    fetchData();
    const intervalId = setInterval(fetchData, 300000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(text.toLowerCase()) ||
        user.phone.includes(text) ||
        user.business_name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSelectUser = (item: UserItem) => {
    setQuery(`${item.name} - ${item.business_name}`);
    setSelectedUser(item);
    setFilteredUsers([]);
  };

  const pickImage = () => {
    Alert.alert(
      'Select Option',
      'Choose image source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await launchCamera({ mediaType: 'photo' });
            handleImageResult(result);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const result = await launchImageLibrary({ mediaType: 'photo' });
            handleImageResult(result);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleImageResult = (result: any) => {
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri!,
        name: asset.fileName || 'photo.jpg',
        type: asset.type || 'image/jpeg',
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !businessAmount) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('from_phone', userData?.phone ?? '');
    formData.append('to_phone', selectedUser.phone);
    formData.append('business_amount', businessAmount);
    formData.append('given_take', givenTake);
    if (attachment) {
      formData.append('attachment', {
        uri: attachment.uri,
        name: attachment.name,
        type: attachment.type,
      } as any);
    }
    try {
      const res = await axios.post(
        // 'https://www.giberode.com/giberode_app/thanksnote_api.php',
        'https://www.giberode.com/giberode_app/thanksnote_attach.php',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.status === 'success') {
        setSuccessModal(true);
        setBusinessAmount('');
        setGivenTake('Given');
        setSelectedUser(null);
        setQuery('');
        setAttachment(null);
        fetchCalculationData(userData?.phone ?? '');






        const notifyTitle = '🔔 Thanknsnote Alert';
        const notifyBody = `👤 From: ${userData?.name}\n ${givenTake} ₹${businessAmount} | 📌 Check it out...`;


        try {
          await axios.post(
            'https://www.giberode.com/giberode_app/admin-dashboard/auto_noti.php',
            {
              phone: selectedUser.phone,
              title: notifyTitle,
              body: notifyBody,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          console.log('Auto notification sent');
        } catch (notifyError) {
          console.warn('Auto notification failed:', notifyError);
        }




      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (error) {
      Alert.alert('Submission Error', 'Could not submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.screen}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setHistoryModalVisible(true)}
        >
          <Text style={styles.historyText}>View Thanksnote History</Text>
        </TouchableOpacity>

        <Modal
          visible={historyModalVisible}
          animationType="slide"
          onRequestClose={() => setHistoryModalVisible(false)}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => setHistoryModalVisible(false)}
              style={styles.closeModal}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <ThanksnoteHistory />
          </SafeAreaView>
        </Modal>

        <ThanksnoteGivenTake />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filteredUsers}
            keyExtractor={(item) => item.phone}
            ListHeaderComponent={
              <View style={styles.container}>
                <Text style={styles.heading}>Add Thanksnote</Text>
                <TextInput
                  style={{
                    backgroundColor: '#F5F6F8', 
                    color: '#000',              
                    padding: 10,
                    borderRadius: 8,
                  }}
                  placeholder="Search Name / Phone / Business"
                  placeholderTextColor="#000" 
                  value={query}
                  onChangeText={handleSearch}
                />

              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectUser(item)}>
                <Text style={styles.searchResult}>
                  {item.name} - {item.business_name}
                </Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <View style={styles.footer}>
                <TextInput
                  style={{
                    backgroundColor: '#F5F6F8',
                    color: '#000',
                    padding: 10,
                    borderRadius: 8,
                  }}
                  placeholder="Business Amount"
                  placeholderTextColor="#000"
                  keyboardType="numeric"
                  value={businessAmount}
                  onChangeText={setBusinessAmount}
                />

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Select Type</Text>
                  <View style={styles.pickerBox}>
                    <Picker
                      selectedValue={givenTake}
                      onValueChange={(value) =>
                        setGivenTake(value as 'Given' | 'Taken')
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Given" value="Given" />
                      <Picker.Item label="Taken" value="Taken" />
                    </Picker>
                  </View>
                </View>
                {attachment && (
                  <Image
                    source={{ uri: attachment.uri }}
                    style={{ width: 100, height: 100, marginTop: 10 }}
                  />
                )}
                <TouchableOpacity style={styles.historyButton} onPress={pickImage}>
                  <Text style={styles.historyText}>
                    {attachment ? 'Change Attachment' : 'Attach Image'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  <Text style={styles.submitButtonText}>
                    {submitting ? 'Submitting...' : 'Submit Thanksnote'}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </TouchableWithoutFeedback>

        <Modal visible={successModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Thanksnote submitted!</Text>
              <TouchableOpacity
                onPress={() => setSuccessModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScrollView>
  );
};

export default ThanksNote;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: '#098241' },
  input: {
    backgroundColor: '#f1f1f1',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#000',
  },
  searchResult: {
    padding: 12,
    backgroundColor: '#e0f7e9',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    fontSize: 16,
  },
  footer: { paddingHorizontal: 16, paddingBottom: 100 },
  pickerContainer: { marginTop: 10 },
  pickerLabel: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: { height: 50, color: '#000' },
  submitButton: {
    backgroundColor: '#098241',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 10, fontSize: 16, color: '#333' },
  historyButton: {
    backgroundColor: '#098241',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  closeModal: { padding: 16, backgroundColor: 'green', alignItems: 'center' },
  closeText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalText: { fontSize: 18, marginBottom: 20, color: '#333' },
  closeButton: {
    backgroundColor: '#098241',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
