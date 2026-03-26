import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Session {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalPhrases: string[];
  translatedPhrases: string[];
  startTime: string;
  endTime: string;
}

const LANGUAGE_FLAGS: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇧🇷',
  it: '🇮🇹',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  it: 'Italian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
};

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 1) return 'Less than 1 min';
    if (diffMins === 1) return '1 min';
    return `${diffMins} mins`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="Cursor" className="w-6 h-6" />
          <span className="text-[#edecec] font-medium">Cursor Translate</span>
        </div>
        <Link
          to="/"
          className="text-[#888] hover:text-[#edecec] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 py-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl text-[#edecec] font-light mb-8">Translation Sessions</h1>

        {loading ? (
          <div className="text-[#888] text-center py-12">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#888] mb-4">No sessions yet</p>
            <Link
              to="/"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              Start your first translation →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-[#1a1a1a] rounded-lg border border-white/10 overflow-hidden"
              >
                {/* Session Header */}
                <button
                  onClick={() => setExpandedSession(
                    expandedSession === session.id ? null : session.id
                  )}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-lg">
                      <span>{LANGUAGE_FLAGS[session.sourceLanguage]}</span>
                      <span className="text-[#888]">→</span>
                      <span>{LANGUAGE_FLAGS[session.targetLanguage]}</span>
                    </div>
                    <div className="text-[#888] text-sm">
                      {LANGUAGE_NAMES[session.sourceLanguage]} to {LANGUAGE_NAMES[session.targetLanguage]}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-[#888]">
                    <span>{session.originalPhrases.length} phrases</span>
                    <span>{formatDuration(session.startTime, session.endTime)}</span>
                    <span>{formatDate(session.startTime)}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedSession === session.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Session Content (Expanded) */}
                {expandedSession === session.id && (
                  <div className="border-t border-white/10 px-6 py-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Original */}
                      <div>
                        <h3 className="text-xs uppercase tracking-wider text-[#888] mb-3">
                          {LANGUAGE_FLAGS[session.sourceLanguage]} Original
                        </h3>
                        <div className="space-y-2">
                          {session.originalPhrases.map((phrase, index) => (
                            <p key={index} className="text-[#edecec]">
                              {phrase}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Translation */}
                      <div>
                        <h3 className="text-xs uppercase tracking-wider text-[#888] mb-3">
                          {LANGUAGE_FLAGS[session.targetLanguage]} Translation
                        </h3>
                        <div className="space-y-2">
                          {session.translatedPhrases.map((phrase, index) => (
                            <p key={index} className="text-amber-400/80">
                              {phrase}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
