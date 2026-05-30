import * as FileSystem from 'expo-file-system/legacy';

const BASE_DIR = `${FileSystem.documentDirectory}DevSnippets/`;

export interface LocalFile {
  name: string;
  uri: string;
  size: number;
  modified: number;
}

const ensureDir = async (path: string): Promise<void> => {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
};

export const initFileStorage = async (): Promise<void> => {
  await ensureDir(BASE_DIR);
  await ensureDir(`${BASE_DIR}exports/`);
  await ensureDir(`${BASE_DIR}screenshots/`);
};

export const getBaseDirectory = (): string => BASE_DIR;

export const listFiles = async (subdir = ''): Promise<LocalFile[]> => {
  const dir = `${BASE_DIR}${subdir}`;
  await ensureDir(dir);
  const names = await FileSystem.readDirectoryAsync(dir);
  const files: LocalFile[] = [];

  for (const name of names) {
    const uri = `${dir}${name}`;
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && !info.isDirectory) {
      files.push({
        name,
        uri,
        size: info.size ?? 0,
        modified: info.modificationTime ?? 0,
      });
    }
  }

  return files.sort((a, b) => b.modified - a.modified);
};

export const deleteFile = async (uri: string): Promise<void> => {
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
};

export const copyFile = async (fromUri: string, toDir: string): Promise<string> => {
  await ensureDir(toDir);
  const fileName = fromUri.split('/').pop() ?? `file_${Date.now()}`;
  const dest = `${toDir}${fileName}`;
  await FileSystem.copyAsync({ from: fromUri, to: dest });
  return dest;
};

export const moveFile = async (fromUri: string, toDir: string): Promise<string> => {
  const dest = await copyFile(fromUri, toDir);
  await deleteFile(fromUri);
  return dest;
};

export const readFileContent = async (uri: string): Promise<string> => {
  return FileSystem.readAsStringAsync(uri);
};

export const writeFile = async (
  dir: string,
  fileName: string,
  content: string
): Promise<string> => {
  const fullDir = `${BASE_DIR}${dir}`;
  await ensureDir(fullDir);
  const uri = `${fullDir}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, content);
  return uri;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
