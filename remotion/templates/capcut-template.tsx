import type React from "react"
import { AbsoluteFill, Audio, Sequence, spring, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion"

export interface TemplateProps {
  ayahs: Array<{
    number: number
    text: string
    translation?: string
    numberInSurah: number
    surah: {
      number: number
      name: string
      englishName: string
    }
  }>
  config?: {
    template?: string
    themeColor?: string
    backgroundColor?: string
    backgroundVideoUrl?: string
    audioUrl?: string[]
    resolution?: string
    totalDurationSeconds?: number
    totalFrames?: number
    fps?: number
    ayahDuration?: number
    titleDuration?: number
    closingDuration?: number
  }
  themeColor?: string
  backgroundColor?: string
  audioUrl?: string[]
  audioDurations?: (number | null)[];
}

export const CapcutTemplate: React.FC<TemplateProps> = ({ 
  ayahs = [], 
  config = {},
  themeColor: legacyThemeColor,
  backgroundColor: legacyBackgroundColor,
  audioUrl: legacyAudioUrl,
  audioDurations = [],

}) => {
  const frame = useCurrentFrame()
  const { fps: videoFps, durationInFrames } = useVideoConfig()

  // Extract colors from config or use legacy props or defaults
  // Keeping defaults more elegant: Gold/Dark Green on Deep Navy
  const themeColor = config.themeColor || legacyThemeColor || "#D4AF37" // Elegant Gold
  const backgroundColor = config.backgroundColor || legacyBackgroundColor || "#0A1F3C" // Deep Navy
  const backgroundVideoUrl = config.backgroundVideoUrl
  const audioUrl = config.audioUrl || legacyAudioUrl

  // Validate ayahs array
  if (!ayahs || !Array.isArray(ayahs) || ayahs.length === 0) {
    return (
      <AbsoluteFill style={{ 
        backgroundColor: backgroundColor || '#000', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div style={{ 
            color: themeColor || 'white', 
            fontSize: 36,
            fontFamily: 'serif', // More classical font
            fontWeight: 'bold'
         }}>
          No ayahs provided
        </div>
      </AbsoluteFill>
    )
  }

  const fps = config.fps || videoFps || 30
  const titleDurationSeconds = config.titleDuration || 3
  const closingDurationSeconds = config.closingDuration || 2
  const titleDuration = titleDurationSeconds * fps

  const getFramesForAyah = (index: number) => {
    const duration = audioDurations?.[index];
    return duration ? Math.round(duration * fps) : 10 * fps; // fallback to 10s if missing
  };

  const closingDuration = closingDurationSeconds * fps
  // Smoother transitions for elegance
  const transitionDuration = Math.floor(fps * 1.0) 

  // --- Removed Video Editing Style Helpers (Glitch, Scanline, Timecode) ---

  // Debug log to verify durations and ayah mapping
  console.log('audioDurations', audioDurations);
  console.log('ayahs', ayahs);

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: 'hidden' }}>
      {/* Optional Background Image/Video - Kept but with elegant adjustments */}
      {backgroundVideoUrl && (
        <AbsoluteFill style={{ zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <img
            src={backgroundVideoUrl}
            style={{
              width: '105%', // Slight zoom
              height: '105%',
              objectFit: 'cover',
              position: 'absolute',
              top: '-2.5%',
              left: '-2.5%',
              zIndex: 0,
        
            }}
          />
           {/* Removed VHS Static Overlay */}
        </AbsoluteFill>
      )}

      {/* Removed Digital Scanlines */}

      {/* Audio Sequences - Logic unchanged */}
      {Array.isArray(audioUrl) && ayahs.map((ayah, index) => {
        const currentAudioUrl = audioUrl[index];
        if (!currentAudioUrl) return null;
        const framesPerAyah = getFramesForAyah(index);
        const audioStartFrame = titleDuration + ayahs.slice(0, index).reduce((sum, _, i) => sum + getFramesForAyah(i), 0);
        const audioDuration = Math.min(framesPerAyah, durationInFrames - audioStartFrame);
        if (audioStartFrame >= durationInFrames) return null;
        if (audioDuration <= 0) return null;
        return (
          <Sequence
            key={`audio-${index}-${currentAudioUrl}`}
            from={audioStartFrame}
            durationInFrames={audioDuration}
          >
            <Audio src={currentAudioUrl} />
          </Sequence>
        );
      })}

      {/* Elegant Title Sequence */}
      {titleDuration > 0 && (
        <Sequence from={0} durationInFrames={Math.min(titleDuration, durationInFrames)}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: '60px 80px', // Adjusted padding
            }}
          >
             {/* Elegant Ornamental Border - Simpler, more classic */}
            <div style={{
              position: 'absolute',
              top: 30,
              left: 30,
              right: 30,
              bottom: 30,
              border: `3px solid ${themeColor}`, // Thicker, solid border
              borderRadius: '8px', // Slight rounding
              boxShadow: `0 0 25px ${themeColor}80`, // Softer, larger glow
              opacity: spring({ frame, fps, config: { mass: 1, damping: 15, stiffness: 100 } }), // Smoother spring
            }} />

            {/* Title Text */}
            <div
              style={{
                textAlign: "center",
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: 64, // Slightly smaller
                  fontWeight: "bold", // Standard bold
                  color: themeColor,
                  textTransform: 'capitalize', // Capitalize instead of uppercase
                  letterSpacing: '0.1em', // Reduced letter spacing
                  marginBottom: 30, // Adjusted margin
                  fontFamily: 'Georgia, serif', // Classic serif font
                  textShadow: `0 2px 4px rgba(0,0,0,0.5)`, // Subtle drop shadow
                  opacity: spring({ frame, fps, config: { mass: 1, damping: 15, stiffness: 100 } }),
                }}
              >
                {ayahs[0]?.surah?.englishName || "Sacred Verses"}
              </div>
              
              {/* Surah Number with Elegant Counter Effect */}
              <div
                style={{
                  fontSize: 28,
                  color: '#FFF', // White for contrast
                  fontWeight: "normal", // Normal weight
                  fontFamily: 'Georgia, serif', // Serif font
                  opacity: spring({ frame: Math.max(0, frame - titleDuration * 0.4), fps, config: { mass: 1, damping: 15, stiffness: 100 } }),
                  textShadow: `0 1px 2px rgba(0,0,0,0.5)`, // Subtle shadow
                }}
              >
                Surah: {ayahs[0]?.surah?.number?.toString().padStart(3, '0')}
              </div>
            </div>

            {/* Removed Bottom Info Bar (REC, Timecode, HD) */}

          </AbsoluteFill>
        </Sequence>
      )}

      {/* Elegant Ayah Sequences */}
      {ayahs.map((ayah, index) => {
        const framesPerAyah = getFramesForAyah(index);
        const sequenceStart = titleDuration + ayahs.slice(0, index).reduce((sum, _, i) => sum + getFramesForAyah(i), 0);
        const sequenceFrame = frame - sequenceStart;
        if (sequenceStart >= durationInFrames) return null;
        const actualSequenceDuration = Math.min(framesPerAyah, durationInFrames - sequenceStart);
        const fadeOutFrames = transitionDuration;
        const fadeOutStart = actualSequenceDuration - fadeOutFrames;
        const isFadingOut = sequenceFrame >= fadeOutStart && fadeOutFrames > 0;
        const fadeOutProgress = isFadingOut && fadeOutFrames > 0
          ? Math.min((sequenceFrame - fadeOutStart) / fadeOutFrames, 1)
          : 0;
        const fadeInFrames = transitionDuration;
        const isFadingIn = sequenceFrame < fadeInFrames;
        const fadeInProgress = isFadingIn && fadeInFrames > 0
          ? Math.min(sequenceFrame / fadeInFrames, 1)
          : 1;
        const opacity = fadeInProgress * (1 - fadeOutProgress);

        // Removed Film Strip Effect

        return (
          <Sequence 
            key={`ayah-${ayah.surah?.number || 'surah'}-${ayah.number || index}`} 
            from={sequenceStart} 
            durationInFrames={actualSequenceDuration}
          >
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: '80px 100px', // Adjusted padding
              }}
            >
              {/* Removed Film Strips */}

              {/* Elegant Arabic Text Container */}
              <div
                style={{
                  textAlign: "center",
                  maxWidth: 1400,
                  position: 'relative',
                  opacity: opacity,
                  // Removed glitch transforms
                }}
              >
                 {/* Removed Glitch Copies */}

                {/* Main Arabic Text - Enhanced elegance */}
                <div
                  style={{
                    fontSize: 72, // Larger size
                    fontFamily: "'Scheherazade New', 'Amiri', serif", // Specific elegant Quranic font if available, fallback
                    fontWeight: "normal", // Standard weight often looks better
                    color: '#FFF',
                    lineHeight: 2.0, // Increased line height for readability
                    direction: "rtl",
                    textAlign: "center",
                    textShadow: `0 2px 8px rgba(0,0,0,0.7)`, // Stronger, more defined shadow
                    letterSpacing: "0.02em", // Slight letter spacing
                  }}
                >
                  {ayah.text || "No text available"}
                </div>

                {/* Elegant Translation */}
                {ayah.translation && (
                  <div
                    style={{
                      fontSize: 28, // Larger size
                      color: '#EEE', // Lighter grey
                      fontWeight: "normal", // Standard weight
                      lineHeight: 1.8, // Increased line height
                      maxWidth: 1000,
                      margin: "50px auto 0", // Adjusted margin
                      fontFamily: 'Georgia, serif', // Serif font for translation
                      opacity: opacity * 0.95, // Slightly higher opacity
                      textShadow: `0 1px 3px rgba(0,0,0,0.5)`, // Subtle shadow
                      borderLeft: `3px solid ${themeColor}`, // Thicker border
                      paddingLeft: 25, // Increased padding
                      fontStyle: 'italic', // Italic for distinction
                    }}
                  >
                    {ayah.translation}
                  </div>
                )}
              </div>

              {/* Elegant Verse Counter */}
              <div style={{
                position: 'absolute',
                top: 40,
                right: 40,
                minWidth: 60, // Ensure minimum width
                height: 40,
                backgroundColor: `${backgroundColor}CC`, // Semi-transparent background
                border: `1px solid ${themeColor}`,
                borderRadius: '4px', // Slight rounding
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'Georgia, serif', // Serif font
                fontSize: 22, // Larger font
                color: themeColor,
                opacity: opacity,
                padding: '0 10px', // Add padding for better spacing
              }}>
                {ayah.numberInSurah?.toString().padStart(2, '0')}
              </div>

              {/* Removed Random Digital Glitch Elements */}

            </AbsoluteFill>
          </Sequence>
        );
      })}

     
    </AbsoluteFill>
  );
};