import { SMSMessage } from "../types";

const OPENAI_API_KEY = "";


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

      const formattedMessages = messages
        .map(formatMessage)
        .join('\n');

      const apiUrl = 'https://api.openai.com/v1/chat/completions';

      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a creative storyteller who crafts engaging narratives based on SMS conversations.',
          },
          {
            role: 'user',
            content: `Generate a story based on the following prompt: ${prompt}\n\nMessage History:\n${formattedMessages}\n\nPlease create a narrative that incorporates themes and elements from these messages while maintaining privacy.`,
          },
        ],
        max_tokens: 3200,
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
      console.log("🚀 ~ data.choices[0]:", data.choices[0])
      console.log("🚀 ~ storyContent:", storyContent)

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
