import { google } from '@ai-sdk/google';
import 'dotenv/config';

async function listModels() {
  console.log("Listing models...");
  try {
    // There isn't a direct listModels in @ai-sdk/google but we can try to guess or use the underlying client
    // Actually, I'll try some known names from recently seen projects
    const models = [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-pro',
      'gemini-flash',
      'gemini-1.0-pro',
      'gemini-3-pro-preview'
    ];

    for (const m of models) {
      try {
        const { text } = await require('ai').generateText({
          model: google(m),
          prompt: 'hi',
        });
        console.log(`Model ${m} WORKS! Result: ${text.substring(0, 10)}...`);
        break; // found one!
      } catch (e) {
        console.log(`Model ${m} failed: ${e.message.split('\n')[0]}`);
      }
    }
  } catch (e) {
    console.error("Failed:", e);
  }
}

listModels();
