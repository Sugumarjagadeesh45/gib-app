import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';

interface Doctor {
  id: number | string;
  name: string;
  qualification: string;
  specialist: string;
  hospital_name: string;
  location: string;
  address: string;
  profile_url: string;
  phone: string;
}

const DoctorsDirectory: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [specialistFilter, setSpecialistFilter] = useState<string>('All');
  const [specialists, setSpecialists] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('https://www.giberode.com/giberode_app/doctorusers.php');
      const json = await response.json();

      const doctorsArray: Doctor[] = Array.isArray(json?.data)
        ? json.data.map((doc: any, index: number): Doctor => ({
            id: doc.id ?? index,
            name: doc.name,
            qualification: doc.edu_qualification,
            specialist: doc.specialist,
            hospital_name: doc.hospital_name,
            location: doc.service_location,
            address: doc.native_address,
            profile_url: doc.profile_image,
            phone: doc.phone ?? '',
          }))
        : [];

      setDoctors(doctorsArray);
      setFilteredDoctors(doctorsArray);

      const uniqueSpecialists = ['All', ...new Set(doctorsArray.map((doc) => doc.specialist).filter(Boolean))];
      setSpecialists(uniqueSpecialists);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    const interval = setInterval(() => {
      fetchDoctors();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (specialistFilter !== 'All') {
      filtered = filtered.filter(
        (doc) => doc.specialist?.toLowerCase() === specialistFilter.toLowerCase()
      );
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, specialistFilter, doctors]);

  const renderDoctor = ({ item }: { item: Doctor }) => {
    if (!item || typeof item !== 'object') return null;

    const imageUrl = item.profile_url?.startsWith('http')
      ? item.profile_url
      : item.profile_url
      ? `https://www.giberode.com/giberode_app/${item.profile_url}`
      : 'https://www.giberode.com/giberode_app/icon.png';

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.text}>🎓 {item.qualification}</Text>
          <Text style={styles.text}>🩺 {item.specialist}</Text>
          <Text style={styles.text}>🏥 {item.hospital_name}</Text>
          <Text style={styles.text}>📍 {item.location}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search doctor by name"
          placeholderTextColor="#888" 
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

 
      <View style={styles.filterWrapper}>
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterToggleText}>Filter by Specialist</Text>
        </TouchableOpacity>
        {/* <View  style={styles.selectedFilterText}>
        <Text>Selected: {specialistFilter}</Text>
        </View> */}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSidebar}>
            <Text style={styles.modalTitle}>Choose a Specialist</Text>
            <ScrollView>
              {specialists.map((item, index) => (
                <TouchableOpacity
                  key={`${item}_${index}`}
                  style={[
                    styles.modalItem,
                    item === specialistFilter && styles.activeModalItem,
                  ]}
                  onPress={() => {
                    setSpecialistFilter(item);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === specialistFilter && styles.activeModalItemText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Doctor List */}
      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctor}
        keyExtractor={(item) => item?.id?.toString?.() || Math.random().toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.text}>No doctors found.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    flex: 1,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    backgroundColor:"fff",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingLeft:10,

  },
  filterToggleButton: {
    backgroundColor: 'green',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  filterToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedFilterText: {
    fontSize: 14,
    color: '#333',
        marginRight:20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginVertical: 8,
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  modalSidebar: {
    width: '70%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  activeModalItem: {
    backgroundColor: 'green',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  activeModalItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DoctorsDirectory;
