import { Composition } from 'remotion';
import { ClassicTemplate } from './templates/classic-template';
import { ModernTemplate } from './templates/modern-template';
import { CapcutTemplate } from './templates/capcut-template';

// **NEW: Helper function to calculate duration**
export const calculateVideoDuration = (ayahs:[], config :any = {}, audioDurations = []) => {
const titleDuration = config.titleDuration || 2;
const closingDuration = config.closingDuration || 1;
const fps = config.fps || 30;
const totalAyahSeconds = audioDurations.length === ayahs.length
  ? audioDurations.reduce((sum, dur) => sum + (dur || 8), 0)
  : ayahs.length * (config.ayahDuration || 8);

const totalDurationSeconds = titleDuration + totalAyahSeconds + closingDuration;
const totalFrames = Math.ceil(totalDurationSeconds * fps);

  return {
    durationInFrames: totalFrames,
    durationInSeconds: totalDurationSeconds,
    fps
  };
};

export const RemotionRoot: React.FC = () => {
  // **Default ayahs for composition setup**
  const defaultAyahs = [
    {
      number: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      surah: {
        number: 1,
        name: "الفاتحة",
        englishName: "Al-Fatihah"
      }
    },
    {
      number: 2,
      text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation: "All praise is due to Allah, Lord of the worlds.",
      surah: {
        number: 1,
        name: "الفاتحة",
        englishName: "Al-Fatihah"
      }
    },
    {
      number: 3,
      text: "الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "The Entirely Merciful, the Especially Merciful.",
      surah: {
        number: 1,
        name: "الفاتحة",
        englishName: "Al-Fatihah"
      }
    }
  ];

  const defaultClassicConfig = { 
    template: 'classic',
    themeColor: '#4CAF50',
    backgroundColor: '#1a1a1a',
    audioUrl: [
      'https://example.com/audio1.mp3',
      'https://example.com/audio2.mp3', 
      'https://example.com/audio3.mp3'
    ],
    titleDuration: 2,
    ayahDuration: 5,
    closingDuration: 1,
    fps: 30
  };

  const defaultModernConfig = { 
    template: 'modern',
    themeColor: '#2196F3',
    backgroundColor: '#121212',
    audioUrl: [
      'https://example.com/audio1.mp3',
      'https://example.com/audio2.mp3', 
      'https://example.com/audio3.mp3'
    ],
    titleDuration: 2,
    ayahDuration: 5,
    closingDuration: 1,
    fps: 30
  };
    const defaultCapcutConfig = { 
    template: 'capcut',
    themeColor: '#2196F3',
    backgroundColor: '#121212',
    audioUrl: [
      'https://example.com/audio1.mp3',
      'https://example.com/audio2.mp3', 
      'https://example.com/audio3.mp3'
    ],
    titleDuration: 2,
    ayahDuration: 5,
    closingDuration: 1,
    fps: 30
  };


  // **Calculate default durations**
  const classicDuration = calculateVideoDuration((defaultAyahs as any), defaultClassicConfig);
  const modernDuration = calculateVideoDuration((defaultAyahs as any), defaultModernConfig);
const capcutDuration = calculateVideoDuration((defaultAyahs as any), defaultCapcutConfig);
  return (
    <>
      <Composition
        id="ClassicTemplate"
        component={(ClassicTemplate as any)}
        durationInFrames={classicDuration.durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        
        defaultProps={{
          ayahs: defaultAyahs,
          config: defaultClassicConfig,
          audioDurations: defaultAyahs.map(ayah => (ayah as any).audioDuration || 8) // <-- pass this!
        }}
        // **KEY: Calculate metadata dynamically based on input props**
        calculateMetadata={({ props }) => {
          const { ayahs, config, audioDurations } = props;
          
          // Validate props
          if (!ayahs || !Array.isArray(ayahs) || ayahs.length === 0) {
            console.warn('ClassicTemplate: Invalid ayahs, using default duration');
            return {
              durationInFrames: classicDuration.durationInFrames,
              fps: 30,
              width: 1920,
              height: 1080,
            };
          }

          // Calculate actual duration based on current props
          const actualDuration = calculateVideoDuration((ayahs as any), config , (audioDurations as any));
          
          console.log('ClassicTemplate calculated metadata:', {
            ayahCount: ayahs.length,
            durationInFrames: actualDuration.durationInFrames,
            durationInSeconds: actualDuration.durationInSeconds
          });

          return {
            durationInFrames: actualDuration.durationInFrames,
            fps: config?.fps || 30,
            width: (config as any)?.width || 1920,
            height: (config as any)?.height || 1080,
          };
        }}
      />
      
   <Composition
        id="ModernTemplate"
        component={(ModernTemplate as any)}
        durationInFrames={modernDuration.durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          ayahs: defaultAyahs,
          config: defaultModernConfig,
          audioDurations: defaultAyahs.map(ayah => (ayah as any).audioDuration || 8) // <-- pass this!
        }}
        // **KEY: Calculate metadata dynamically based on input props**
        calculateMetadata={({ props }) => {
          const { ayahs, config, audioDurations } = props;
          
          // Validate props
          if (!ayahs || !Array.isArray(ayahs) || ayahs.length === 0) {
            console.warn('ClassicTemplate: Invalid ayahs, using default duration');
            return {
              durationInFrames: modernDuration.durationInFrames,
              fps: 30,
              width: 1920,
              height: 1080,
            };
          }

          // Calculate actual duration based on current props
          const actualDuration = calculateVideoDuration((ayahs as any), config, (audioDurations as any));
          
          console.log('Modern calculated metadata:', {
            ayahCount: ayahs.length,
            durationInFrames: actualDuration.durationInFrames,
            durationInSeconds: actualDuration.durationInSeconds
          });

          return {
            durationInFrames: actualDuration.durationInFrames,
            fps: config?.fps || 30,
            width: (config as any)?.width || 1920,
            height: (config as any)?.height || 1080,
          };
        }}
      />
           <Composition
        id="CapcutTemplate"
        component={(CapcutTemplate as any)}
        durationInFrames={capcutDuration.durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          ayahs: defaultAyahs,
          config: defaultCapcutConfig,
          audioDurations: defaultAyahs.map(ayah => (ayah as any).audioDuration || 8) // <-- pass this!
        }}
        // **KEY: Calculate metadata dynamically based on input props**
        calculateMetadata={({ props }) => {
          const { ayahs, config, audioDurations } = props;
          
          // Validate props
          if (!ayahs || !Array.isArray(ayahs) || ayahs.length === 0) {
            console.warn('Capcut: Invalid ayahs, using default duration');
            return {
              durationInFrames: capcutDuration.durationInFrames,
              fps: 30,
              width: 1920,
              height: 1080,
            };
          }

          // Calculate actual duration based on current props
          const actualDuration = calculateVideoDuration((ayahs as any), config, (audioDurations as any));
          
          console.log('Capcut calculated metadata:', {
            ayahCount: ayahs.length,
            durationInFrames: actualDuration.durationInFrames,
            durationInSeconds: actualDuration.durationInSeconds
          });

          return {
            durationInFrames: actualDuration.durationInFrames,
            fps: config?.fps || 30,
            width: (config as any)?.width || 1920,
            height: (config as any)?.height || 1080,
          };
        }}
      />
    </>
  );
};
// import { Composition } from 'remotion';
// import { ClassicTemplate } from './templates/classic-template';
// import { ModernTemplate } from './templates/modern-template';

// export const RemotionRoot: React.FC = () => {
//   return (
//     <>
//       <Composition
//         id="ClassicTemplate"
//         component={ClassicTemplate}
//         durationInFrames={990} // 33 seconds: 3 (title) + 24 (3 ayahs * 8s) + 6 (closing)
//         fps={30}
//         width={1920}
//         height={1080}
//         defaultProps={{
//           ayahs: [
//             {
//               number: 1,
//               text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
//               translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
//               surah: {
//                 number: 1,
//                 name: "الفاتحة",
//                 englishName: "Al-Fatihah"
//               }
//             },
//             {
//               number: 2,
//               text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
//               translation: "All praise is due to Allah, Lord of the worlds.",
//               surah: {
//                 number: 1,
//                 name: "الفاتحة",
//                 englishName: "Al-Fatihah"
//               }
//             },
//             {
//               number: 3,
//               text: "الرَّحْمَٰنِ الرَّحِيمِ",
//               translation: "The Entirely Merciful, the Especially Merciful.",
//               surah: {
//                 number: 1,
//                 name: "الفاتحة",
//                 englishName: "Al-Fatihah"
//               }
//             }
//           ],
//           config: { 
//             template: 'classic',
//             themeColor: '#4CAF50',
//             backgroundColor: '#1a1a1a',
//             audioUrl: [
//               'https://example.com/audio1.mp3',
//               'https://example.com/audio2.mp3', 
//               'https://example.com/audio3.mp3'
//             ]
//           }
//         }}
//       />
//       <Composition
//         id="ModernTemplate"
//         component={ModernTemplate}
//         durationInFrames={990} // Match the ClassicTemplate duration
//         fps={30}
//         width={1920}
//         height={1080}
//         defaultProps={{
//           ayahs: [
//             {
//               number: 1,
//               text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
//               translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
//               surah: {
//                 number: 1,
//                 name: "الفاتحة",
//                 englishName: "Al-Fatihah"
//               }
//             },
//             {
//               number: 2,
//               text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
//               translation: "All praise is due to Allah, Lord of the worlds.",
//               surah: {
//                 number: 1,
//                 name: "الفاتحة",
//                 englishName: "Al-Fatihah"
//               }
//             },
//             {
//               number: 3,
//               text: "الرَّحْمَٰنِ الرَّحِيمِ",
//               translation: "The Entirely Merciful, the Especially Merciful.",
//               surah: {
//                 number: 1,
//                 name: "الفاتحة",
//                 englishName: "Al-Fatihah"
//               }
//             }
//           ],
//           config: { 
//             template: 'modern',
//             themeColor: '#2196F3',
//             backgroundColor: '#121212',
//             audioUrl: [
//               'https://example.com/audio1.mp3',
//               'https://example.com/audio2.mp3', 
//               'https://example.com/audio3.mp3'
//             ]
//           }
//         }}
//       />
//     </>
//   );
// };
// import { Composition } from 'remotion';
// import { ClassicTemplate } from './templates/classic-template';
// import { ModernTemplate } from './templates/modern-template';

// export const RemotionRoot: React.FC = () => {
//   return (
//     <>
//       <Composition
//         id="ClassicTemplate"
//         component={ClassicTemplate}
//         durationInFrames={240} // Adjust based on your needs
//         fps={30}
//         width={1920}
//         height={1080}
//         defaultProps={{
//           ayahs: [
//             {
//               number: 1,
//               text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
//               translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
//               surah: {
//                 number: 1,
//                 name: "الفاتحة",
//                 englishName: "Al-Fatihah"
//               }
//             }
//           ],
//           config: { 
//             template: 'classic',
//             themeColor: '#4CAF50',
//             backgroundColor: '#1a1a1a'
//           }
//         }}
//       />
//       <Composition
//         id="ModernTemplate"
//         component={ModernTemplate}
//         durationInFrames={240}
//         fps={30}
//         width={1920}
//         height={1080}
//         defaultProps={{
//           ayahs: [
//             {
//               number: 1,
//               text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
//               translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
//               surah: {
//                 number: 1,
//                 name: "الفاتحة",
//                 englishName: "Al-Fatihah"
//               }
//             }
//           ],
//           config: { 
//             template: 'modern',
//             themeColor: '#2196F3',
//             backgroundColor: '#121212'
//           }
//         }}
//       />
//     </>
//   );
// };