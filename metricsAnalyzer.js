import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.resolve(__dirname, 'db.json');

const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

await db.read();
const sessions = db.data.sessions || [];

function calculateAverages() {
    if (sessions.length === 0) return {
        avgTokens: 0,
        avgExchanges: 0,
        insightRate: '0%'
    };

    const totalTokens = sessions.reduce((acc, session) => acc + (session.tokensUsed || 0), 0);
    const totalExchanges = sessions.reduce((acc, session) => acc + (session.exchanges || 0), 0);
    const insights = sessions.filter(session => session.insightReported).length;

    return {
        avgTokens: (totalTokens / sessions.length).toFixed(2),
        avgExchanges: (totalExchanges / sessions.length).toFixed(2),
        insightRate: ((insights / sessions.length) * 100).toFixed(1) + '%'
    };
}

console.log(calculateAverages());