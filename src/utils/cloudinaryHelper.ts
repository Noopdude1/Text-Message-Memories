import RNFS from 'react-native-fs';
import sha1 from 'js-sha1';
// Cloudinary credentials
const API_KEY = "814126778295361";
const API_SECRET = "hgdrt9WVQyZ5xIZVRYsL_pwWE2Y";
const CLOUD_NAME = "dxqf5qlf6";
const PDF_UPLOAD_PRESET = "ml_default";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

export const uploadToCloudinary = async (filePath: string): Promise<string | null> => {
  try {
    // Read the file and convert it to a base64-encoded string
    const base64Data = await RNFS.readFile(filePath, 'base64');
    const file = `data:application/pdf;base64,${base64Data}`;

    // Generate the timestamp
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Create the string to sign
    const signatureString = `timestamp=${timestamp}&upload_preset=${PDF_UPLOAD_PRESET}${API_SECRET}`;

    // Generate the SHA-1 signature
    const signature = sha1.sha1(signatureString);

    // Prepare the form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', PDF_UPLOAD_PRESET);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    // Make the POST request to Cloudinary using fetch
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Upload Successful:', result.secure_url);
      return result.secure_url;
    } else {
      console.error('Cloudinary Upload Error:', result);
      return null;
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};
