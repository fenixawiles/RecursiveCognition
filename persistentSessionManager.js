import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.resolve(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
// Provide default data to avoid "missing default data" errors
const defaultData = { sessions: [] };
const db = new Low(adapter, defaultData);

export async function initializePersistentDB() {
  await db.read();
  // db.data will always be initialized with defaultData, but double-check
  if (!db.data) db.data = defaultData;
  await db.write();
}

export async function startPersistentSession(userId = 'test-user') {
  const sessionId = uuidv4();
  const session = {
    userId,
    sessionId,
    tokensUsed: 0,
    exchanges: 0,
    startTime: Date.now(),
    insightReported: false,
  };

  db.data.sessions.push(session);
  await db.write();
  return sessionId;
}

export async function endPersistentSession(sessionId, insightReported = false) {
  const session = db.data.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.endTime = Date.now();
    session.insightReported = insightReported;
    await db.write();
  }
}

export async function updatePersistentSessionTokens(sessionId, tokens) {
  const session = db.data.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.tokensUsed += tokens;
    session.exchanges += 1;
    await db.write();
  }
}