import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

interface ShippingInfo {
  name: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone: string;
  email: string;
}

interface ShippingInfoModalProps {
  visible: boolean;
  shippingInfo: ShippingInfo;
  onChangeShippingInfo: (field: keyof ShippingInfo, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const ShippingInfoModal: React.FC<ShippingInfoModalProps> = ({
  visible,
  shippingInfo,
  onChangeShippingInfo,
  onSave,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Shipping Info</Text>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={shippingInfo.name}
                onChangeText={(text) => onChangeShippingInfo('name', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter company name (optional)"
                placeholderTextColor="#999"
                value={shippingInfo.company}
                onChangeText={(text) => onChangeShippingInfo('company', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 1 *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter street address"
                placeholderTextColor="#999"
                value={shippingInfo.address1}
                onChangeText={(text) => onChangeShippingInfo('address1', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                placeholder="Apartment, suite, unit, etc. (optional)"
                placeholderTextColor="#999"
                value={shippingInfo.address2}
                onChangeText={(text) => onChangeShippingInfo('address2', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                placeholderTextColor="#999"
                value={shippingInfo.city}
                onChangeText={(text) => onChangeShippingInfo('city', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State/Province *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter state or province"
                placeholderTextColor="#999"
                value={shippingInfo.state}
                onChangeText={(text) => onChangeShippingInfo('state', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Postal Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter postal code"
                placeholderTextColor="#999"
                value={shippingInfo.postal}
                onChangeText={(text) => onChangeShippingInfo('postal', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter country"
                placeholderTextColor="#999"
                value={shippingInfo.country}
                onChangeText={(text) => onChangeShippingInfo('country', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                value={shippingInfo.phone}
                onChangeText={(text) => onChangeShippingInfo('phone', text)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                value={shippingInfo.email}
                onChangeText={(text) => onChangeShippingInfo('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
            >
              <Text style={styles.saveButtonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  modalScroll: {
    maxHeight: '70%',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ShippingInfoModal;

