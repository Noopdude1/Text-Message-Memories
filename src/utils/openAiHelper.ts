import { SMSMessage } from '../types';

const OPENAI_API_KEY = '';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
}

interface GenerateStoryParams {
  prompt: string;
  messages: SMSMessage[];
}

const formatMessage = (message: SMSMessage): string => {
  const timestamp = new Date(message.date).toLocaleString();
  return `[${timestamp}] ${message.address}: ${message.body}`;
};

/**
 * Generates a story based on a prompt and SMS messages
 * @param {GenerateStoryParams} param0 - prompt and messages
 * @returns {Promise<string | null>} - the generated story or null if an error occurs
 */
export const generateStory = async ({
  prompt,
  messages,
}: GenerateStoryParams): Promise<string | null> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    if (!prompt.trim()) {
      throw new Error('Prompt cannot be empty');
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array must not be empty');
    }

    const formattedMessages = messages.map(formatMessage).join('\n');

    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a descriptive storyteller who crafts immersive narratives from SMS conversations. Use double hash "##" at the start of a line for main section headings only. Create rich, detailed scenes that bring the conversations to life through vivid descriptions and emotional depth.',
        },
        {
          role: 'user',
          content: `Generate a detailed story based on the following prompt: ${prompt}\n\nMessage History:\n${formattedMessages}\n\nEnsure the story:
          - Uses only double hash (##) for main section headings
          - Creates vivid scenes and atmospheric descriptions
          - Develops distinct character voices and personalities
          - Expands key moments with sensory details and emotional depth`,
        },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Error details:', errorDetails);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    const storyContent = data.choices[0]?.message?.content;

    if (!storyContent) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    if (data.choices[0].finish_reason !== 'stop') {
      console.warn('Story generation may have been truncated');
    }

    return storyContent;
  } catch (error) {
    console.error('Failed to generate story with OpenAI API:', error);
    return null;
  }
};

/**
 * Generates an image based on a description using OpenAI's DALL·E 3 model
 * @param {string} description - Description of the image to generate
 * @returns {Promise<string>} - URL of the generated image
 */
export const generateImage = async (description: string): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: description,
        n: 1,
        model: 'dall-e-3',
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Image generation error details:', errorDetails);
      throw new Error(`Image generation failed with status ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    if (!imageUrl) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    return imageUrl;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
