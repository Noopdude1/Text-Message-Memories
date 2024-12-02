import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, Linking, Alert } from 'react-native';
import { StoryPart } from '../types';
import { uploadToCloudinary } from './cloudinaryHelper';

export const generateHTMLContent = (storyParts: StoryPart[]): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 40px;
            size: A4;
          }
          body {
            font-family: 'Helvetica', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
          .content {
            padding: 40px;
            box-sizing: border-box;
          }
          .chapter-title {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 30px;
            font-weight: bold;
            text-align: center;
          }
          .page-image {
            width: 100%;
            height: auto;
            margin-bottom: 20px;
            border-radius: 12px;
            page-break-inside: avoid;
          }
          .page-text {
            font-size: 18px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 20px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="content">
          <div class="chapter-title">My Story</div>
          ${storyParts
            .map((part) => {
              if (part.type === 'image' && part.uri) {
                return `<img class="page-image" src="${part.uri}" alt="Story illustration" />`;
              } else if (part.type === 'text' && part.content) {
                return `<div class="page-text">${part.content}</div>`;
              } else {
                return '';
              }
            })
            .join('')}
        </div>
      </body>
    </html>
  `;
};

export const generatePDF = async (storyParts: StoryPart[]): Promise<string | null> => {
  try {
    const processedStoryParts = await Promise.all(
      storyParts.map(async (part) => {
        if (part.type === 'image' && part.uri) {
          const imagePath = part.uri.startsWith('file://') ? part.uri.replace('file://', '') : part.uri;
          const base64Data = await RNFS.readFile(imagePath, 'base64');
          const dataUri = `data:image/jpeg;base64,${base64Data}`;
          return { ...part, uri: dataUri };
        }
        return part;
      })
    );

    const htmlContent = generateHTMLContent(processedStoryParts);

    const options = {
      html: htmlContent,
      fileName: `storybook_${Date.now()}`,
      directory: 'Documents',
      padding: 0,
      height: 842,
      width: 595,
      backgroundColor: '#ffffff',
    };

    const result = await RNHTMLtoPDF.convert(options);

    return result.filePath || null;
  } catch (error) {
    console.error('PDF generation error:', error);
    return null;
  }
};

export const uploadPDFToCloudinary = async (pdfPath: string): Promise<string | null> => {
  try {
    const cloudinaryUrl = await uploadToCloudinary(pdfPath);
    return cloudinaryUrl;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

export const downloadPDF = async (pdfPath: string): Promise<string | null> => {
  try {
    const timestamp = Date.now();
    const downloadPath = Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/mystorybook_${timestamp}.pdf`,
      android: `${RNFS.DownloadDirectoryPath}/mystorybook_${timestamp}.pdf`,
    });

    if (!downloadPath) return null;

    await RNFS.copyFile(pdfPath, downloadPath);

    const fileURL = Platform.OS === 'android' ? `file://${downloadPath}` : downloadPath;
    const supported = await Linking.canOpenURL(fileURL);

    if (supported) {
      await Linking.openURL(fileURL);
    } else {
      Alert.alert('Error', 'Unable to open the PDF file.');
      return null;
    }

    return downloadPath;
  } catch (error) {
    console.error('PDF download error:', error);
    return null;
  }
};

