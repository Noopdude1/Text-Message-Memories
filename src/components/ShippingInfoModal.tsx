import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import useGoogleAuth from '../hooks/useGoogleAuth';
import { validateLuluShippingAddress } from '../utils/luluApiHelper';

const stateCodes = [
  "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA",
  "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA",
  "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC",
  "ND", "MP", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX",
  "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY",
];

const statePostalCodeRanges = {
  AL: { min: 35004, max: 36925 },
  AK: { min: 99501, max: 99950 },
  AZ: { min: 85001, max: 86556 },
  AR: { min: 71601, max: 72959 },
  CA: { min: 90001, max: 96162 },
  CO: { min: 80001, max: 81658 },
  CT: { min: 6001, max: 6928 },
  DE: { min: 19701, max: 19980 },
  FL: { min: 32003, max: 34997 },
  GA: { min: 30002, max: 39901 },
  HI: { min: 96701, max: 96898 },
  ID: { min: 83201, max: 83877 },
  IL: { min: 60001, max: 62999 },
  IN: { min: 46001, max: 47997 },
  IA: { min: 50001, max: 52809 },
  KS: { min: 66002, max: 67954 },
  KY: { min: 40003, max: 42788 },
  LA: { min: 70001, max: 71497 },
  ME: { min: 3901, max: 4992 },
  MD: { min: 20601, max: 21930 },
  MA: { min: 1001, max: 2791 },
  MI: { min: 48001, max: 49971 },
  MN: { min: 55001, max: 56763 },
  MS: { min: 38601, max: 39776 },
  MO: { min: 63001, max: 65899 },
  MT: { min: 59001, max: 59937 },
  NE: { min: 68001, max: 69367 },
  NV: { min: 88901, max: 89883 },
  NH: { min: 3031, max: 3897 },
  NJ: { min: 7001, max: 8989 },
  NM: { min: 87001, max: 88441 },
  NY: { min: 5001, max: 14925 },
  NC: { min: 27006, max: 28909 },
  ND: { min: 58001, max: 58856 },
  OH: { min: 43001, max: 45999 },
  OK: { min: 73001, max: 74966 },
  OR: { min: 97001, max: 97920 },
  PA: { min: 15001, max: 19640 },
  RI: { min: 2801, max: 2940 },
  SC: { min: 29001, max: 29945 },
  SD: { min: 57001, max: 57799 },
  TN: { min: 37010, max: 38589 },
  TX: { min: 73301, max: 88595 },
  UT: { min: 84001, max: 84791 },
  VT: { min: 5001, max: 5907 },
  VA: { min: 20101, max: 24658 },
  WA: { min: 98001, max: 99403 },
  WV: { min: 24701, max: 26886 },
  WI: { min: 53001, max: 54990 },
  WY: { min: 82001, max: 83414 },
};

export interface ShippingInfo {
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

export interface ShippingInfoModalProps {
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
  const [postalError, setPostalError] = useState<string>('');
  const { user } = useGoogleAuth();


  const validatePostalCode = (postal: string, state: string) => {
    if (!postal) {
      setPostalError('');
      return;
    }

    if (!/^\d{5}$/.test(postal)) {
      setPostalError('Please enter a valid 5-digit postal code');
      return;
    }

    if (state && statePostalCodeRanges[state as keyof typeof statePostalCodeRanges]) {
      const range = statePostalCodeRanges[state as keyof typeof statePostalCodeRanges];
      const postalNum = parseInt(postal);

      if (postalNum < range.min || postalNum > range.max) {
        setPostalError(`Invalid postal code for ${state}. Should be between ${range.min}-${range.max}`);
      } else {
        setPostalError('');
      }
    } else {
      setPostalError('');
    }
  };

  const handlePostalChange = (text: string) => {
    const cleanedText = text.replace(/\D/g, '').slice(0, 5);
    onChangeShippingInfo('postal', cleanedText);
    validatePostalCode(cleanedText, shippingInfo.state);
  };

  const handleStateChange = (state: string) => {
    onChangeShippingInfo('state', state);
    if (shippingInfo.postal) {
      validatePostalCode(shippingInfo.postal, state);
    }
  };


  const convertShippingInfo = (info: ShippingInfo) => ({
    city: info.city,
    country_code: info.country,
    name: info.name,
    phone_number: info.phone,
    postcode: info.postal,
    state_code: info.state,
    street1: info.address1,
    email: info.email,
  });

  const handleSavePress = async () => {
    try {
      const luluShippingInfo = convertShippingInfo(shippingInfo);
      const result = await validateLuluShippingAddress(luluShippingInfo);
      // Check for warnings in the result:
      if (result.warning === "incomplete") {
        Alert.alert(
          "Address Incomplete",
          "The shipping address you provided is incomplete and cannot be used to create a print job. Please update your address."
        );
        return;
      }

      if (result.warning && result.warning !== "incomplete") {
        let message = "We noticed some issues with your shipping address.";
        if (result.recommended_address) {
          const rec = result.recommended_address;
          message += `\n\nSuggested Address:\n${rec.street1 || ""}${rec.street2 ? ", " + rec.street2 : ""}\n${rec.city || ""}, ${rec.state_code || ""} ${rec.postcode || ""}\n${rec.country_code || ""}`;
        }
        message += "\n\nDo you want to proceed with your current address?";
        // Prompt the user with the warning before proceeding
        return new Promise<void>((resolve) => {
          Alert.alert(
            "Address Warning",
            message,
            [
              { text: "Cancel", onPress: () => resolve(), style: "cancel" },
              { text: "Continue", onPress: () => { onSave(); resolve(); } },
            ]
          );
        });
      }

      // If no warning, validation passed: call parent's onSave.
      onSave();
    } catch (error) {
      Alert.alert(
        "Address Validation Failed",
        "We were unable to validate your address at this time. Please double-check your shipping information. Do you want to continue anyway?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: onSave },
        ]
      );
    }
  };

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
                onChangeText={(text) => onChangeShippingInfo("name", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter company name (optional)"
                placeholderTextColor="#999"
                value={shippingInfo.company}
                onChangeText={(text) => onChangeShippingInfo("company", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 1 *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter street address"
                placeholderTextColor="#999"
                value={shippingInfo.address1}
                onChangeText={(text) => onChangeShippingInfo("address1", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                placeholder="Apartment, suite, unit, etc. (optional)"
                placeholderTextColor="#999"
                value={shippingInfo.address2}
                onChangeText={(text) => onChangeShippingInfo("address2", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                placeholderTextColor="#999"
                value={shippingInfo.city}
                onChangeText={(text) => onChangeShippingInfo("city", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State/Province *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={shippingInfo.state}
                  onValueChange={handleStateChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a state" value="" style={{ color: "#999" }} />
                  {stateCodes.map((code) => (
                    <Picker.Item key={code} label={code} value={code} style={{ color: "black" }} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Postal Code *</Text>
              <TextInput
                style={[styles.input, postalError ? styles.inputError : null]}
                placeholder="Enter postal code"
                placeholderTextColor="#999"
                value={shippingInfo.postal}
                onChangeText={handlePostalChange}
                keyboardType="numeric"
                maxLength={5}
              />
              {postalError ? (
                <Text style={styles.errorText}>{postalError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter country"
                placeholderTextColor="#999"
                value={shippingInfo.country}
                onChangeText={(text) => onChangeShippingInfo("country", text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                value={shippingInfo.phone}
                onChangeText={(text) => onChangeShippingInfo("phone", text)}
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
                onChangeText={(text) => onChangeShippingInfo("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, postalError ? styles.saveButtonDisabled : null]}
              onPress={handleSavePress}
              disabled={!!postalError}
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
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
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
  saveButtonDisabled: {
    backgroundColor: '#A4C2F4',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default ShippingInfoModal;
