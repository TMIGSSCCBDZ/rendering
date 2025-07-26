import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, getCompositions } from '@remotion/renderer';
import { parseStream } from 'music-metadata';
import fetch from 'node-fetch';

// Set environment variables directly in code for Railway Browserless
// Replace these with your actual Railway Browserless deployment
process.env.BROWSERLESS_URL = 'wss://browserless-production-ca10.up.railway.app'; // Replace with your actual Railway Browserless URL
process.env.BROWSERLESS_TOKEN = 'SA5wjfftRbFYcS2yL9tYkqIeCifg8TTwXtCfJfSwhfYXUYZR'; // Replace with the token from your Browserless Railway app

// Alternative: You can also set these in Railway's environment variables instead of hardcoding

// Define __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug environment variables
console.log('Environment check:');
console.log('BROWSERLESS_URL:', process.env.BROWSERLESS_URL);
console.log('BROWSERLESS_TOKEN:', process.env.BROWSERLESS_TOKEN ? 'SET' : 'NOT SET');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper functions
async function getAudioDurationFromUrlNode(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const stream = response.body;
    const metadata = await parseStream(stream, { duration: true });
    return metadata.format.duration || null;
  } catch (e) {
    console.error('Failed to get duration for', url, e);
    return null;
  }
}

async function getDurationsForUrlsNode(urls) {
  return Promise.all(urls.map(getAudioDurationFromUrlNode));
}

app.post('/render-video', async (req, res) => {
  let browser = null;
  try {
    const { ayahs, config } = req.body;

    // 1. Bundle Remotion
    const entry = path.resolve(__dirname, 'remotion', 'index.ts');
    const bundled = await bundle(entry, () => undefined, {
      outDir: path.resolve(__dirname, 'dist'),
    });

    // 2. Connect to Browserless
    const browserWSEndpoint = `${process.env.BROWSERLESS_URL}?token=${process.env.BROWSERLESS_TOKEN}`;
    console.log('🌐 Connecting to Browserless:', process.env.BROWSERLESS_URL);
    
    try {
      browser = await puppeteer.connect({
        browserWSEndpoint: browserWSEndpoint
      });
      console.log('✅ Successfully connected to Browserless');
    } catch (connectError) {
      console.error('❌ Failed to connect to Browserless:', connectError);
      throw new Error(`Failed to connect to Browserless: ${connectError.message}`);
    }

    // 3. Get compositions using the connected browser
    const compositions = await getCompositions(bundled, { 
      inputProps: { ayahs, config },
      puppeteerInstance: browser
    });
    
    const compId = { 
      classic: 'ClassicTemplate', 
      modern: 'ModernTemplate', 
      capcut: 'CapcutTemplate' 
    }[config.template];
    
    const composition = compositions.find((c) => c.id === compId);
    if (!composition) return res.status(400).json({ error: 'Invalid template' });

    // 4. Audio durations
    const audioDurations = await getDurationsForUrlsNode(config.audioUrl || []);

    // 5. Render to temp file
    const tmpOut = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);
    await renderMedia({
      serveUrl: bundled,
      composition,
      codec: 'h264',
      outputLocation: tmpOut,
      inputProps: { ayahs, config, audioDurations },
      overwrite: true,
      concurrency: 1,
      verbose: true,
      puppeteerInstance: browser
    });

    // 6. Stream MP4
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    fs.createReadStream(tmpOut)
      .on('end', () => {
        fs.unlinkSync(tmpOut);
        // Clean up browser connection
        if (browser) {
          browser.disconnect();
        }
      })
      .pipe(res);
  } catch (err) {
    console.error('Render error:', err);
    // Clean up browser connection on error
    if (browser) {
      try {
        browser.disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting browser:', disconnectError);
      }
    }
    res.status(500).json({ error: 'Render failed', details: err.message || err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Remotion server listening on ${PORT}`));