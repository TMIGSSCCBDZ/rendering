import type React from "react"
import { AbsoluteFill, Audio, Sequence, spring, useCurrentFrame, useVideoConfig, interpolate, Easing, random } from "remotion"

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

export const ClassicTemplate: React.FC<TemplateProps> = ({ 
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
  const themeColor = config.themeColor || legacyThemeColor || "#4CAF50"
  const backgroundColor = config.backgroundColor || legacyBackgroundColor || "#0a0a0a"
  const backgroundVideoUrl = config.backgroundVideoUrl
  const audioUrl = config.audioUrl || legacyAudioUrl

  // Validate ayahs array
  if (!ayahs || !Array.isArray(ayahs) || ayahs.length === 0) {
    return (
      <AbsoluteFill style={{ 
        backgroundColor: '#000', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div style={{ color: 'white', fontSize: 32 }}>
          No ayahs provided
        </div>
      </AbsoluteFill>
    )
  }

  const fps = config.fps || videoFps || 30
  const titleDurationSeconds = config.titleDuration || 2
  const closingDurationSeconds = config.closingDuration || 1
  


  

  const titleDuration = titleDurationSeconds * fps
  const getFramesForAyah = (index: number) => {
    const duration = audioDurations?.[index];
    return duration ? Math.round(duration * fps) : 8 * fps; // fallback to 8s if missing
  };
  const framesPerAyah = getFramesForAyah(0);
  const closingDuration = closingDurationSeconds * fps
  const fadeTransitionDuration = Math.floor(fps * 0.8) // Smoother transitions

  // **PROFESSIONAL ANIMATION HELPERS**
  const getFloatingAnimation = (index: number, multiplier: number = 1) => {
    return Math.sin((frame + index * 30) * 0.02) * 3 * multiplier
  }

  const getParallaxOffset = (depth: number) => {
    return Math.sin(frame * 0.01) * depth
  }

  const getDynamicScale = (startFrame: number, intensity: number = 0.05) => {
    const progress = (frame - startFrame) * 0.02
    return 1 + Math.sin(progress) * intensity
  }

  // **CINEMATIC PARTICLE SYSTEM**
  const renderParticles = () => {
    const particles = []
    for (let i = 0; i < 15; i++) {
      const particleProgress = (frame + i * 20) * 0.008
      const x = random(`particle-x-${i}`) * 1920 + Math.sin(particleProgress) * 100
      const y = random(`particle-y-${i}`) * 1080 + Math.cos(particleProgress * 0.7) * 50
      const opacity = (Math.sin(particleProgress) + 1) * 0.15
      const size = random(`particle-size-${i}`) * 4 + 2
      
      particles.push(
        <div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${themeColor}40, transparent)`,
            opacity: opacity,
            filter: 'blur(1px)',
            transform: `scale(${1 + Math.sin(particleProgress * 2) * 0.3})`,
          }}
        />
      )
    }
    return particles
  }

  // Debug log to verify durations and ayah mapping
  console.log('audioDurations', audioDurations);
  console.log('ayahs', ayahs);

  return (
    <AbsoluteFill>
      {/* **DYNAMIC CINEMATIC BACKGROUND** */}
      {backgroundVideoUrl ? (
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
            }}
          />
          {/* Overlay a dark layer for readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(180deg, ${backgroundColor}99 0%, ${backgroundColor}cc 100%)`,
            zIndex: 1,
            pointerEvents: 'none',
          }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill
          style={{
            background: `
              radial-gradient(circle at ${50 + Math.sin(frame * 0.005) * 20}% ${50 + Math.cos(frame * 0.003) * 15}%, 
                ${adjustBrightness(themeColor, -70)}40 0%, 
                ${backgroundColor} 40%,
                ${adjustBrightness(backgroundColor, -20)} 100%
              )
            `,
          }}
        />
      )}

      {/* **ANIMATED GEOMETRIC OVERLAY** */}
      <AbsoluteFill
        style={{
          background: `
            linear-gradient(${45 + Math.sin(frame * 0.01) * 30}deg, 
              transparent 0%, 
              ${themeColor}08 25%, 
              transparent 50%, 
              ${themeColor}05 75%, 
              transparent 100%
            )
          `,
          transform: `rotate(${Math.sin(frame * 0.008) * 2}deg) scale(${1 + Math.sin(frame * 0.006) * 0.02})`,
        }}
      />

      {/* **FLOATING PARTICLES SYSTEM** */}
      <AbsoluteFill>
        {renderParticles()}
      </AbsoluteFill>

      {/* **DYNAMIC LIGHT RAYS** */}
      <AbsoluteFill
        style={{
          background: `
            conic-gradient(from ${frame * 0.5}deg at center,
              transparent 0deg,
              ${themeColor}15 30deg,
              transparent 60deg,
              ${themeColor}10 120deg,
              transparent 150deg,
              ${themeColor}20 240deg,
              transparent 270deg,
              ${themeColor}08 330deg,
              transparent 360deg
            )
          `,
          opacity: 0.6,
          mixBlendMode: 'screen',
          transform: `scale(${1.2 + Math.sin(frame * 0.004) * 0.1})`,
        }}
      />

      {/* Audio Sequences (synchronized with ayah display) */}
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

      {/* **CINEMATIC TITLE SEQUENCE** */}
      {titleDuration > 0 && (
        <Sequence from={0} durationInFrames={Math.min(titleDuration, durationInFrames)}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: 80,
            }}
          >
            {/* **TITLE BACKGROUND GLOW** */}
            <div
              style={{
                position: 'absolute',
                width: '120%',
                height: '120%',
                background: `radial-gradient(ellipse at center, ${themeColor}20 0%, transparent 60%)`,
                opacity: spring({
                  frame,
                  fps,
                  config: { damping: 100, stiffness: 50 },
                }),
                transform: `scale(${spring({
                  frame,
                  fps,
                  from: 0.5,
                  to: 1,
                  config: { damping: 200, stiffness: 100 },
                })}) rotate(${frame * 0.2}deg)`,
                filter: 'blur(40px)',
              }}
            />

            {/* **MAIN TITLE WITH CINEMATIC EFFECTS** */}
            <div
              style={{
                textAlign: "center",
                opacity: spring({
                  frame,
                  fps,
                  config: { damping: 200, stiffness: 100 },
                }),
                transform: `
                  translateY(${interpolate(frame, [0, titleDuration], [50, 0], {
                    easing: Easing.out(Easing.cubic),
                  })}px) 
                  translateZ(0) 
                  scale(${spring({
                    frame,
                    fps,
                    from: 0.8,
                    to: 1,
                    config: { damping: 200, stiffness: 150 },
                  })})
                `,
              }}
            >
              {/* **TITLE TEXT WITH MULTIPLE EFFECTS** */}
              <div
                style={{
                  fontSize: 72,
                  fontWeight: "800",
                  background: `linear-gradient(135deg, ${themeColor} 0%, ${adjustBrightness(themeColor, 30)} 50%, ${themeColor} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: 40,
                  textShadow: `
                    0 0 20px ${themeColor}80,
                    0 0 40px ${themeColor}40,
                    0 4px 20px rgba(0,0,0,0.5)
                  `,
                  letterSpacing: '0.02em',
                  transform: `translateY(${getFloatingAnimation(0, 0.5)}px)`,
                  filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
                }}
              >
                {ayahs[0]?.surah?.englishName || "Quran Verses"}
              </div>

           

              {/* **DECORATIVE TITLE UNDERLINE** */}
              <div
                style={{
                  width: interpolate(frame, [titleDuration * 0.5, titleDuration], [0, 300], {
                    easing: Easing.out(Easing.quad),
                  }),
                  height: 4,
                  background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
                  margin: '30px auto 0',
                  borderRadius: 2,
                  boxShadow: `0 0 15px ${themeColor}80`,
                }}
              />
            </div>
          </AbsoluteFill>
        </Sequence>
      )}

      {/* **CINEMATIC AYAH SEQUENCES** */}
      {ayahs.map((ayah, index) => {
        const framesPerAyah = getFramesForAyah(index);
        const sequenceStart = titleDuration + ayahs.slice(0, index).reduce((sum, _, i) => sum + getFramesForAyah(i), 0);
        const sequenceFrame = frame - sequenceStart;
        if (sequenceStart >= durationInFrames) return null;
        const actualSequenceDuration = Math.min(framesPerAyah, durationInFrames - sequenceStart);
        // Fade out only in the last 0.8 seconds of the ayah's duration
        const fadeOutFrames = Math.floor(fps * 0.8);
        const fadeOutStart = actualSequenceDuration - fadeOutFrames;
        const isFadingOut = sequenceFrame >= fadeOutStart;
        const fadeOutProgress = isFadingOut
          ? Math.min((sequenceFrame - fadeOutStart) / fadeOutFrames, 1)
          : 0;
        // Only animate translateY at the start, then keep fixed
        const entranceFrames = fadeTransitionDuration * 1.5;
        const translateY = sequenceFrame < entranceFrames
          ? interpolate(sequenceFrame, [0, entranceFrames], [60, 0], { easing: Easing.out(Easing.cubic) })
          : 0;
        // The ayah stays fully visible and fixed until fadeOutStart, then fades out
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
                padding: 120,
              }}
            >
              {/* **DYNAMIC VERSE BACKGROUND** */}
              <div
                style={{
                  position: 'absolute',
                  width: '150%',
                  height: '150%',
                  background: `radial-gradient(ellipse at center, ${themeColor}15 0%, transparent 70%)`,
                  opacity: spring({
                    frame: sequenceFrame,
                    fps,
                    config: { damping: 100 },
                  }) * (1 - fadeOutProgress),
                  transform: `
                    scale(${spring({
                      frame: sequenceFrame,
                      fps,
                      from: 0.3,
                      to: 1,
                      config: { damping: 200, stiffness: 80 },
                    })}) 
                    rotate(${sequenceFrame * 0.1}deg)
                  `,
                  filter: 'blur(50px)',
                }}
              />

              {/* **CINEMATIC VERSE INDICATOR** */}
              <div
                style={{
                  position: "absolute",
                  top: 80,
                  right: 80,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: `
                    radial-gradient(circle at 30% 30%, ${adjustBrightness(themeColor, 40)} 0%, ${themeColor} 70%),
                    linear-gradient(135deg, ${themeColor}90 0%, ${adjustBrightness(themeColor, -20)} 100%)
                  `,
                  border: `4px solid ${themeColor}60`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: "bold",
                  color: '#ffffff',
                  opacity: spring({
                    frame: sequenceFrame,
                    fps,
                    config: { damping: 200 },
                  }) * (1 - fadeOutProgress),
                  transform: `
                    scale(${spring({
                      frame: sequenceFrame,
                      fps,
                      from: 0,
                      to: 1,
                      config: { damping: 200, stiffness: 150 },
                    })}) 
                    translateY(${getFloatingAnimation(index, 2)}px)
                    rotate(${Math.sin(sequenceFrame * 0.02) * 5}deg)
                  `,
                  boxShadow: `
                    0 0 30px ${themeColor}60,
                    inset 0 0 20px rgba(255,255,255,0.2),
                    0 8px 20px rgba(0,0,0,0.3)
                  `,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {ayah.numberInSurah || index + 1}
              </div>


              {/* **MAIN CONTENT WITH CINEMATIC TRANSITIONS** */}
              <div
                style={{
                  textAlign: "center",
                  maxWidth: 1300,
                  opacity: spring({
                    frame: sequenceFrame,
                    fps,
                    config: { damping: 200, stiffness: 100 },
                  }) * (1 - fadeOutProgress),
                  transform: `
                    translateY(${translateY}px)
                    translateZ(0)
                    scale(${getDynamicScale(sequenceStart, 0.02)})
                  `,
                }}
              >
                {/* **CINEMATIC ARABIC TEXT** */}
                <div
                  style={{
                    fontSize: 64,
                    fontFamily: "Amiri, serif",
                    fontWeight: "500",
                    background: `linear-gradient(135deg, #ffffff 0%, #ffffff90 50%, #ffffff 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    marginBottom: 60,
                    lineHeight: 1.9,
                    direction: "rtl",
                    textAlign: "center",
                    textShadow: `
                      0 0 20px rgba(255,255,255,0.3),
                      0 4px 20px rgba(0,0,0,0.7),
                      0 0 40px ${themeColor}30
                    `,
                    letterSpacing: "0.03em",
                    transform: `translateY(${getFloatingAnimation(index + 1, 1)}px)`,
                    filter: `
                      drop-shadow(0 0 10px rgba(255,255,255,0.2))
                      drop-shadow(0 4px 10px rgba(0,0,0,0.3))
                    `,
                  }}
                >
                  {ayah.text || "No text available"}
                </div>

                {/* **ANIMATED TRANSLATION** */}
                {ayah.translation && (
                  <div
                    style={{
                      fontSize: 32,
                      color: "#ffffff95",
                      fontStyle: "italic",
                      fontWeight: "300",
                      lineHeight: 1.7,
                      maxWidth: 1100,
                      margin: "0 auto",
                      opacity: interpolate(
                        sequenceFrame,
                        [fadeTransitionDuration, fadeTransitionDuration * 2],
                        [0, 1],
                        { easing: Easing.out(Easing.quad) }
                      ) * (1 - fadeOutProgress),
                      transform: `
                        translateY(${interpolate(
                          sequenceFrame,
                          [fadeTransitionDuration, fadeTransitionDuration * 2],
                          [30, 0],
                          { easing: Easing.out(Easing.cubic) }
                        )}px)
                        scale(${1 + Math.sin(sequenceFrame * 0.02) * 0.01})
                      `,
                      textShadow: '0 2px 15px rgba(0,0,0,0.8)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {ayah.translation}
                  </div>
                )}
              </div>

              {/* **DYNAMIC DECORATIVE ELEMENTS** */}
              <div
                style={{
                  position: "absolute",
                  bottom: 120,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: interpolate(
                    sequenceFrame,
                    [fadeTransitionDuration * 0.5, fadeTransitionDuration * 2],
                    [0, 400],
                    { easing: Easing.out(Easing.cubic) }
                  ),
                  height: 6,
                  background: `
                    linear-gradient(90deg, 
                      transparent 0%,
                      ${themeColor}60 20%,
                      ${adjustBrightness(themeColor, 30)} 50%,
                      ${themeColor}60 80%,
                      transparent 100%
                    )
                  `,
                  borderRadius: 3,
                  opacity: (1 - fadeOutProgress),
                  boxShadow: `
                    0 0 20px ${themeColor}80,
                    0 0 40px ${themeColor}40
                  `,
                  filter: 'blur(0.5px)',
                }}
              />

              {/* **SIDE ACCENT ELEMENTS** */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={`accent-${i}`}
                  style={{
                    position: 'absolute',
                    left: 60 + i * 40,
                    top: '50%',
                    width: 4,
                    height: 80 + i * 20,
                    background: `linear-gradient(180deg, transparent, ${themeColor}60, transparent)`,
                    opacity: spring({
                      frame: sequenceFrame - i * 10,
                      fps,
                      config: { damping: 200 },
                    }) * 0.6 * (1 - fadeOutProgress),
                    transform: `
                      translateY(-50%) 
                      scaleY(${1 + Math.sin((sequenceFrame + i * 30) * 0.03) * 0.3})
                    `,
                    borderRadius: 2,
                  }}
                />
              ))}
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* **CINEMATIC CLOSING SEQUENCE** */}
      {(() => {
        const closingStart = titleDuration + (ayahs.length * framesPerAyah)
        const actualClosingDuration = Math.min(closingDuration, durationInFrames - closingStart)
        
        if (closingStart < durationInFrames && actualClosingDuration > 0) {
          return (
            <Sequence from={closingStart} durationInFrames={actualClosingDuration}>
              <AbsoluteFill
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 80,
                }}
              >
                {/* **CLOSING RADIAL GLOW** */}
                <div
                  style={{
                    position: 'absolute',
                    width: '200%',
                    height: '200%',
                    background: `radial-gradient(circle at center, ${themeColor}25 0%, transparent 50%)`,
                    opacity: spring({
                      frame: frame - closingStart,
                      fps,
                      config: { damping: 100, stiffness: 50 },
                    }),
                    transform: `scale(${spring({
                      frame: frame - closingStart,
                      fps,
                      from: 0.3,
                      to: 1.2,
                      config: { damping: 200, stiffness: 80 },
                    })})`,
                    filter: 'blur(60px)',
                  }}
                />

            
              </AbsoluteFill>
            </Sequence>
          )
        }
        return null
      })()}
    </AbsoluteFill>
  )
}


// Enhanced helper function
function adjustBrightness(color: string, percent: number): string {
  if (!color || typeof color !== 'string') {
    return '#0a0a0a'
  }
  
  const cleanColor = color.startsWith('#') ? color : '#' + color
  
  if (!/^#[0-9A-F]{6}$/i.test(cleanColor)) {
    return cleanColor
  }
  
  try {
    const num = Number.parseInt(cleanColor.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, Math.min(255, (num >> 16) + amt))
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt))
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt))
    
    return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`
  } catch (error) {
    console.error('Error adjusting brightness:', error)
    return cleanColor
  }
}