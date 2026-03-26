import { Router, Request, Response } from 'express';
import { v2 } from '@google-cloud/translate';

const router = Router();

let translateClient: v2.Translate | null = null;

function getTranslateClient(): v2.Translate | null {
  if (translateClient) return translateClient;

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (apiKey) {
    translateClient = new v2.Translate({ key: apiKey });
  }
  return translateClient;
}

interface TranslateRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage?: string;
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body as TranslateRequest;

    if (!text || !sourceLanguage) {
      res.status(400).json({ error: 'Missing text or sourceLanguage' });
      return;
    }

    const client = getTranslateClient();
    if (!client) {
      res.status(503).json({
        error: 'Google Translate API key not configured. Please set GOOGLE_TRANSLATE_API_KEY in .env file.',
        translation: `[API key needed] ${text}`,
      });
      return;
    }

    const target = targetLanguage || (sourceLanguage === 'en' ? 'es' : 'en');

    const [translation] = await client.translate(text, {
      from: sourceLanguage,
      to: target,
    });

    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router;
