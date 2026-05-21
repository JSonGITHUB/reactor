const DB_NAME = 'kfa-assistant-photos-db';
const DB_VERSION = 1;
const STORE_NAME = 'assistant-photos';

export const isAssistantPhotoDbAvailable = () => typeof indexedDB !== 'undefined';

const openDb = () => new Promise((resolve, reject) => {
    if (!isAssistantPhotoDbAvailable()) {
        reject(new Error('IndexedDB is not available in this browser context.'));
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
    request.onerror = () => reject(request.error || new Error('Failed to open assistant photo database.'));
});

export const persistAssistantPhoto = async (id, blob) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put({ id, blob });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('Failed to persist photo.'));
        tx.onerror = () => reject(tx.error || new Error('Photo transaction failed.'));
        tx.onabort = () => reject(tx.error || new Error('Photo transaction aborted.'));
        tx.oncomplete = () => db.close();
    });
};

export const getAssistantPhotoBlob = async (id) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result?.blob || null);
        req.onerror = () => reject(req.error || new Error('Failed to read photo.'));
        tx.onerror = () => reject(tx.error || new Error('Photo read transaction failed.'));
        tx.onabort = () => reject(tx.error || new Error('Photo read transaction aborted.'));
        tx.oncomplete = () => db.close();
    });
};

export const removeAssistantPhoto = async (id) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('Failed to remove photo.'));
        tx.onerror = () => reject(tx.error || new Error('Photo delete transaction failed.'));
        tx.onabort = () => reject(tx.error || new Error('Photo delete transaction aborted.'));
        tx.oncomplete = () => db.close();
    });
};
