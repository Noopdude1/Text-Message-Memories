import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, Linking, Alert } from 'react-native';
import { StoryPart } from '../types';

const WORDS_PER_PAGE = 120;
const REQUIRED_PAGES = 12;

const BOOK_WIDTH = 4.25;
const BOOK_HEIGHT = 6.87;
const MARGIN = 0.5;
const CONTENT_WIDTH = BOOK_WIDTH - MARGIN * 2;
const CONTENT_HEIGHT = BOOK_HEIGHT - MARGIN * 2;

export const generateHTMLContent = (storyParts: StoryPart[]): string => {
  const totalWords = storyParts.reduce((count, part) => {
    if (part.type === 'text' && part.content) {
      return count + part.content.split(/\s+/).length;
    }
    return count;
  }, 0);

  const requiredWords = REQUIRED_PAGES * WORDS_PER_PAGE;
  const neededWords = Math.max(0, requiredWords - totalWords);
  const placeholderPagesNeeded = Math.ceil(neededWords / WORDS_PER_PAGE);

  const placeholderPages: StoryPart[] = Array.from({ length: placeholderPagesNeeded }, (_, index) => ({
    id: `placeholder-${index}`,
    type: 'blank',
  }));

  const allParts = [...storyParts, ...placeholderPages];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: ${BOOK_WIDTH}in ${BOOK_HEIGHT}in;
            margin: ${MARGIN}in;
          }
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 0;
            color: #333333;
            line-height: 1.8;
            width: ${CONTENT_WIDTH}in;
            height: ${CONTENT_HEIGHT}in;
          }
          .chapter-title {
            font-size: 16px;
            color: #2c3e50;
            height: ${CONTENT_HEIGHT}in;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            page-break-before: always;
            page-break-after: always;
          }
          .section-heading {
            font-size: 14px;
            color: #34495e;
            margin-top: 0.2in;
            margin-bottom: 0.2in;
            text-align: left;
            font-weight: bold;
          }
          .page-image {
            display: block;
            width: 100%;
            max-height: 3in;
            object-fit: cover;
            margin: 0.2in auto;
            border-radius: 0.1in;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
          }
          .page-text {
            font-size: 10px;
            margin-bottom: 0.3in;
            text-align: justify;
          }
          .page-section {
            margin-bottom: 0.3in;
            page-break-inside: avoid;
          }
          .placeholder-page {
            height: ${CONTENT_HEIGHT}in;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            color: #999;
            text-align: center;
            font-style: italic;
            page-break-before: always;
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        ${allParts
          .map((part) => {
            if (part.type === 'heading' && part.content) {
              return `
                <div class="chapter-title">${part.content}</div>
              `;
            } else if (part.type === 'image' && 'uri' in part && part.uri) {
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
            } else if (part.type === 'blank') {
              return `
                <div class="placeholder-page">
                </div>
              `;
            }
            return '';
          })
          .join('')}
      </body>
    </html>
  `;
};

export const generatePDF = async (storyParts: StoryPart[]): Promise<string | null> => {
  try {
    const pictureCount = storyParts.filter((part) => part.type === 'image' && part.uri).length;

    if (pictureCount < 5) {
      Alert.alert(
        'Warning',
        `You have only added ${pictureCount} pictures. Blank spaces will appear where images are missing.`
      );
    }

    const htmlContent = generateHTMLContent(storyParts);

    const options = {
      html: htmlContent,
      fileName: `storybook_${Date.now()}`,
      directory: 'Documents',
      width: BOOK_WIDTH * 72,
      height: BOOK_HEIGHT * 72,
      margin: MARGIN * 72,
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
