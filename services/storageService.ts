import { AppState, Block, Channel } from '../types';

const STORAGE_KEY = 'my_stash_v1';

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'c_inbox', title: 'Inbox', slug: 'inbox', createdAt: Date.now() },
  { id: 'c_design', title: 'Patterns', slug: 'patterns', vertical: 'Design', createdAt: Date.now() },
  { id: 'c_typography', title: 'Typography', slug: 'typography', vertical: 'Design', createdAt: Date.now() },
  { id: 'c_reading', title: 'Articles', slug: 'articles', vertical: 'Reading', createdAt: Date.now() },
];

const DEFAULT_STATE: AppState = {
  blocks: [],
  channels: DEFAULT_CHANNELS,
  activeChannelId: 'c_inbox',
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return DEFAULT_STATE;
    }
    return JSON.parse(serialized);
  } catch (e) {
    console.error("Failed to load state", e);
    return DEFAULT_STATE;
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const exportData = (state: AppState) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "my_stash_backup.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};