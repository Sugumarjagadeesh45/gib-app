import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, Modal, TextInput, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';


interface ThanksNoteItem {
  id: number;
  type: 'given' | 'taken';
  name: string;
  business_name: string;
  phone: string;
  team_name: string;
  business_amount: string;
  created_at: string;
  file_path?: string;
}

const ThanksnoteHistory = () => {
  const [data, setData] = useState<ThanksNoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'All' | 'Given' | 'Taken'>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ThanksNoteItem | null>(null);
  const [editedAmount, setEditedAmount] = useState('');
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const phone = await AsyncStorage.getItem('phone');
    if (!phone) return;

    setLoading(true);
    try {
      const res = await fetch('https://www.giberode.com/giberode_app/thanksnotehistoryv2.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setData(Array.isArray(json.data) ? json.data : []);
      } else {
        console.warn('API error:', json.message);
      }
    } catch (e) {
      console.error('Fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirm delete?', undefined, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch('https://www.giberode.com/giberode_app/thanksnotehistoryv2.php', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });
            const json = await res.json();
            if (json.status === 'success') fetchData();
            else Alert.alert('Error', json.message);
          } catch (e) {
            Alert.alert('Error', 'Delete failed.');
          }
        }
      }
    ]);
  };

  const openEdit = (item: ThanksNoteItem) => {
    setEditingItem(item);
    setEditedAmount(item.business_amount);
    setModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch('https://www.giberode.com/giberode_app/thanksnotehistoryv2.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          business_amount: editedAmount,
          team_name: editingItem.team_name
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        fetchData();
        setModalVisible(false);
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Update failed.');
    }
  };

  const filtered = data.filter(item =>
    selectedTab === 'All' || item.type.toLowerCase() === selectedTab.toLowerCase()
  );

  const renderItem = ({ item }: { item: ThanksNoteItem }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name} ({item.type.toUpperCase()})</Text>
      <Text style={styles.label}>₹{item.business_amount}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.btnEdit}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.btnDelete}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
        {item.file_path && (
          <TouchableOpacity
            onPress={() => {
              setSelectedFilePath(item.file_path!);
              setBillModalVisible(true);
            }}
            style={styles.btnBill}
          >
            <Text style={styles.btnText}>Bill</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.date}>{item.created_at}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {['All', 'Given', 'Taken'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#10B981" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No records found.</Text>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#EF4444" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Amount</Text>
            <TextInput
              style={styles.input}
              value={editedAmount}
              onChangeText={setEditedAmount}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bill View Modal */}
      <Modal visible={billModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setBillModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#EF4444" />
            </TouchableOpacity>
            {selectedFilePath?.endsWith('.pdf') ? (
              <Text style={{ marginBottom: 10 }}>PDF Preview not supported. Please open in browser.</Text>
            ) : (
              <Image
                source={{ uri: selectedFilePath! }}
                style={{ width: '100%', height: 500, borderRadius: 8 }}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ThanksnoteHistory;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    padding: 6,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 30,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'green',
  },
  tabText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  label: {
    fontSize: 16,
    marginTop: 4,
    color: '#6B7280',
  },
  date: {
    marginTop: 10,
    fontSize: 14,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  btnEdit: {
    flex: 1,
    backgroundColor: 'green',
    marginRight: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnDelete: {
    flex: 1,
    backgroundColor: '#EF4444',
    marginHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnBill: {
    flex: 1,
    backgroundColor: '#3B82F6',
    marginLeft: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  
    elevation: 4,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor:'#fff',
    padding:1,
    borderRadius:100,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
});
