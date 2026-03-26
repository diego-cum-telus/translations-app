import { useEffect, useRef } from 'react';

interface CaptionPanelProps {
  flag: string;
  language: string;
  phrases: string[];
  interimText?: string;
  isListening?: boolean;
  isTranslating?: boolean;
  variant?: 'source' | 'translation';
}

export function CaptionPanel({
  flag,
  language,
  phrases,
  interimText,
  isListening,
  isTranslating,
  variant = 'source',
}: CaptionPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [phrases, interimText]);

  const bgColor = variant === 'source' ? 'bg-[#0a0a0a]' : 'bg-[#0f0f0f]';
  const gradientFrom = variant === 'source' ? '#0a0a0a' : '#0f0f0f';
  const statusColor = variant === 'source' ? 'text-emerald-400' : 'text-amber-400';
  const interimColor = variant === 'source' ? 'text-[#edecec]/50' : 'text-amber-400/50';

  // Only show last 4 phrases
  const visiblePhrases = phrases.slice(-4);

  return (
    <div className={`h-full ${bgColor} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-8 py-4 flex-shrink-0">
        <span className="text-2xl">{flag}</span>
        <span className="text-[#888] text-sm uppercase tracking-wider">{language}</span>
        {isListening && (
          <span className={`ml-2 text-xs ${statusColor} animate-pulse`}>Listening...</span>
        )}
        {isTranslating && (
          <span className={`ml-2 text-xs ${statusColor} animate-pulse`}>Translating...</span>
        )}
      </div>

      {/* Captions Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Top gradient fade */}
        <div
          className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${gradientFrom}, transparent)` }}
        />

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${gradientFrom}, transparent)` }}
        />

        {/* Scrollable content - but we hide scrollbar and only show last 4 */}
        <div
          ref={containerRef}
          className="h-full px-8 py-4 flex flex-col justify-end overflow-hidden"
        >
          <div className="space-y-6">
            {visiblePhrases.length === 0 && !interimText ? (
              <div className="text-2xl md:text-3xl leading-relaxed font-light text-[#444] italic text-center">
                {variant === 'source' ? 'Start speaking...' : 'Translation will appear here...'}
              </div>
            ) : (
              <>
                {/* Older phrases - faded */}
                {visiblePhrases.slice(0, -1).map((phrase, index) => {
                  // Calculate opacity: older = more faded
                  const totalOld = visiblePhrases.length - 1;
                  const opacity = totalOld > 0
                    ? 0.25 + (index / totalOld) * 0.35
                    : 0.4;

                  return (
                    <div
                      key={phrases.length - visiblePhrases.length + index}
                      className="text-2xl md:text-3xl leading-relaxed font-light transition-opacity duration-500"
                      style={{ color: `rgba(237, 236, 236, ${opacity})` }}
                    >
                      {phrase}
                    </div>
                  );
                })}

                {/* Latest phrase - fully visible */}
                {visiblePhrases.length > 0 && (
                  <div className="text-2xl md:text-3xl leading-relaxed font-light text-[#edecec]">
                    {visiblePhrases[visiblePhrases.length - 1]}
                  </div>
                )}

                {/* Interim text - currently being spoken/translated */}
                {interimText && (
                  <div className={`text-2xl md:text-3xl leading-relaxed font-light italic ${interimColor}`}>
                    {interimText}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
