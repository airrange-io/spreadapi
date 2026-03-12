const STORAGE_KEY = 'spreadapi_folders';

export interface Folder {
  id: string;
  name: string;
  serviceIds: string[];
  createdAt: string;
  updatedAt: string;
}

function isStorageAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  } catch {
    return false;
  }
}

export function listFolders(): Folder[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Folder[];
  } catch {
    return [];
  }
}

function saveFolders(folders: Folder[]): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

export function createFolder(name: string): Folder {
  const folders = listFolders();
  const folder: Folder = {
    id: `folder_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    serviceIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  folders.push(folder);
  saveFolders(folders);
  return folder;
}

export function renameFolder(id: string, newName: string): void {
  const folders = listFolders();
  const folder = folders.find(f => f.id === id);
  if (folder) {
    folder.name = newName;
    folder.updatedAt = new Date().toISOString();
    saveFolders(folders);
  }
}

export function deleteFolder(id: string): void {
  const folders = listFolders().filter(f => f.id !== id);
  saveFolders(folders);
}

export function addServiceToFolder(folderId: string, serviceId: string): void {
  const folders = listFolders();
  // Remove from any existing folder first
  for (const f of folders) {
    f.serviceIds = f.serviceIds.filter(sid => sid !== serviceId);
  }
  const folder = folders.find(f => f.id === folderId);
  if (folder) {
    folder.serviceIds.push(serviceId);
    folder.updatedAt = new Date().toISOString();
    saveFolders(folders);
  }
}

export function removeServiceFromFolder(serviceId: string): void {
  const folders = listFolders();
  let changed = false;
  for (const f of folders) {
    const before = f.serviceIds.length;
    f.serviceIds = f.serviceIds.filter(sid => sid !== serviceId);
    if (f.serviceIds.length !== before) {
      f.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) saveFolders(folders);
}

export function getServiceFolderId(serviceId: string): string | null {
  const folders = listFolders();
  for (const f of folders) {
    if (f.serviceIds.includes(serviceId)) return f.id;
  }
  return null;
}
