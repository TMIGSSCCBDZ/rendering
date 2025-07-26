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

// Define __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    // 2. Configure browser options
    const browserOptions = {};
    
    // If using Browserless cloud service
    if (process.env.BROWSERLESS_URL && process.env.BROWSERLESS_TOKEN) {
      console.log('Using Browserless cloud service');
      browserOptions.chromiumOptions = {
        wsEndpoint: `${process.env.BROWSERLESS_URL}?token=${process.env.BROWSERLESS_TOKEN}`
      };
    } else {
      // Fallback to local Chrome with all necessary flags
      console.log('Using local Chrome with optimized flags');
      browserOptions.chromiumOptions = {
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
          '--disable-ipc-flooding-protection'
        ]
      };
    }

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