import * as SQLite from 'expo-sqlite';

// Definisanje tipova podataka
export interface User {
  id: number;
  username: string;
}

export interface ScoreEntry {
  id: number;
  username: string;
  gameName: string;
  score: number;
  date: string;
}

// --- SINGLETON INSTANCA BAZE ---
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('mozgalica.db');
  }
  return dbInstance;
};

/**
 * Kreira potrebne tabele ako ne postoje.
 */
export const initializeDatabase = async () => {
  const db = await getDatabase();
  
  try {
    await db.execAsync('PRAGMA journal_mode = WAL;');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        game_key TEXT NOT NULL,
        score INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
    
    console.log("✅ Baza podataka je uspešno inicijalizovana!");
  } catch (error) {
    console.error("Greška pri inicijalizaciji baze:", error);
  }
};

export const getOrCreateUser = async (username: string): Promise<number> => {
  const db = await getDatabase();
  
  const existingUser = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM users WHERE username = ?',
    [username]
  );

  if (existingUser) {
    return existingUser.id;
  }

  const result = await db.runAsync(
    'INSERT INTO users (username) VALUES (?)',
    [username]
  );
  return result.lastInsertRowId;
};

export const saveGameScore = async (username: string, gameKey: string, score: number) => {
  try {
    const db = await getDatabase();
    const userId = await getOrCreateUser(username);
    
    await db.runAsync(
      'INSERT INTO scores (user_id, game_key, score) VALUES (?, ?, ?)',
      [userId, gameKey, score]
    );
    console.log(`💾 Rezultat sačuvan: ${gameKey} - ${score}`);
  } catch (error) {
    console.error("Greška pri čuvanju rezultata:", error);
  }
};

export const getScoreHistory = async (filter?: { username?: string, gameKey?: string }): Promise<ScoreEntry[]> => {
  const db = await getDatabase();
  
  let query = `
    SELECT s.id, u.username, s.game_key as gameName, s.score, s.timestamp as date
    FROM scores s
    JOIN users u ON s.user_id = u.id
  `;
  
  const params: any[] = [];
  const conditions: string[] = [];

  if (filter?.username) {
    conditions.push("u.username LIKE ?");
    params.push(`%${filter.username}%`);
  }

  if (filter?.gameKey && filter.gameKey !== 'Sve') {
    conditions.push("s.game_key = ?");
    params.push(filter.gameKey);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY s.timestamp DESC";

  return await db.getAllAsync<ScoreEntry>(query, params);
};

// --- FUNKCIJA ZA BRISANJE ISTORIJE ---
export const clearDatabase = async () => {
  try {
    const db = await getDatabase();
    // Brišemo samo rezultate, korisnike ostavljamo
    await db.runAsync('DELETE FROM scores');
    console.log("🗑️ Istorija rezultata je obrisana.");
  } catch (error) {
    console.error("Greška pri brisanju istorije:", error);
    throw error;
  }
};