import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActionSheetIOS
} from 'react-native';
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
  placeholder?: string;
}

interface FormData {
  name: string;
  date_birth: string;
  blood_group: string;
  aadhaar: string;
  edu_qualification: string;
  native_address: string;
  father_name: string;
  kootam: string;
  spouse_name: string;
  spouse_kootam: string;
  spouse_occupation: string;
  spouse_phone: string;
  business_name: string;
  team_name: string;
  business_details: string;
  year_running: string;
  BusinessNature: string;
  company_address: string;
  company_postalcode: string;
  map_url: string;
  year_of_establishment: string;
  generation_of_business: string;
  no_employees: string;
  ownership_type: string;
  partner_name_community: string;
  website_url: string;
  other_organization_membership: string;
  expectations_from_gib: string;
  phone: string;
  email: string;
  native: string;
  city: string;
  state: string;
  postal_code: string;
  children: Child[];
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
  placeholder = '',
  ...rest
}: LabeledInputProps) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor="#888"
      {...rest}
    />
  </View>
);

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const [tab, setTab] = useState<'Personal' | 'Business' | 'Contact'>('Personal');
  const [children, setChildren] = useState<Child[]>([]);
  const [phone, setPhone] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    date_birth: '',
    blood_group: '',
    aadhaar: '',
    edu_qualification: '',
    native_address: '',
    father_name: '',
    kootam: '',
    spouse_name: '',
    spouse_kootam: '',
    spouse_occupation: '',
    spouse_phone: '',
    business_name: '',
    team_name: '',
    business_details: '',
    year_running: '',
    BusinessNature: '',
    company_address: '',
    company_postalcode: '',
    map_url: '',
    year_of_establishment: '',
    generation_of_business: '',
    no_employees: '',
    ownership_type: '',
    partner_name_community: '',
    website_url: '',
    other_organization_membership: '',
    expectations_from_gib: '',
    phone: '',
    email: '',
    native: '',
    city: '',
    state: '',
    postal_code: '',
    children: [],
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
    if (children.length < 4) {
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

        for (let i = 1; i <= 4; i++) {
          if (data[`children_name_${i}`]) {
            childList.push({
              name: data[`children_name_${i}`],
              age_dob: data[`children_${i}_age_dob`],
              school: data[`children_${i}_school`],
            });
          }
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
      children_name_4: children[3]?.name || '',
      children_4_age_dob: children[3]?.age_dob || '',
      children_4_school: children[3]?.school || '',
    };

    try {
      const res = await fetch('https://www.giberode.com/giberode_app/get_user_data_register.php', {
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

  const renderTabContent = () => {
    switch (tab) {
      case 'Personal':
        return (
          <>
            <LabeledInput label="Name" value={formData.name} onChangeText={text => handleChange('name', text)} />
            <LabeledInput
              label="Date of Birth"
              value={formData.date_birth}
              onChangeText={text => handleChange('date_birth', text)}
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
              {children.length < 4 && (
                <TouchableOpacity style={styles.addButton} onPress={addChild}>
                  <Text style={styles.addButtonText}>Add Child</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        );
      case 'Business':
        return (
          <>
            <LabeledInput label="Business Name" value={formData.business_name} onChangeText={text => handleChange('business_name', text)} />
            <LabeledInput label="Team Name" value={formData.team_name} onChangeText={text => handleChange('team_name', text)} />
            <LabeledInput label="Business Nature" value={formData.BusinessNature} onChangeText={text => handleChange('BusinessNature', text)} multiline />
            <LabeledInput label="Company Address" value={formData.company_address} onChangeText={text => handleChange('company_address', text)} multiline />
            <LabeledInput label="Company Postal Code" value={formData.company_postalcode} onChangeText={text => handleChange('company_postalcode', text)} keyboardType="numeric" />
            <LabeledInput label="Map URL" value={formData.map_url} onChangeText={text => handleChange('map_url', text)} placeholder="https://maps.google.com/..." />
            <LabeledInput label="Year Of Establishment" value={formData.generation_of_business} keyboardType="numeric" onChangeText={text => handleChange('generation_of_business', text.replace(/[^0-9]/g, '').slice(0, 4))} />
            <LabeledInput label="Number of Employees" value={formData.no_employees} onChangeText={text => handleChange('no_employees', text)} keyboardType="numeric" />
            <LabeledInput label="Ownership Type" value={formData.ownership_type} onChangeText={text => handleChange('ownership_type', text)} />
            <LabeledInput label="Partner Name & Community" value={formData.partner_name_community} onChangeText={text => handleChange('partner_name_community', text)} />
            <LabeledInput label="Website URL" value={formData.website_url} onChangeText={text => handleChange('website_url', text)} />
            <LabeledInput label="Other Organization Membership" value={formData.other_organization_membership} onChangeText={text => handleChange('other_organization_membership', text)} multiline />
            <LabeledInput label="Expectations from GIB" value={formData.expectations_from_gib} onChangeText={text => handleChange('expectations_from_gib', text)} multiline />
          </>
        );
      case 'Contact':
        return (
          <>
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
          {['Personal', 'Business', 'Contact'].map(t => (
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