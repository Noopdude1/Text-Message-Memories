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
import Button from './Button';

// --------------------------------------------------
// STATE & CITY DATA
// --------------------------------------------------
const stateCodes = [
  "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA",
  "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA",
  "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC",
  "ND", "MP", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX",
  "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY",
];

// Example city list by state. This is partial, covering major cities.
// If you truly need ALL U.S. cities, consider an external data source!
export const cityListByState: { [key: string]: string[] } = {
  AL: ["Birmingham", "Huntsville", "Montgomery", "Mobile", "Tuscaloosa", "Hoover", "Dothan", "Auburn", "Decatur", "Madison", "Custom"],
  AK: ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla", "Kenai", "Kodiak", "Bethel", "Palmer", "Custom"],
  AZ: ["Phoenix", "Tucson", "Mesa", "Chandler", "Glendale", "Scottsdale", "Gilbert", "Tempe", "Peoria", "Surprise", "Custom"],
  AR: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "North Little Rock", "Conway", "Rogers", "Hot Springs", "Bentonville", "Custom"],
  CA: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Custom"],
  CO: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo", "Greeley", "Custom"],
  CT: ["Bridgeport", "New Haven", "Stamford", "Hartford", "Waterbury", "Norwalk", "Danbury", "New Britain", "Bristol", "Meriden", "Custom"],
  DE: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "Milford", "Seaford", "Georgetown", "Elsmere", "New Castle", "Custom"],
  DC: ["Washington", "Custom"],
  FL: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Port St. Lucie", "Cape Coral", "Fort Lauderdale", "Custom"],
  GA: ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah", "Athens", "Sandy Springs", "Roswell", "Johns Creek", "Warner Robins", "Custom"],
  HI: ["Honolulu", "East Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu", "Kāne‘ohe", "Mililani Town", "Kahului", "‘Ewa Gentry", "Custom"],
  ID: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Caldwell", "Pocatello", "Coeur d'Alene", "Twin Falls", "Post Falls", "Lewiston", "Custom"],
  IL: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield", "Elgin", "Peoria", "Champaign", "Waukegan", "Custom"],
  IN: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Lafayette", "Custom"],
  IA: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Ankeny", "West Des Moines", "Ames", "Waterloo", "Council Bluffs", "Custom"],
  KS: ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence", "Shawnee", "Manhattan", "Lenexa", "Salina", "Custom"],
  KY: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Richmond", "Georgetown", "Florence", "Hopkinsville", "Nicholasville", "Custom"],
  LA: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe", "Alexandria", "Houma", "Custom"],
  ME: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Sanford", "Saco", "Augusta", "Westbrook", "Custom"],
  MD: ["Baltimore", "Columbia", "Germantown", "Silver Spring", "Waldorf", "Ellicott City", "Frederick", "Dundalk", "Rockville", "Bethesda", "Custom"],
  MA: ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "New Bedford", "Brockton", "Quincy", "Lynn", "Fall River", "Custom"],
  MI: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn", "Livonia", "Westland", "Custom"],
  MN: ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth", "Maple Grove", "Woodbury", "St. Cloud", "Custom"],
  MS: ["Jackson", "Gulfport", "Southaven", "Biloxi", "Hattiesburg", "Olive Branch", "Tupelo", "Meridian", "Greenville", "Madison", "Custom"],
  MO: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "Blue Springs", "Custom"],
  MT: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell", "Belgrade", "Havre", "Miles City", "Custom"],
  NE: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont", "Hastings", "Norfolk", "North Platte", "Columbus", "Custom"],
  NV: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Elko", "Mesquite", "Boulder City", "Fernley", "Custom"],
  NH: ["Manchester", "Nashua", "Concord", "Derry", "Dover", "Rochester", "Salem", "Merrimack", "Hudson", "Londonderry", "Custom"],
  NJ: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Lakewood", "Edison", "Woodbridge", "Toms River", "Hamilton", "Trenton", "Custom"],
  NM: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington", "Clovis", "Hobbs", "Alamogordo", "Carlsbad", "Custom"],
  NY: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica", "Custom"],
  NC: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Concord", "Custom"],
  ND: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston", "Dickinson", "Mandan", "Jamestown", "Wahpeton", "Custom"],
  OH: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain", "Custom"],
  OK: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond", "Lawton", "Moore", "Midwest City", "Enid", "Stillwater", "Custom"],
  OR: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Beaverton", "Bend", "Medford", "Springfield", "Corvallis", "Custom"],
  PA: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "York", "Custom"],
  RI: ["Providence", "Cranston", "Warwick", "Pawtucket", "East Providence", "Woonsocket", "Coventry", "Cumberland", "North Providence", "South Kingstown", "Custom"],
  SC: ["Charleston", "Columbia", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Summerville", "Sumter", "Goose Creek", "Hilton Head Island", "Custom"],
  SD: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell", "Yankton", "Pierre", "Huron", "Spearfish", "Custom"],
  TN: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Jackson", "Johnson City", "Bartlett", "Custom"],
  TX: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Custom"],
  UT: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden", "St. George", "Layton", "South Jordan", "Custom"],
  VT: ["Burlington", "South Burlington", "Rutland", "Barre", "Montpelier", "Winooski", "St. Albans", "Newport", "Vergennes", "Essex Junction", "Custom"],
  VA: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News", "Alexandria", "Hampton", "Roanoke", "Portsmouth", "Suffolk", "Custom"],
  WA: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Yakima", "Federal Way", "Custom"],
  WV: ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling", "Weirton", "Fairmont", "Martinsburg", "Beckley", "Clarksburg", "Custom"],
  WI: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Eau Claire", "Oshkosh", "Janesville", "Custom"],
  WY: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River", "Evanston", "Riverton", "Jackson", "Custom"],
};

// Example range checks for US states
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

// Only using "US" here, but you can expand if needed.
const countryCodes = ["US"];

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
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);
  const { user } = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------------------------------
  // POSTAL CODE VALIDATION
  // --------------------------------------------------
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
      // If the state isn't in the data or empty, no specific range check
      setPostalError('');
    }
  };

  // --------------------------------------------------
  // HANDLERS
  // --------------------------------------------------
  const handlePostalChange = (text: string) => {
    const cleanedText = text.replace(/\D/g, '').slice(0, 5);
    onChangeShippingInfo('postal', cleanedText);
    validatePostalCode(cleanedText, shippingInfo.state);
  };

  const handleStateChange = (newState: string) => {
    onChangeShippingInfo('state', newState);
    // Reset city if the user changes state
    onChangeShippingInfo('city', '');
    setIsCustomCity(false);
    if (shippingInfo.postal) {
      validatePostalCode(shippingInfo.postal, newState);
    }
  };

  const handleCityChange = (cityValue: string) => {
    if (cityValue === "Custom") {
      // Switch to custom city text input
      setIsCustomCity(true);
      onChangeShippingInfo('city', '');
    } else {
      setIsCustomCity(false);
      onChangeShippingInfo('city', cityValue);
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

  // --------------------------------------------------
  // SAVE BUTTON -> VALIDATE WITH LULU
  // --------------------------------------------------
  const handleSavePress = async () => {

    try {
      setIsLoading(true);
      const luluShippingInfo = convertShippingInfo(shippingInfo);
      const result = await validateLuluShippingAddress(luluShippingInfo);

      // If Lulu says address is incomplete:
      if (result.warning === "incomplete") {
        Alert.alert(
          "Address Incomplete",
          "The shipping address you provided is incomplete and cannot be used to create a print job. Please update your address.",
          [{ text: "OK" }]
        );
        return;
      }

      // If there's another warning:
      if (result.warning && result.warning !== "incomplete") {
        let message = "We noticed some issues with your shipping address.";
        if (result.recommended_address) {
          const rec = result.recommended_address;
          message += `\n\nSuggested Address:\n${rec.street1 || ""}${rec.street2 ? ", " + rec.street2 : ""}\n${rec.city || ""}, ${rec.state_code || ""} ${rec.postcode || ""}\n${rec.country_code || ""}`;
        }
        message += "\n\nPlease fix the address before continuing.";

        Alert.alert("Address Warning", message, [{ text: "OK" }]);
        return;
      }

      // If no warning, address validated successfully -> proceed
      onSave();
    } catch (error) {
      // If the address validation call fails altogether:
      Alert.alert(
        "Address Validation Failed",
        "We were unable to validate your address at this time. Please fix your shipping information or try again later. You cannot continue without a valid address.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
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
            {/* Full Name */}
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

            {/* Company */}
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

            {/* Address 1 */}
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

            {/* Address 2 */}
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

            {/* State */}
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

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              {!isCustomCity && (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={
                      // If shippingInfo.city isn't in the array, default to ""
                      cityListByState[shippingInfo.state]?.includes(shippingInfo.city)
                        ? shippingInfo.city
                        : ""
                    }
                    onValueChange={handleCityChange}
                    style={styles.picker}
                    enabled={!!shippingInfo.state && cityListByState[shippingInfo.state]?.length > 0}
                  >
                    {(!shippingInfo.state || !cityListByState[shippingInfo.state]) && (
                      <Picker.Item
                        label="No cities available"
                        value=""
                        style={{ color: "#999" }}
                      />
                    )}

                    {shippingInfo.state &&
                      cityListByState[shippingInfo.state]?.map((cityOption) => (
                        <Picker.Item
                          key={cityOption}
                          label={cityOption}
                          value={cityOption}
                          style={{ color: "black" }}
                        />
                      ))
                    }
                  </Picker>
                </View>
              )}

              {/* If custom city is chosen, show text input */}
              {isCustomCity && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter city name"
                  placeholderTextColor="#999"
                  value={shippingInfo.city}
                  onChangeText={(text) => onChangeShippingInfo("city", text)}
                />
              )}
            </View>

            {/* Postal Code */}
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

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={shippingInfo.country}
                  onValueChange={(value) => onChangeShippingInfo("country", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a country" value="" style={{ color: "#999" }} />
                  {countryCodes.map((code) => (
                    <Picker.Item key={code} label={code} value={code} style={{ color: "black" }} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Phone Number */}
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

            {/* Email Address */}
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

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Button
              title='Save & Continue'
              onPress={handleSavePress}
              disabled={!!postalError}
              loading={isLoading}
              style={styles.saveButton}
              textStyle={{fontSize: 17}}
            />

          </View>
        </View>
      </View>
    </Modal>
  );
};

// --------------------------------------------------
// STYLES
// --------------------------------------------------
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
    width: 180,
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
});

export default ShippingInfoModal;
