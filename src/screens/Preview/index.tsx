import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { NavigationParams, StoryPart } from '../../types';
import { generatePDF } from '../../utils/htmlToPDFHelper';
import { uploadToCloudinary } from '../../utils/cloudinaryHelper';
import LottieView from 'lottie-react-native';
import TopBar from '../../components/TopBar';
import BottomBar from '../../components/BottomBar';
import { useCart } from '../../context/CartContext';

type PreviewScreenNavigationProp = NativeStackNavigationProp<NavigationParams, 'Preview'>;
type PreviewScreenRouteProp = RouteProp<NavigationParams, 'Preview'>;

interface PreviewScreenProps {
  route: PreviewScreenRouteProp;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ route }) => {
  const navigation = useNavigation<PreviewScreenNavigationProp>();
  const { storyParts } = route.params;

  // 1) We now also read the cart items so we can see how many books are in it
  const { cartItems, addToCart } = useCart();

  const [isGenerating, setIsGenerating] = useState(true);
  const [pdfCloudUrl, setPdfCloudUrl] = useState<string | null>(null);
  const [webViewError, setWebViewError] = useState<boolean>(false);

  const ensureStoragePermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      const permissions =
        Platform.Version >= 33
          ? [PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES]
          : [
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted = permissions.every(
        (permission) => granted[permission] === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert(
          'Permissions Required',
          'Storage permissions are required to generate and save your storybook. Please enable permissions in your device settings.'
        );
        return false;
      }
      return true;
    }
    return true;
  }, []);

  const generateAndUploadPDF = useCallback(async () => {
    try {
      setIsGenerating(true);
      setWebViewError(false);
      await ensureStoragePermissions();

      const pdfPath = await generatePDF(storyParts);
      if (!pdfPath) {
        throw new Error('Failed to generate PDF');
      }

      const uniqueFileName = `storybook_${Date.now()}`;
      const uploadedUrl = await uploadToCloudinary(`file://${pdfPath}`, uniqueFileName);
      if (!uploadedUrl) {
        throw new Error('Failed to upload PDF to Cloudinary');
      }

      setPdfCloudUrl(uploadedUrl);
    } catch (error) {
      console.error('PDF Generation or Upload Error:', error);
      Alert.alert('Error', 'Failed to generate or upload PDF. Please try again.');
      navigation.goBack();
    } finally {
      setIsGenerating(false);
    }
  }, [storyParts, navigation]);

  useEffect(() => {
    generateAndUploadPDF();
  }, [generateAndUploadPDF]);

  // 2) Apply 15% discount only if cart already has at least 1 item
  //    First book => 21.99, subsequent => 21.99 * 0.85 => 18.70
  const getPriceWithDiscount = () => {
    const basePrice = 21.99;
    if (cartItems.length === 0) {
      return basePrice; // First item, no discount
    } else {
      const discounted = Number((basePrice * 0.85).toFixed(2));
      return discounted;
    }
  };

  const handleAddToCart = () => {
    if (!pdfCloudUrl) {
      Alert.alert('Error', 'PDF not ready yet. Please try again.');
      return;
    }

    // 3) Use the "getPriceWithDiscount()" function
    const finalPrice = getPriceWithDiscount();

    addToCart({
      id: Date.now().toString(),
      title: 'My Storybook',
      content: storyParts.map((part) => part.content || '').join('\n'),
      pdfPath: pdfCloudUrl,
      price: finalPrice,
      coverImage: storyParts.find((part) => part.type === 'image')?.uri || '',
    });

    navigation.navigate('Cart');
  };

  if (isGenerating) {
    return <BookAnimation />;
  }

  if (webViewError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load the PDF preview.</Text>
        <TouchableOpacity onPress={generateAndUploadPDF} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="Storybook Preview" currentStep={4} totalSteps={5} />
      <WebView
        source={{
          uri:
            `https://pdf-flipbook-one.vercel.app/?url=${
              pdfCloudUrl ?? 'https://res.cloudinary.com/needbuddy/image/upload/v1733004074/sample_c0pubo.pdf'
            }`,
        }}
        style={styles.webview}
        onError={() => setWebViewError(true)}
        startInLoadingState={true}
        renderLoading={() => <BookAnimation message="Loading your book...." />}
      />
      <BottomBar
        currentStep={4}
        totalSteps={5}
        onNext={handleAddToCart}
        onBack={() => navigation.goBack()}
        isNextEnabled={!!pdfCloudUrl && !webViewError}
      />
    </View>
  );
};

export function BookAnimation({ message = `Generating your storybook...` }) {
  return (
    <View style={styles.animationOverlay}>
      <LottieView
        source={require('../../Assets/Animations/book-turner.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  webview: {
    flex: 1,
  },
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PreviewScreen;
