import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Translation } from "@/types/translation";

interface EthLangDB extends DBSchema {
  translations: {
    key: string;
    value: Translation;
    indexes: { "by-timestamp": number };
  };
  favorites: {
    key: string;
    value: Translation;
  };
}

const DB_NAME = "eth-lang-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EthLangDB>> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<EthLangDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const translationStore = db.createObjectStore("translations", {
          keyPath: "id",
        });
        translationStore.createIndex("by-timestamp", "timestamp");

        db.createObjectStore("favorites", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
};

export const cacheTranslation = async (translation: Translation): Promise<void> => {
  const db = await getDB();
  await db.put("translations", translation);

  // Keep only the last 100 translations
  const allTranslations = await db.getAllFromIndex(
    "translations",
    "by-timestamp"
  );
  if (allTranslations.length > 100) {
    const toDelete = allTranslations.slice(0, allTranslations.length - 100);
    for (const t of toDelete) {
      await db.delete("translations", t.id);
    }
  }
};

export const getRecentTranslations = async (limit = 20): Promise<Translation[]> => {
  const db = await getDB();
  const all = await db.getAllFromIndex("translations", "by-timestamp");
  return all.reverse().slice(0, limit);
};

export const getCachedTranslation = async (
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<Translation | undefined> => {
  const db = await getDB();
  const all = await db.getAll("translations");
  return all.find(
    (t) =>
      t.sourceText.toLowerCase() === sourceText.toLowerCase() &&
      t.sourceLanguage === sourceLanguage &&
      t.targetLanguage === targetLanguage
  );
};

export const toggleFavorite = async (translation: Translation): Promise<void> => {
  const db = await getDB();
  const existing = await db.get("favorites", translation.id);
  
  if (existing) {
    await db.delete("favorites", translation.id);
  } else {
    await db.put("favorites", { ...translation, isFavorite: true });
  }
};

export const getFavorites = async (): Promise<Translation[]> => {
  const db = await getDB();
  return db.getAll("favorites");
};

export const clearHistory = async (): Promise<void> => {
  const db = await getDB();
  await db.clear("translations");
};
