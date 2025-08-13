import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
  Image,
  Platform,
} from 'react-native';
import ProfileView from '../../components/ProfileView';
import EditProfileModal from '../../components/EditProfileModal';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScrollView } from 'react-native-gesture-handler';

type ModalName = 'chat' | 'event' | 'doctors';

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalName | null>(null);
  const [visible, setVisible] = useState(false);

  // const handleWhatsApp = () => {
  //   Linking.openURL('https://wa.me/');
  // };

  const handleCall = () => {
    Linking.openURL('tel:+918508535555');
  };

  const openModal = (modalName: ModalName) => {
    setActiveModal(modalName);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setActiveModal(null);
  };

  return (
    <View style={styles.container}>
   
      <View style={styles.profileCard}>
        <ProfileView />
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.7}
          onPress={() => setVisible(true)}
        >
          <Icon name="create-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <EditProfileModal visible={visible} onClose={() => setVisible(false)} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>    
      <View style={styles.header}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.welcomeText}>Gounders In Business</Text>
        <Text style={styles.tagline}>
          To Join GiB & Access complete{'\n'} features of this app 
          
        </Text>

      
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity
            style={[styles.actionButton, styles.whatsappButton]}
            activeOpacity={0.8}
            onPress={handleWhatsApp}
          >
            <Icon name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>WhatsApp</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            activeOpacity={0.8}
            onPress={handleCall}
          >
            <Icon name="call" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Call Us</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  marginBottom:100,
  
  },
  profileCard: {
    // backgroundColor: '#fff',
    // padding: 20,
    // borderRadius: 14,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    // elevation: 8,
    // marginBottom: 30,
  },
  editButton: {
    marginTop: -30,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
    marginLeft:60,
    marginRight:60,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
   

  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  highlightText: {
    color: '#333',
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  callButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default HomeScreen;
