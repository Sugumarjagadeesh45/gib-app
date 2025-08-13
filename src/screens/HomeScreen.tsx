import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // or FontAwesome etc.
import Header from '../components/Header';
import ProfileView from '../components/ProfileView';
import Homescreendata1 from '../components/Homescreendata1';
import BusinessScoreCard from '../components/BusinessScoreCard';
import Chat from '../components/Chat';
import EventCalendar from '../components/EventCalendar';
import DoctorsWing from '../components/DoctorsWing';

type ModalName = 'chat' | 'event' | 'doctors';

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalName | null>(null);

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
      {/* <Header /> */}
      <ProfileView />
          {/* Circle Icon Buttons */}
        <View style={styles.iconButtonRow}>
          {/* Doctors Wing */}
          <View style={styles.iconButtonContainer} >
             <TouchableOpacity
      style={[styles.circleButton, { backgroundColor: '#4A90E2' }]} // Mild Blue
      onPress={() => openModal('doctors')}
    >
              <MaterialIcons name="local-hospital" size={30} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Doctors Wing</Text>
          </View>

       

          {/* Event Calendar */}
          <View style={styles.iconButtonContainer}>
             <TouchableOpacity
      style={[styles.circleButton, { backgroundColor: '#7ED6A5' }]} // Mild Green
      onPress={() => openModal('event')}
    >
              <MaterialIcons name="event" size={30} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>Calenders</Text>
          </View>

          {/* Chat */}
          <View style={styles.iconButtonContainer}>
             <TouchableOpacity
      style={[styles.circleButton, { backgroundColor: '#A29BFE' }]} // Mild Purple
      onPress={() => openModal('chat')}
    >
              <MaterialIcons name="chat" size={30} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.iconLabel}>News & Event</Text>
          </View>
        </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Homescreendata1 />
        <BusinessScoreCard />

    
      <Modal
  visible={modalVisible}
  animationType="slide"
  onRequestClose={closeModal}
  transparent={true} // make background see-through
>
  <View style={styles.modalBackdrop}>
    <View style={styles.modalContainer}>
      <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>

      {activeModal === 'doctors' && <DoctorsWing />}
      {activeModal === 'event' && <EventCalendar />}
      {activeModal === 'chat' && <Chat />}
    </View>
  </View>
</Modal>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 100,
  },
  scrollContent: {
    paddingBottom: 20,
    // marginBottom:50,
  },
iconButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-around', 
  paddingHorizontal: 20,           
  marginVertical: 20,
  marginTop: -30,
},

  iconButtonContainer: {
    alignItems: 'center',
    width: 80,
  },
  circleButton: {
    backgroundColor: '#1E90FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6, // Android shadow
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)', // semi-transparent backdrop
  justifyContent: 'flex-end', // makes modal slide from bottom
},

modalContainer: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  paddingTop: 20,
  paddingHorizontal: 20,
  paddingBottom: 30,
  minHeight: '80%', // or any height
},

  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeText: {
    fontSize: 16,
    color: 'red',
  },
});

export default HomeScreen;
