import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Linking,
  ScrollView,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  profile_image: string;
  kootam?: string;
  business_name?: string;
  edu_qualification?: string | null;
  aadhaar?: string | null;
  father_name?: string | null;
  spouse_name?: string | null;
  native_address?: string | null;
  blood_group?: string | null;
  date_birth?: string | null;
  BusinessNature?: string | null;
  company_address?: string | null;
  ownership_type?: string | null;
  website_url?: string | null;

};

const UserDirectoryScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const modalFadeAnim = useState(new Animated.Value(0))[0];

useEffect(() => {
  fetchUsers();
  const intervalId = setInterval(() => {
    fetchUsers();
  }, 50000);
  return () => clearInterval(intervalId);
}, []);


  const fetchUsers = async () => {
    try {
      const response = await fetch('https://www.giberode.com/giberode_app/get_all_users.php');
      const data = await response.json();
      if (data.success && Array.isArray(data.users)) {
        const sortedUsers = data.users.sort((a: User, b: User) =>
          a.name.localeCompare(b.name)
        );

        sortedUsers.forEach((user: User) => {
          if (user.profile_image) {
            Image.prefetch(user.profile_image);
          }
        });

        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      } else {
        console.error('Unexpected API response:', data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

const handleSearch = (text: string, bloodGroupFilter = selectedBloodGroup) => {
  setSearchText(text);
  const lowerText = text.toLowerCase();

  const filtered = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(lowerText) ||
      user.business_name?.toLowerCase().includes(lowerText) ||
      user.phone?.includes(lowerText) ||
      user.BusinessNature?.toLowerCase().includes(lowerText)||
      user.company_address?.includes(lowerText);

    const matchesBloodGroup =
      bloodGroupFilter === 'All' || user.blood_group === bloodGroupFilter;

    return matchesSearch && matchesBloodGroup;
  });

  const sortedFiltered = filtered.sort((a, b) => a.name.localeCompare(b.name));
  setFilteredUsers(sortedFiltered);
};


  const openUserModal = (user: User) => {
    setTabIndex(0);
    setSelectedUser(user);
    Animated.timing(modalFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
<TouchableOpacity onPress={() => openUserModal(item)} style={styles.profileInfo}>
  <Image source={{ uri: item.profile_image }} style={styles.avatar} />
  
  <View style={{ flexDirection: 'column' }}>
    <Text style={styles.name}>{item.name}</Text>
   <Text style={styles.businessname}>
  {item.business_name
    ? item.business_name.length > 10
      ? item.business_name.slice(0, 20) + '...'
      : item.business_name
    : ''}
</Text>

  </View>
</TouchableOpacity>




      <View style={styles.actionIcons}>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={styles.iconButton}>
          <View style={{ backgroundColor: '#fff', padding: 5, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="call" size={22} color="#4CAF50" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${item.phone}`)} style={styles.iconButton}>
          <View style={{ backgroundColor: '#fff', padding: 5, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="logo-whatsapp" size={24} color="#25D366" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../assets/bg05.jpeg')} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={{ padding: 10, color: '#fff' }}>Blood Group</Text>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
            {bloodGroups.map(group => (
              <TouchableOpacity
                key={group}
                style={[styles.chip, { alignSelf: 'flex-start' }, selectedBloodGroup === group && styles.selectedChip]}
                onPress={() => {
                  setSelectedBloodGroup(group);
                  handleSearch(searchText, group);
                }}
              >
                <Text style={[styles.chipText, selectedBloodGroup === group && styles.selectedChipText]}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TextInput
          placeholder="Search Name, Business Name, Phone Number..."
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
           placeholderTextColor="#000"
        />

        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        ) : filteredUsers.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>
              No users found matching your search.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ flex: 1 }}
          />
        )}

        {/* Modal remains unchanged */}
        {selectedUser && (
          <Modal
            visible
            transparent
            animationType="none"
            onRequestClose={() => setSelectedUser(null)}
          >
            <Animated.View style={[styles.modalOverlay, { opacity: modalFadeAnim }]}>
              <View style={styles.modalContent}>
                <Image source={{ uri: selectedUser.profile_image }} style={styles.modalImage} resizeMode="cover" />
                <Text style={styles.modalName}>{selectedUser.name}</Text>
                <Text style={styles.modalKootam}>Kootam: {selectedUser.kootam || 'N/A'}</Text>

                <View style={styles.tabSwitcher}>
                  <TouchableOpacity style={[styles.tabButton, tabIndex === 0 && styles.activeTab]} onPress={() => setTabIndex(0)}>
                    <Icon name="person" size={24} color={tabIndex === 0 ? '#fff' : '#444'} style={styles.tabIcon} />
                    <Text style={[styles.tabText, tabIndex === 0 && styles.activeTabText]}>Personal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tabButton, tabIndex === 1 && styles.activeTab]} onPress={() => setTabIndex(1)}>
                    <Icon name="business" size={24} color={tabIndex === 1 ? '#fff' : '#444'} style={styles.tabIcon} />
                    <Text style={[styles.tabText, tabIndex === 1 && styles.activeTabText]}>Business</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tabContent}>
                  {tabIndex === 0 ? (
                    <>
                      <View style={styles.row}>
                        <Icon name="mail" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Email:</Text>
                        <Text style={styles.modalText}>{selectedUser.email || 'N/A'}</Text>
                      </View>
                      <View style={styles.row}>
                        <Icon name="call" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Phone:</Text>
                        <Text style={styles.modalText}>{selectedUser.phone || 'N/A'}</Text>
                      </View>
                      <View style={styles.row}>
                        <Icon name="medkit" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Blood Group:</Text>
                        <Text style={styles.modalText}>{selectedUser.blood_group || 'N/A'}</Text>
                      </View>
                      <View style={styles.row}>
                        <Icon name="person" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Father Name:</Text>
                        <Text style={styles.modalText}>{selectedUser.father_name || 'N/A'}</Text>
                      </View>
                      <View style={styles.row}>
                        <Icon name="heart" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Spouse Name:</Text>
                        <Text style={styles.modalText}>{selectedUser.spouse_name || 'N/A'}</Text>
                      </View>
                      <View style={styles.row}>
                        <Icon name="school" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Education:</Text>
                        <Text style={styles.modalText}>{selectedUser.edu_qualification || 'N/A'}</Text>
                      </View>
                      <View style={styles.row}>
                        <Icon name="location" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Native Address:</Text>
                        <Text style={styles.modalText}>{selectedUser.native_address || 'N/A'}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.row}>
                        <Icon name="business" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Business Name:</Text>
                        <Text style={styles.modalText}>{selectedUser.business_name || 'N/A'}</Text>
                      </View>
                      <View style={styles.row}>
                        <Icon name="location-outline" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Company Address:</Text>
                        <Text style={styles.modalText}>{selectedUser.company_address || 'N/A'}</Text>
                      </View>
                      <View style={styles.row}>
                        <Icon name="clipboard" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Business Details:</Text>
                        <Text style={styles.modalText}>{selectedUser.BusinessNature || 'N/A'}</Text>
                      </View>





                      <View style={styles.row}>
                        <Icon name="globe" size={18} color="#777" style={styles.icon} />
                        <Text style={styles.labelText}>Website:</Text>
                        <Text style={styles.modalText}>{selectedUser.website_url || 'N/A'}</Text>
                      </View>
                    </>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => {
                    setSelectedUser(null);
                    Animated.timing(modalFadeAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }).start();
                  }}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Modal>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

export default UserDirectoryScreen;


const styles = StyleSheet.create({
  businessname: {
  fontSize: 14,
  color: '#5b5b5b',
  marginTop: 2,
},
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  icon: {
    marginRight: 10, // Space between icon and label text
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600', // Bold for labels to differentiate them
    color: '#777', // Lighter color for labels to maintain a subtle look
    flex: 0.5, // Adjusts label width
    textAlign: 'left', // Left-align the label
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    // backgroundColor: '#f9f9f9',
    marginBottom: 70,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#ffff',
    color:"black",
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 8,
    // borderWidth: 1,
    // borderColor: '#ccc',
  },
  selectedChip: {
    backgroundColor: 'green',
    // borderColor: '#fff',
  },
  chipText: {
    color: '#444',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedChipText: {
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 2,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.33)',

    marginBottom: 10,
    borderColor: 'rgba(255, 255, 255, 0.49)',
    borderWidth: 1,
    // elevation: 5,

    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '92%',
    maxHeight: '88%',
  },
  modalImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: 'center',
    marginBottom: 14,
    backgroundColor: '#eee',
  },
  modalName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    color: '#222',
  },
  modalKootam: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 16, // Add margin for a bit more spacing
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0', // Light background for tabs
    borderRadius: 8,
    marginHorizontal: 8,
    elevation: 3, // Light shadow for 3D effect
  },
  activeTab: {
    backgroundColor: 'green', // Dark background for active tab
    elevation: 5, // Slight elevation for active tab to stand out
  },
  tabIcon: {
    marginRight: 8, // Space between icon and text
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444', // Default text color
  },
  activeTabText: {
    color: '#fff', // White text for active tab
  },
  tabContent: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: 'green',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // Align label on left and data on right
    alignItems: 'center',
    marginBottom: 12,  // Adjust spacing between rows
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500', // Normal weight for the data to make it look balanced
    textAlign: 'right', // Right-align the fetched data
    flex: 1, // Ensures that the text fills the space available on the right
  },
});
