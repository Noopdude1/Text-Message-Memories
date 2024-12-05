import RNFS from 'react-native-fs';

const API_KEY = "814126778295361";
const API_SECRET = "hgdrt9WVQyZ5xIZVRYsL_pwWE2Y";
const CLOUD_NAME = "dxqf5qlf6";
const PDF_UPLOAD_PRESET = "ml_default";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

export const uploadToCloudinary = async (
  filePath: string,
  fileName: string
): Promise<string | null> => {
  try {

    const base64Data = await RNFS.readFile(filePath, 'base64');
    const file = `data:application/pdf;base64,${base64Data}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', PDF_UPLOAD_PRESET);
    formData.append('api_key', API_KEY);

    formData.append('public_id', fileName);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
