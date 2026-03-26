import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json');

interface Session {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalPhrases: string[];
  translatedPhrases: string[];
  startTime: string;
  endTime: string;
}

function ensureDataDir() {
  const dataDir = path.dirname(SESSIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readSessions(): Session[] {
  ensureDataDir();
  if (!fs.existsSync(SESSIONS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeSessions(sessions: Session[]) {
  ensureDataDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

// GET all sessions
router.get('/', (_req: Request, res: Response) => {
  const sessions = readSessions();
  // Return newest first
  res.json(sessions.reverse());
});

// POST new session
router.post('/', (req: Request, res: Response) => {
  const { sourceLanguage, targetLanguage, originalPhrases, translatedPhrases, startTime, endTime } = req.body;

  if (!originalPhrases || originalPhrases.length === 0) {
    res.status(400).json({ error: 'No phrases to save' });
    return;
  }

  const session: Session = {
    id: Date.now().toString(),
    sourceLanguage,
    targetLanguage,
    originalPhrases,
    translatedPhrases,
    startTime,
    endTime,
  };

  const sessions = readSessions();
  sessions.push(session);
  writeSessions(sessions);

  res.json({ success: true, session });
});

// DELETE a session
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const sessions = readSessions();
  const filtered = sessions.filter(s => s.id !== id);

  if (filtered.length === sessions.length) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  writeSessions(filtered);
  res.json({ success: true });
});

export default router;
