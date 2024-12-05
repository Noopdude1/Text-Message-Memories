import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, Linking, Alert } from 'react-native';
import { StoryPart } from '../types';

export const generateHTMLContent = (storyParts: StoryPart[]): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 40px;
            size: A4; /* Ensures A4 size */
          }
          body {
            font-family: 'Helvetica', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
            color: #2c3e50;
            width: 210mm; /* A4 width */
            height: 297mm; /* A4 height */
          }
          .content {
            padding: 30px;
            box-sizing: border-box;
          }
          .chapter-title {
            font-size: 32px;
            color: #2c3e50;
            text-transform: uppercase;
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
            border-bottom: 2px solid #ddd;
            padding-bottom: 10px;
          }
          .section-heading {
            font-size: 24px;
            color: #34495e;
            margin-top: 20px;
            margin-bottom: 10px;
            text-align: left;
            font-weight: bold;
          }
          .page-image {
            display: block;
            width: 100%; /* Full width within margins */
            max-width: 180mm; /* Ensure it fits A4 width */
            height: auto; /* Maintain aspect ratio */
            object-fit: cover;
            margin: 20px auto;
            border-radius: 10px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
          }
          .page-text {
            font-size: 18px;
            line-height: 1.8;
            margin-bottom: 20px;
            text-align: justify;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          }
          .page-section {
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <div class="content">
          <div class="chapter-title">My Story</div>
          ${storyParts
            .map((part) => {
              if (part.type === 'heading' && part.content) {
                return `
                  <div class="section-heading">${part.content}</div>
                `;
              } else if (part.type === 'image' && part.uri) {
                return `
                  <div class="page-section">
                    <img class="page-image" src="${part.uri}" alt="Story illustration" />
                  </div>
                `;
              } else if (part.type === 'text' && part.content) {
                return `
                  <div class="page-section">
                    <div class="page-text">${part.content}</div>
                  </div>
                `;
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

