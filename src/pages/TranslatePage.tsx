import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { CaptionPanel } from '../components/CaptionPanel';

const API_URL = 'http://localhost:3001/api';

type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'zh' | 'ja' | 'ko';

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
];

const SPEECH_LANG_MAP: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  it: 'it-IT',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

export function TranslatePage() {
  const [isStarted, setIsStarted] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<Language>('en');
  const [targetLanguage, setTargetLanguage] = useState<Language>('es');
  const [originalPhrases, setOriginalPhrases] = useState<string[]>([]);
  const [translatedPhrases, setTranslatedPhrases] = useState<string[]>([]);
  const [interimText, setInterimText] = useState('');
  const [interimTranslation, setInterimTranslation] = useState('');

  const sessionStartRef = useRef<Date | null>(null);
  const interimTranslationTimeoutRef = useRef<number | null>(null);
  const lastInterimRef = useRef<string>('');

  const translateText = useCallback(async (text: string, isInterim: boolean = false) => {
    if (!text.trim()) return;

    try {
      const response = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();

      if (isInterim) {
        setInterimTranslation(data.translation);
      } else {
        setTranslatedPhrases(prev => [...prev, data.translation]);
        setInterimTranslation('');
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [sourceLanguage, targetLanguage]);

  const handleSpeechResult = useCallback((transcript: string, isFinal: boolean) => {
    if (isFinal) {
      setOriginalPhrases(prev => [...prev, transcript]);
      setInterimText('');
      setInterimTranslation('');
      lastInterimRef.current = '';
      translateText(transcript, false);
    } else {
      setInterimText(transcript);

      if (transcript !== lastInterimRef.current) {
        lastInterimRef.current = transcript;

        if (interimTranslationTimeoutRef.current) {
          clearTimeout(interimTranslationTimeoutRef.current);
        }

        interimTranslationTimeoutRef.current = window.setTimeout(() => {
          if (transcript.trim()) {
            translateText(transcript, true);
          }
        }, 300);
      }
    }
  }, [translateText]);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error,
  } = useSpeechRecognition({
    language: SPEECH_LANG_MAP[sourceLanguage],
    onResult: handleSpeechResult,
  });

  const handleStart = () => {
    setIsStarted(true);
    setOriginalPhrases([]);
    setTranslatedPhrases([]);
    setInterimText('');
    setInterimTranslation('');
    sessionStartRef.current = new Date();
    startListening();
  };

  const saveSession = async () => {
    if (originalPhrases.length === 0) return;

    try {
      await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLanguage,
          targetLanguage,
          originalPhrases,
          translatedPhrases,
          startTime: sessionStartRef.current?.toISOString(),
          endTime: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleStop = async () => {
    stopListening();
    await saveSession();
    setIsStarted(false);
    setInterimText('');
    setInterimTranslation('');
  };

  const sourceLang = LANGUAGES.find(l => l.code === sourceLanguage);
  const targetLang = LANGUAGES.find(l => l.code === targetLanguage);

  // Setup Screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Cursor" className="w-6 h-6" />
            <span className="text-[#edecec] font-medium">Cursor Translate</span>
          </div>
          <Link
            to="/sessions"
            className="text-[#888] hover:text-[#edecec] transition-colors text-sm"
          >
            View Sessions
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 className="text-5xl md:text-6xl text-[#edecec] font-light text-center mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Real-time translation,
          </h1>
          <h1 className="text-5xl md:text-6xl text-[#edecec] font-light text-center mb-16" style={{ fontFamily: 'Georgia, serif' }}>
            powered by AI.
          </h1>

          {/* Language Selection */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="flex flex-col gap-2">
              <label className="text-[#888] text-sm uppercase tracking-wider">From</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value as Language)}
                className="bg-[#1a1a1a] text-[#edecec] px-6 py-3 rounded-lg border border-white/10 focus:border-white/30 focus:outline-none min-w-[200px] appearance-none cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[#888] text-2xl mt-6">→</div>

            <div className="flex flex-col gap-2">
              <label className="text-[#888] text-sm uppercase tracking-wider">To</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as Language)}
                className="bg-[#1a1a1a] text-[#edecec] px-6 py-3 rounded-lg border border-white/10 focus:border-white/30 focus:outline-none min-w-[200px] appearance-none cursor-pointer"
              >
                {LANGUAGES.filter(l => l.code !== sourceLanguage).map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!isSupported}
            className="bg-[#edecec] text-[#0a0a0a] px-8 py-3 rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Start Translating
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {!isSupported && (
            <p className="text-red-400 text-sm mt-4">
              Speech recognition requires Chrome or Edge browser.
            </p>
          )}
        </main>

        <footer className="px-8 py-4 border-t border-white/10">
          <p className="text-[#888] text-sm text-center">
            Powered by Google Translate
          </p>
        </footer>
      </div>
    );
  }

  // Translation Screen - Split View with Star Wars scroll
  return (
    <div className="min-h-screen h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Minimal Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <button
          onClick={handleStop}
          className="text-[#888] hover:text-[#edecec] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Stop & Save
        </button>

        <div className="flex items-center gap-2">
          {isListening && (
            <span className="flex items-center gap-2 text-red-400 text-sm">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Recording
            </span>
          )}
        </div>

        <div className="text-[#888] text-sm">
          {sourceLang?.flag} {sourceLang?.name} → {targetLang?.flag} {targetLang?.name}
        </div>
      </header>

      {/* Split View */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left Panel - Original */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 min-h-0">
          <CaptionPanel
            flag={sourceLang?.flag || ''}
            language={sourceLang?.name || ''}
            phrases={originalPhrases}
            interimText={interimText}
            isListening={!!interimText}
            variant="source"
          />
        </div>

        {/* Right Panel - Translation */}
        <div className="flex-1 min-h-0">
          <CaptionPanel
            flag={targetLang?.flag || ''}
            language={targetLang?.name || ''}
            phrases={translatedPhrases}
            interimText={interimTranslation}
            isTranslating={!!interimTranslation}
            variant="translation"
          />
        </div>
      </main>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
