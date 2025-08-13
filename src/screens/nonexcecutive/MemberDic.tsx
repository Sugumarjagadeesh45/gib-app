import React, { useEffect, useState } from 'react';
import {  View,  Text,  TextInput,  ImageBackground,  FlatList,  Image,  TouchableOpacity,  Modal,  StyleSheet,  ActivityIndicator,  SafeAreaView,  Linking,  ScrollView,  Animated} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


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
  // const [scoreAllowed, setScoreAllowed] = useState<boolean | null>(null);
  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const modalFadeAnim = useState(new Animated.Value(0))[0];

const [score, setScore] = useState<number>(100);
      // ✅ default score = 100
const [scoreAllowed, setScoreAllowed] = useState<boolean>(true); // ✅ allow screen access


useFocusEffect(
  useCallback(() => { 
    const intervalId = setInterval(() => {
      checkScoreEligibility();
    }, 2000); 

    return () => clearInterval(intervalId);
  }, [])
);

const checkScoreEligibility = async () => {
  try {
    let phone = await AsyncStorage.getItem('phone');

    if (!phone) {
      console.warn('Phone number not found in AsyncStorage');
      setScoreAllowed(false);
      return;
    }

    phone = phone.replace(/['"]+/g, '').trim();

    const response = await fetch('https://www.giberode.com/giberode_app/get_user_score.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    console.log('Score API response:', data);

    if (data?.profile_score_percentage !== undefined) {
      const scoreValue = parseFloat(data.profile_score_percentage);
      setScore(scoreValue);
      setScoreAllowed(scoreValue > 70);
    } else {
      setScore(0);
      setScoreAllowed(false);
    }
  } catch (error) {
    console.error('Error checking score:', error);
    setScore(0);
    setScoreAllowed(false);
  }
};




  useEffect(() => {
    if (scoreAllowed) {
      fetchUsers();
      const intervalId = setInterval(() => {
        fetchUsers();
      }, 50000);
      return () => clearInterval(intervalId);
    }
  }, [scoreAllowed]);

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

const renderItem = ({ item }: { item: User }) => (
  <TouchableOpacity onPress={() => openUserModal(item)} style={styles.card}>
    <Image source={{ uri: item.profile_image }} style={styles.image} />
    <View style={styles.infoContainer}>
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        {item.business_name ? <Text style={styles.business}>{item.business_name}</Text> : null}
      </View>
      <TouchableOpacity
  style={styles.callButton}
  onPress={() => Linking.openURL(`tel:+91${item.phone}`)}
>
  <MaterialIcons name="call" size={24} color="#fff" />
</TouchableOpacity>
    </View>
  </TouchableOpacity>
);


  const handleSearch = (text: string, bloodGroupFilter = selectedBloodGroup) => {
    setSearchText(text);
    const lowerText = text.toLowerCase();
    const filtered = users.filter(user => {
      const matchesSearch =
        user.name?.toLowerCase().includes(lowerText) ||
        user.business_name?.toLowerCase().includes(lowerText) ||
        user.phone?.includes(lowerText) ||
        user.BusinessNature?.toLowerCase().includes(lowerText) ||
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

  if (scoreAllowed === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Checking profile score...</Text>
      </View>
    );
  }


  if (!scoreAllowed) {
  return (
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={{ fontSize: 18, color: 'gray', textAlign: 'center' }}>
        You are not eligible to view {'\n'}this Members Directory.
      </Text>
      <Text style={{ marginTop: 8 }}>Your profile score is {score}</Text>
       <Text style={{ marginTop: 8 }}>Must need above 70</Text>
    </View>
  );
}



  return (
    <ImageBackground source={require('../../assets/bg05.jpeg')} style={styles.background} resizeMode="cover">
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

    
      </SafeAreaView>
    </ImageBackground>
  );
};
export default UserDirectoryScreen;


const styles = StyleSheet.create({
    infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
    business: {
    fontSize: 14,
    color: '#666',
    flexWrap: 'wrap',
  },
  callButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  callText: {
    color: '#fff',
    fontWeight: 'bold',
  },
    logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
    image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  phone: {
    fontSize: 14,
    color: '#555',
  },
  // business: {
  //   fontSize: 14,
  //   // fontWeight: 'bold',
  //   color: '#333',
  // },
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
    marginRight: 10, 
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600', 
    color: '#777', 
    flex: 0.5, 
    textAlign: 'left', 
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
    marginVertical: 16, 
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0', 
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
