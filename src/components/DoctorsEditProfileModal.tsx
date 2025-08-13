import React, { useEffect, useState } from 'react';
import {  Modal,  View,  Text,  TextInput,  TouchableOpacity,  StyleSheet,  ScrollView,  Alert,  KeyboardAvoidingView,  Platform,  ActionSheetIOS,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
interface Child {
  name: string;
  age_dob: string;
  school: string;
}
interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: any;
  maxLength?: number; 
}
interface FormData {
  name: string;  date_birth: string;  blood_group: string;  aadhaar: string;  edu_qualification: string;  native_address: string;  father_name: string;  kootam: string;  spouse_name: string;
  spouse_kootam: string;  spouse_occupation: string;  spouse_phone: string;  business_name: string;  team_name: string;  business_details: string;  year_running: string;  BusinessNature: string;
  company_address: string;  company_postalcode: string;  year_of_establishment: string;  generation_of_business: string;  no_employees: string;  ownership_type: string;  partner_name_community: string;
  website_url: string;  other_organization_membership: string;  expectations_from_gib: string;  phone: string;  email: string;  native: string;  city: string;  state: string;  postal_code: string;
  children: Child[]; specialist:string; hospital_name:string;service_location:string;
}
interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}
const LabeledInput = ({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: any;
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#888"
      {...rest}
    />
  </View>
);

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const [tab, setTab] = useState<'Personal' | 'Services' | 'Contact'>('Personal');
  const [children, setChildren] = useState<Child[]>([]);
  const [phone, setPhone] = useState<string | null>(null);
  const [dob, setDob] = React.useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',    date_birth: '',    blood_group: '',    aadhaar: '',    edu_qualification: '',    native_address: '',    father_name: '',    kootam: '',    spouse_name: '',    spouse_kootam: '',
    spouse_occupation: '',    spouse_phone: '',    business_name: '',    team_name: '',    business_details: '',    year_running: '',    BusinessNature: '',    company_address: '',
    company_postalcode: '',    year_of_establishment: '',    generation_of_business: '',    no_employees: '',    ownership_type: '',    partner_name_community: '',    website_url: '',
    other_organization_membership: '',    expectations_from_gib: '',    phone: '',    email: '',    native: '',    city: '',    state: '',    postal_code: '',
    children: [],  specialist:'', hospital_name : '', service_location:'',
  });

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleChildChange = (index: number, key: keyof Child, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [key]: value };
    setChildren(updated);
  };

  const addChild = () => {
    if (children.length < 3) {
      setChildren([...children, { name: '', age_dob: '', school: '' }]);
    }
  };

  const loadUserData = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('phone');
      if (!storedPhone) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      setPhone(storedPhone);

      const res = await fetch('https://www.giberode.com/giberode_app/fetch_user_data_register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: storedPhone }),
      });

      const result = await res.json();
      if (result.status) {
        const data = result.data;
        const childList: Child[] = [];

        if (data.children_name_1) {
          childList.push({
            name: data.children_name_1,
            age_dob: data.children_1_age_dob,
            school: data.children_1_school,
          });
        }
        if (data.children_name_2) {
          childList.push({
            name: data.children_name_2,
            age_dob: data.children_2_age_dob,
            school: data.children_2_school,
          });
        }
        if (data.children_name_3) {
          childList.push({
            name: data.children_name_3,
            age_dob: data.children_3_age_dob,
            school: data.children_3_school,
          });
        }

        setChildren(childList);
        setFormData(prev => ({ ...prev, ...data }));
      } else {
        Alert.alert('Error', 'Failed to fetch user data.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Something went wrong while fetching data.');
    }
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      phone: phone,
      children_name_1: children[0]?.name || '',
      children_1_age_dob: children[0]?.age_dob || '',
      children_1_school: children[0]?.school || '',
      children_name_2: children[1]?.name || '',
      children_2_age_dob: children[1]?.age_dob || '',
      children_2_school: children[1]?.school || '',
      children_name_3: children[2]?.name || '',
      children_3_age_dob: children[2]?.age_dob || '',
      children_3_school: children[2]?.school || '',
    };

    try {
      const res = await fetch('https://www.giberode.com/giberode_app/get_user_data_Doctorsregister.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.status) {
        Alert.alert('Success', 'Profile updated successfully.');
        onClose();
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      Alert.alert('Error', 'Something went wrong while submitting.');
    }
  };

  useEffect(() => {
    if (visible) loadUserData();
  }, [visible]);

  const openBloodGroupPickerIOS = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', ...BLOOD_GROUPS],
        cancelButtonIndex: 0,
      },
      buttonIndex => {
        if (buttonIndex > 0) {
          handleChange('blood_group', BLOOD_GROUPS[buttonIndex - 1]);
        }
      }
    );
  };

function formatDateInput(value: string, previousValue: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 8) digits = digits.slice(0, 8); 
  if (digits.length === 0) return '';
  if (digits.length <= 2) {
  return digits.length === 2 ? digits + '/' : digits;
  }
  if (digits.length <= 4) {
  return digits.slice(0, 2) + '/' + (digits.length === 4 ? digits.slice(2) + '/' : digits.slice(2));
  }
  return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}
  const renderTabContent = () => {
    switch (tab) {
      case 'Personal':
        return (
          <>
            <LabeledInput label="Name" value={formData.name} onChangeText={text => handleChange('name', text)} />
    <LabeledInput
            label="Date of Birth"
            value={formData.date_birth}
            onChangeText={text => {
              const formatted = formatDateInput(text, formData.date_birth);
              handleChange('date_birth', formatted);
            }}
            keyboardType="numeric"
          />
            
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Blood Group</Text>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity style={styles.input} onPress={openBloodGroupPickerIOS}>
                  <Text style={{ color: formData.blood_group ? '#000' : '#888' }}>
                    {formData.blood_group || 'Select Blood Group'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.input, { paddingHorizontal: 0 }]}>
                  <Picker
                    selectedValue={formData.blood_group}
                    onValueChange={value => handleChange('blood_group', value)}
                    style={{ color: formData.blood_group ? '#000' : '#888' }}
                    dropdownIconColor="#000"
                  >
                    <Picker.Item label="Select Blood Group" value="" color="#888" />
                    {BLOOD_GROUPS.map(group => (
                      <Picker.Item key={group} label={group} value={group} />
                    ))}
                  </Picker>
                </View>
              )}
            </View>
            <LabeledInput label="Aadhaar" value={formData.aadhaar} onChangeText={text => handleChange('aadhaar', text)} keyboardType="numeric" />
            <LabeledInput label="Educational Qualification" value={formData.edu_qualification} onChangeText={text => handleChange('edu_qualification', text)} />
            <LabeledInput label="Native Address" value={formData.native_address} onChangeText={text => handleChange('native_address', text)} multiline />
            <LabeledInput label="Father's Name" value={formData.father_name} onChangeText={text => handleChange('father_name', text)} />
            <LabeledInput label="Kootam" value={formData.kootam} onChangeText={text => handleChange('kootam', text)} />
            <LabeledInput label="Spouse Name" value={formData.spouse_name} onChangeText={text => handleChange('spouse_name', text)} />
            <LabeledInput label="Spouse Kootam" value={formData.spouse_kootam} onChangeText={text => handleChange('spouse_kootam', text)} />
            <LabeledInput label="Spouse Occupation" value={formData.spouse_occupation} onChangeText={text => handleChange('spouse_occupation', text)} />
            <LabeledInput label="Spouse Phone" value={formData.spouse_phone} onChangeText={text => handleChange('spouse_phone', text)} keyboardType="phone-pad" />
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.label, { marginBottom: 8 }]}>Children</Text>
              {children.map((child, i) => (
                <View key={i} style={{ marginBottom: 12, backgroundColor: '#fff', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#aaa' }}>
                  <LabeledInput
                    label={`Child ${i + 1} Name`}
                    value={child.name}
                    onChangeText={text => handleChildChange(i, 'name', text)}
                  />
                  <LabeledInput
                    label={`Child ${i + 1} Age/DOB`}
                    value={child.age_dob}
                    onChangeText={text => handleChildChange(i, 'age_dob', text)}
                  />
                  <LabeledInput
                    label={`Child ${i + 1} School`}
                    value={child.school}
                    onChangeText={text => handleChildChange(i, 'school', text)}
                  />
                </View>
              ))}
              {children.length < 3 && (
                <TouchableOpacity style={styles.addButton} onPress={addChild}>
                  <Text style={styles.addButtonText}>Add Child</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        );
      case 'Services':
        return (
          <>
            <LabeledInput label="Specialist" value={formData. specialist} onChangeText={text => handleChange('specialist', text)} />
            <LabeledInput label="Hospital" value={formData. hospital_name} onChangeText={text => handleChange('hospital_name', text)} />
            <LabeledInput label="location" value={formData. service_location} onChangeText={text => handleChange('service_location', text)} multiline />  
 
          </>
        );
         case 'Contact':
        return (
          <>
            {/* <LabeledInput label="Phone" value={formData.phone} onChangeText={text => handleChange('phone', text)} keyboardType="phone-pad" /> */}
            <LabeledInput label="Email" value={formData.email} onChangeText={text => handleChange('email', text)} keyboardType="email-address" />
            <LabeledInput label="Native" value={formData.native} onChangeText={text => handleChange('native', text)} />
            <LabeledInput label="City" value={formData.city} onChangeText={text => handleChange('city', text)} />
            <LabeledInput label="State" value={formData.state} onChangeText={text => handleChange('state', text)} />
            <LabeledInput label="Postal Code" value={formData.postal_code} onChangeText={text => handleChange('postal_code', text)} keyboardType="numeric" />
          </>
        );
   

    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Edit Profile</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {['Personal', 'Services', 'Contact'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabButton, tab === t && styles.tabButtonActive]}
              onPress={() => setTab(t as typeof tab)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {renderTabContent()}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  closeText: {
    fontSize: 16,
    color: 'red',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomColor: 'green',
  },
  tabText: {
    fontSize: 16,
    color: '#444',
  },
  tabTextActive: {
    color: 'green',
    fontWeight: '700',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#888',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: 'green',
    paddingVertical: 14,
    borderRadius: 6,
    marginTop: 24,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default EditProfileModal;