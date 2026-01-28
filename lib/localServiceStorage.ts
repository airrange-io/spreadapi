const DB_NAME = 'spreadapi-local';
const DB_VERSION = 1;
const STORE_NAME = 'services';

export interface LocalService {
  id: string;
  name: string;
  description: string;
  config: object;
  workbookJSON: any;
  savedAt: string;
  createdAt: string;
}

function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalService(
  id: string,
  config: object,
  workbookJSON: any,
  name?: string,
  description?: string
): Promise<void> {
  const db = await openDB();
  try {
    // Read existing record in a separate transaction to preserve createdAt
    const existing = await new Promise<LocalService | undefined>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result as LocalService | undefined);
      req.onerror = () => resolve(undefined);
    });

    const now = new Date().toISOString();
    const record: LocalService = {
      id,
      name: name ?? existing?.name ?? (config as any)?.name ?? '',
      description: description ?? existing?.description ?? (config as any)?.description ?? '',
      config,
      workbookJSON,
      savedAt: now,
      createdAt: existing?.createdAt ?? now,
    };

    // Write in a new transaction
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function createLocalService(
  id: string,
  name: string,
  description: string
): Promise<void> {
  const db = await openDB();
  try {
    const now = new Date().toISOString();
    const record: LocalService = {
      id,
      name,
      description,
      config: { name, description },
      workbookJSON: null,
      savedAt: now,
      createdAt: now,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function loadLocalService(id: string): Promise<LocalService | null> {
  if (!isIndexedDBAvailable()) return null;
  let db: IDBDatabase | null = null;
  try {
    db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return await new Promise<LocalService | null>((resolve) => {
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as LocalService) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

export async function deleteLocalService(id: string): Promise<void> {
  let db: IDBDatabase | null = null;
  try {
    db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Silently fail on delete errors
  } finally {
    db?.close();
  }
}

export async function listLocalServices(): Promise<LocalService[]> {
  if (!isIndexedDBAvailable()) return [];
  let db: IDBDatabase | null = null;
  try {
    db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return await new Promise<LocalService[]>((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as LocalService[]);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  } finally {
    db?.close();
  }
}
