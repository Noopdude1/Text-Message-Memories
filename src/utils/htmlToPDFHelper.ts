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
            size: 12in 12in;
            margin: 0.5in;
          }
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 0;
            color: #333333;
            line-height: 1.8;
          }
          .content {
            width: 11in;
            height: 11in;
            padding: 0.5in;
            box-sizing: border-box;
            margin: auto;
            background-color: white;
            position: relative;
          }
          .chapter-title {
            font-size: 28px;
            color: #2c3e50;
            text-align: center;
            margin-bottom: 0.5in;
            font-weight: bold;
            text-transform: uppercase;
          }
          .section-heading {
            font-size: 18px;
            color: #34495e;
            margin-top: 0.5in;
            margin-bottom: 0.3in;
            text-align: left;
            font-weight: bold;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .page-image {
            display: block;
            width: 100%;
            max-height: 6in;
            object-fit: cover;
            margin: 0.3in auto;
            border-radius: 0.2in;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          }
          .page-text {
            font-size: 12px;
            margin-bottom: 0.5in;
            text-align: justify;
          }
          .page-section {
            margin-bottom: 0.5in;
            page-break-inside: avoid;
          }
          .footer {
            position: absolute;
            bottom: 0.3in;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #777;
          }
          .page-number:after {
            content: counter(page);
          }
          @media print {
            .page-break {
              page-break-before: always;
            }
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
          try {
            const imagePath = part.uri.startsWith('file://') ? part.uri.replace('file://', '') : part.uri;

            const fileExists = await RNFS.exists(imagePath);
            if (!fileExists) {
              console.warn(`Image file not found: ${imagePath}`);
              return null;
            }

            const fileInfo = await RNFS.stat(imagePath);
            const maxFileSize = 10 * 1024 * 1024;
            if (fileInfo.size > maxFileSize) {
              console.warn(`Image file too large: ${imagePath}`);
              return null;
            }

            const base64Data = await RNFS.readFile(imagePath, 'base64');
            return { ...part, uri: `data:image/jpeg;base64,${base64Data}` };
          } catch (imageError) {
            console.error(`Error processing image: ${part.uri}`, imageError);
            return null;
          }
        }
        return part;
      })
    );

    const validProcessedParts = processedStoryParts.filter(part => part !== null);

    const htmlContent = generateHTMLContent(validProcessedParts);

    const options = {
      html: htmlContent,
      fileName: `storybook_${Date.now()}`,
      directory: 'Documents',
      width: 12 * 72, // Convert 12 inches to points
      height: 12 * 72, // Convert 12 inches to points
      margin: 0.5 * 72, // 0.5-inch margin in points
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

