import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface UserAgreementProps {
  onAgree: () => void;
  onExit: () => void;
}

const UserAgreement: React.FC<UserAgreementProps> = ({ onAgree, onExit }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Consent Agreement</Text>
        <Text style={styles.subtitle}>SMS & Contact Access</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.emphasis}>
            Before proceeding, please read the following carefully.
          </Text>

          <Text style={styles.description}>
            Our app requires access to your SMS messages and contacts to provide a personalized experience by displaying your conversations and generating stories based on them with the help of OpenAI.
          </Text>

          <Text style={styles.sectionHeader}>
            We take your privacy and security seriously. By granting SMS and contact access, you acknowledge and agree to the following:
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Purpose of SMS & Contact Access</Text>
            <Text style={styles.bulletPoint}>• Our app will access your SMS messages only to display your conversations and generate stories between the sender and receiver.</Text>
            <Text style={styles.bulletPoint}>• We only send your selected conversation messages to OpenAI for generating a story.</Text>
            <Text style={styles.bulletPoint}>• We read your contacts to retrieve the names of senders and receivers so that the generated stories can address the characters by name.</Text>
            <Text style={styles.bulletPoint}>• We do not store, share, or use your contact information for any other purpose.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. User Control & Transparency</Text>
            <Text style={styles.bulletPoint}>• You have full control over the conversations you choose to use within the app.</Text>
            <Text style={styles.bulletPoint}>• You can revoke SMS and contact access at any time through your device settings.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Security</Text>
            <Text style={styles.bulletPoint}>• Your messages and contact data remain private and are not stored on our servers.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Your Choices & Consent</Text>
            <Text style={styles.bulletPoint}>• You have the option to grant or deny SMS and contact access.</Text>
            <Text style={styles.bulletPoint}>• If you choose not to grant access, you may exit the app.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.exitButton]}
          onPress={onExit}
        >
          <Text style={styles.exitButtonText}>Exit App</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.agreeButton]}
          onPress={onAgree}
        >
          <Text style={styles.agreeButtonText}>Agree & Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  emphasis: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exitButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC3545',
    marginRight: 8,
  },
  agreeButton: {
    backgroundColor: '#0066FF',
    marginLeft: 8,
  },
  exitButtonText: {
    color: '#DC3545',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  agreeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserAgreement;