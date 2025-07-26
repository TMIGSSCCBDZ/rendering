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

export const ModernTemplate: React.FC<TemplateProps> = ({ 
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
  const themeColor = config.themeColor || legacyThemeColor || "#FFFFFF"
  const backgroundColor = config.backgroundColor || legacyBackgroundColor || "#000000"
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
        <div style={{ color: themeColor || 'white', fontSize: 32 }}>
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
  const fadeTransitionDuration = Math.floor(fps * 0.8) // Shorter transitions

  // Simplified helper for subtle movement
  const getSubtleFloat = (amplitude: number, frequency: number, offset: number = 0) => {
    return Math.sin((frame + offset) * frequency) * amplitude
  }

  // Debug log to verify durations and ayah mapping
  console.log('audioDurations', audioDurations);
  console.log('ayahs', ayahs);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Optional Background Image with Dim */}
      {backgroundVideoUrl && (
        <AbsoluteFill style={{ zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <img
            src={backgroundVideoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 0,
              filter: 'brightness(0.2) contrast(1.1) grayscale(100%)',
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: `${backgroundColor}CC`, // Semi-transparent overlay
            zIndex: 1,
          }} />
        </AbsoluteFill>
      )}

      {/* Audio Sequences */}
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

      {/* Minimalist Title Sequence */}
      {titleDuration > 0 && (
        <Sequence from={0} durationInFrames={Math.min(titleDuration, durationInFrames)}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: 100,
            }}
          >
            {/* Simple Animated Line */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: 0,
                width: '100%',
                height: 1,
                backgroundColor: themeColor,
                opacity: spring({
                  frame,
                  fps,
                  config: { damping: 100 },
                }),
                transform: `scaleX(${spring({
                  frame,
                  fps,
                  from: 0,
                  to: 1,
                  config: { damping: 200, stiffness: 100 },
                })})`,
                transformOrigin: 'center',
              }}
            />

            <div
              style={{
                textAlign: "center",
                opacity: spring({
                  frame,
                  fps,
                  config: { damping: 150 },
                }),
                transform: `
                  translateY(${interpolate(frame, [0, titleDuration], [40, 0], {
                    easing: Easing.out(Easing.cubic),
                  })}px)
                `,
              }}
            >
              {/* Minimal Surah Name */}
              <div
                style={{
                  fontSize: 64,
                  fontWeight: "300",
                  color: themeColor,
                  marginBottom: 30,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                {ayahs[0]?.surah?.englishName || "Sacred Verses"}
              </div>
              
              {/* Minimal Surah Number */}
              <div
                style={{
                  fontSize: 24,
                  color: `${themeColor}CC`,
                  fontWeight: "300",
                  opacity: spring({
                    frame: Math.max(0, frame - titleDuration * 0.3),
                    fps,
                    config: { damping: 150 },
                  }),
                }}
              >
                Surah {ayahs[0]?.surah?.number?.toString().padStart(3, '0')}
              </div>
            </div>
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Minimalist Ayah Sequences */}
      {ayahs.map((ayah, index) => {
        const framesPerAyah = getFramesForAyah(index);
        const sequenceStart = titleDuration + ayahs.slice(0, index).reduce((sum, _, i) => sum + getFramesForAyah(i), 0);
        const sequenceFrame = frame - sequenceStart;
        if (sequenceStart >= durationInFrames) return null;
        const actualSequenceDuration = Math.min(framesPerAyah, durationInFrames - sequenceStart);

        const fadeOutFrames = fadeTransitionDuration;
        const fadeOutStart = actualSequenceDuration - fadeOutFrames;
        const isFadingOut = sequenceFrame >= fadeOutStart && fadeOutFrames > 0;
        const fadeOutProgress = isFadingOut && fadeOutFrames > 0
          ? Math.min((sequenceFrame - fadeOutStart) / fadeOutFrames, 1)
          : 0;

        const fadeInFrames = fadeTransitionDuration;
        const isFadingIn = sequenceFrame < fadeInFrames;
        const fadeInProgress = isFadingIn && fadeInFrames > 0
          ? Math.min(sequenceFrame / fadeInFrames, 1)
          : 1;

        const opacity = fadeInProgress * (1 - fadeOutProgress);

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
                padding: 100,
              }}
            >
              {/* Subtle background pulse */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: `${themeColor}05`, // Very subtle
                  opacity: 0.3 * opacity,
                  transform: `scale(${1 + Math.sin(sequenceFrame * 0.01) * 0.01})`,
                }}
              />

              <div
                style={{
                  textAlign: "center",
                  maxWidth: 1400,
                  opacity: opacity,
                  transform: `
                    translateY(${getSubtleFloat(5, 0.01, index * 100)}px)
                  `,
                }}
              >
                {/* Minimal Arabic Text */}
                <div
                  style={{
                    fontSize: 56,
                    fontFamily: "Amiri, serif",
                    fontWeight: "400",
                    color: themeColor,
                    marginBottom: 60,
                    lineHeight: 1.8,
                    direction: "rtl",
                    textAlign: "center",
                    letterSpacing: "0.05em",
                  }}
                >
                  {ayah.text || "No text available"}
                </div>
                
                {/* Minimal Translation */}
                {ayah.translation && (
                  <div
                    style={{
                      fontSize: 24,
                      color: `${themeColor}CC`,
                      fontWeight: "300",
                      lineHeight: 1.6,
                      maxWidth: 1000,
                      margin: "0 auto",
                      opacity: opacity * 0.9,
                      transform: `
                        translateY(${getSubtleFloat(3, 0.008, index * 150 + 50)}px)
                      `,
                    }}
                  >
                    {ayah.translation}
                  </div>
                )}
                
                {/* Minimal Verse Number Indicator */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 80,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: opacity * 0.7,
                  }}
                >
                   <div
                    style={{
                      fontSize: 18,
                      color: themeColor,
                      fontWeight: "300",
                      letterSpacing: '0.2em',
                    }}
                  >
                    {ayah.numberInSurah?.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Minimalist Closing Sequence */}
      {(() => {
        const closingStart = titleDuration + ayahs.reduce((sum, _, i) => sum + getFramesForAyah(i), 0);
        const actualClosingDuration = Math.min(closingDuration, durationInFrames - closingStart);
        
        if (closingStart < durationInFrames && actualClosingDuration > 0) {
          const closingFrame = frame - closingStart;
          return (
            <Sequence from={closingStart} durationInFrames={actualClosingDuration}>
              <AbsoluteFill
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 100,
                }}
              >
                {/* Simple expanding circle */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 2,
                    height: 2,
                    backgroundColor: themeColor,
                    borderRadius: '50%',
                    opacity: spring({
                      frame: closingFrame,
                      fps,
                      config: { damping: 100 },
                    }),
                    transform: `
                      translate(-50%, -50%)
                      scale(${spring({
                        frame: closingFrame,
                        fps,
                        from: 0,
                        to: 2000, // Scale to large size
                        config: { damping: 200, stiffness: 80 },
                      })})
                    `,
                  }}
                />

                <div
                  style={{
                    textAlign: "center",
                    opacity: spring({
                      frame: closingFrame,
                      fps,
                      config: { damping: 150 },
                    }),
                    transform: `
                      translateY(${interpolate(closingFrame, [0, actualClosingDuration * 0.5], [30, 0])}px)
                    `,
                  }}
                >
                  {/* Minimal Closing Text */}
                  <div
                    style={{
                      fontSize: 32,
                      color: themeColor,
                      fontWeight: "300",
                      marginBottom: 20,
                      letterSpacing: '0.2em',
                    }}
                  >
                    ØµØ¯Ù‚ Ø§Ù„Ù„Ù‡ Ø§Ù„Ø¹Ø¸ÙŠÙ…
                  </div>
                  
                  {/* English Translation */}
                  <div
                    style={{
                      fontSize: 20,
                      color: `${themeColor}CC`,
                      fontWeight: "300",
                      opacity: interpolate(
                        closingFrame,
                        [actualClosingDuration * 0.3, actualClosingDuration * 0.8],
                        [0, 1]
                      ),
                    }}
                  >
                    Allah Almighty has spoken the truth
                  </div>
                </div>
              </AbsoluteFill>
            </Sequence>
          )
        }
        return null;
      })()}
    </AbsoluteFill>
  );
};