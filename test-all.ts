import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { prisma } from './lib/prisma';
import 'dotenv/config';

async function test() {
  console.log("Testing Prisma...");
  try {
    const sources = await prisma.learningSource.findMany();
    console.log("Prisma success, found sources:", sources.length);
  } catch (e) {
    console.error("Prisma failed:", e);
  }

  console.log("\nTesting AI...");
  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'Hello',
    });
    console.log("AI success:", text);
  } catch (e) {
    console.error("AI failed (1.5-flash):", e.message);
  }

  try {
    const { text } = await generateText({
      model: google('gemini-pro'),
      prompt: 'Hello',
    });
    console.log("AI success (gemini-pro):", text);
  } catch (e) {
    console.error("AI failed (gemini-pro):", e.message);
  }
}

test();
