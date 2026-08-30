import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini API Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// -------------------------------------------------------------
// API Endpoints for TSICVIDIA Creative Compilation Engine
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TSICVIDIA Creative Compilation Engine',
    version: '1.4.2',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
  });
});

// AI Assistant for structured script/scene/shot suggestions
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { prompt, context, type } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback deterministic intelligence engine if Gemini Key is not configured
      return res.json({
        success: true,
        source: 'local_engine',
        data: getLocalAssistantSuggestion(prompt, type, context),
      });
    }

    let systemInstruction = `You are TSICVIDIA Creative Production Assistant. 
You turn creative intent into structured production data for our deterministic compiler.
State belongs to TSICVIDIA; you generate structured JSON for characters, scripts, scenes, shots, or QA diagnoses.`;

    if (type === 'script_generation') {
      systemInstruction += `\nReturn a structured script with hook, setup, observation, punchline, scenes, and shots matching our format.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Context: ${JSON.stringify(context || {})}\nUser Request: ${prompt}\nOutput structured recommendations.`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text || '';
    res.json({
      success: true,
      source: 'gemini-3.7-flash',
      text: responseText,
    });
  } catch (error: any) {
    console.error('AI assistant error:', error);
    res.json({
      success: true,
      source: 'local_fallback',
      data: getLocalAssistantSuggestion(req.body?.prompt || '', req.body?.type, req.body?.context),
      warning: error?.message || 'Remote model fell back to deterministic generator',
    });
  }
});

// AI Script Breakdown Endpoint
app.post('/api/ai/breakdown-script', async (req, res) => {
  try {
    const { premise, characterName, targetDuration = 30 } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `Create a concise ${targetDuration}s short-form video breakdown for character "${characterName}".
Premise: "${premise}".
Return valid JSON with an array of scenes, each scene having an array of shots.
Each shot must have: shotNumber, characterName, pose, expression, action, camera, dialogue, emotion, duration (seconds), motionPreset.`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, result: parsed, source: 'gemini-3.7-flash' });
      } catch (geminiErr) {
        console.warn('Gemini script breakdown failed, using local engine:', geminiErr);
      }
    }

    // Local breakdown generator
    const localScenes = generateDeterministicScriptBreakdown(premise, characterName, targetDuration);
    res.json({ success: true, result: localScenes, source: 'local_compiler_engine' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Deterministic mock generation helper
function getLocalAssistantSuggestion(prompt: string, type?: string, context?: any) {
  if (type === 'qa_diagnostics') {
    return {
      identityScore: 0.94,
      visualIntegrity: 'PASS',
      motionWarning: 'Facial landmark drift detected in frames 42-58. Suggested remedy: Apply "subtle_head" anchor smoothing or switch to Static Pose Animation fallback.',
      audioLufs: -14.2,
      recommendation: 'Apply landmark stabilizer or execute graceful degradation to static camera pan.',
    };
  }
  return {
    suggestion: `Engine suggestion for: "${prompt}"`,
    optimizedPrompt: `Character centered, high fidelity, 35mm cinematic lens, warm studio lighting, strict adherence to visual DNA.`,
    estimatedCost: '$0.038',
    cacheable: true,
  };
}

function generateDeterministicScriptBreakdown(premise: string, characterName: string, duration: number) {
  return {
    title: premise ? `Episode: ${premise.slice(0, 30)}` : 'Episode: The Observation',
    scenes: [
      {
        sceneId: 'SCENE_001',
        title: 'Opening & Hook',
        location: 'gym',
        shots: [
          {
            shotId: 'SHOT_001',
            character: characterName || 'Milo',
            pose: 'bench_slouch',
            expression: 'deadpan',
            action: 'holding_coffee',
            camera: 'medium / eye-level',
            dialogue: "You know what's fascinating about modern routines?",
            duration: 3.5,
            motion: 'subtle_head_nod',
            emotion: 'skeptical',
          },
          {
            shotId: 'SHOT_002',
            character: characterName || 'Milo',
            pose: 'pointing_forward',
            expression: 'smug',
            action: 'gesturing_towards_weights',
            camera: 'close-up / dutch-angle',
            dialogue: "Everyone acts like 4 AM alarms unlock hidden dimensions of reality.",
            duration: 4.2,
            motion: 'hand_emphasis',
            emotion: 'ironic',
          },
        ],
      },
      {
        sceneId: 'SCENE_002',
        title: 'Conflict & Escalation',
        location: 'coffee_shop',
        shots: [
          {
            shotId: 'SHOT_003',
            character: characterName || 'Milo',
            pose: 'crossed_arms',
            expression: 'confused',
            action: 'observing_crowd',
            camera: 'wide / low-angle',
            dialogue: "Meanwhile, I'm just trying to negotiate peace with my coffee maker.",
            duration: 4.8,
            motion: 'shoulder_shrug',
            emotion: 'deadpan',
          },
          {
            shotId: 'SHOT_004',
            character: characterName || 'Milo',
            pose: 'leaning_counter',
            expression: 'happy',
            action: 'taking_sip',
            camera: 'medium / eye-level',
            dialogue: "Rule number one: Consistency beats motivation. Always.",
            duration: 3.5,
            motion: 'smile_transition',
            emotion: 'confident',
          },
        ],
      },
    ],
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TSICVIDIA Compilation Engine running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
