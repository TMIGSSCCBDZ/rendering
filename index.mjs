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
process.env.BROWSERLESS_URL = 'wss://browserless-production-ca10.up.railway.app/playwright?token=SA5wjfftRbFYcS2yL9tYkqIeCifg8TTwXtCfJfSwhfYXUYZR'; // Replace with your actual Railway Browserless URL
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
  try {
    const { ayahs, config } = req.body;

    // 1. Bundle Remotion
    const entry = path.resolve(__dirname, 'remotion', 'index.ts');
    const bundled = await bundle(entry, () => undefined, {
      outDir: path.resolve(__dirname, 'dist'),
    });

    // 2. Configure browser options with multiple fallback strategies
    let browserOptions = {};
    
    // Strategy 1: Try Browserless if credentials are available
    if (process.env.BROWSERLESS_URL && process.env.BROWSERLESS_TOKEN && process.env.BROWSERLESS_TOKEN !== 'your_browserless_token_here') {
      console.log('🌐 Using Browserless cloud service');
      browserOptions = {
        chromiumOptions: {
          wsEndpoint: `${process.env.BROWSERLESS_URL}?token=${process.env.BROWSERLESS_TOKEN}`
        }
      };
    } 
    // Strategy 2: Force disable local Chrome and use Puppeteer's bundled Chromium
    else {
      console.log('🔧 Attempting to use alternative browser strategy');
      
      // Set Puppeteer environment variables to use bundled Chromium
      process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'false';
      process.env.PUPPETEER_EXECUTABLE_PATH = '';
      
      browserOptions = {
        // Try to force Remotion to use a different browser approach
        browserExecutable: null, // Let Puppeteer find its own browser
        chromiumOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-web-security',
            '--disable-features=TranslateUI,VizDisplayCompositor',
            '--disable-extensions',
            '--disable-default-apps',
            '--use-gl=swiftshader',
            '--disable-software-rasterizer',
            '--disable-background-networking',
            '--disable-background-mode',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-domain-reliability',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-sync',
            '--metrics-recording-only',
            '--safebrowsing-disable-auto-update',
            '--memory-pressure-off',
            '--max_old_space_size=4096',
            '--disable-ipc-flooding-protection',
            // Additional flags for Railway/nixOS
            '--disable-logging',
            '--disable-login-animations',
            '--disable-motion-blur',
            '--disable-3d-apis',
            '--disable-threaded-animation',
            '--disable-threaded-scrolling',
            '--disable-in-process-stack-traces',
            '--disable-histogram-customizer',
            '--disable-gl-extensions',
            '--disable-composited-antialiasing',
            '--disable-canvas-aa',
            '--disable-3d-apis',
            '--disable-accelerated-2d-canvas',
            '--disable-accelerated-jpeg-decoding',
            '--disable-accelerated-mjpeg-decode',
            '--disable-app-list-dismiss-on-blur',
            '--disable-accelerated-video-decode'
          ]
        }
      };
    }

    console.log('Browser options configured:', JSON.stringify(browserOptions, null, 2));

    // 3. Get compositions
    const compositions = await getCompositions(bundled, { 
      inputProps: { ayahs, config },
      ...browserOptions
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
      ...browserOptions
    });

    // 6. Stream MP4
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    fs.createReadStream(tmpOut)
      .on('end', () => fs.unlinkSync(tmpOut))
      .pipe(res);
  } catch (err) {
    console.error('Render error:', err);
    res.status(500).json({ error: 'Render failed', details: err.message || err });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Remotion server listening on ${PORT}`));