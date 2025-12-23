export type BlockType = 'text' | 'link' | 'image';

export interface Block {
  id: string;
  type: BlockType;
  content: string; // The URL or the Text body
  title?: string;
  description?: string;
  tags: string[];
  createdAt: number;
  channelId: string;
  metadata?: {
    imageUrl?: string; // For link previews or uploaded images
    favicon?: string;
    aiSummary?: string;
  };
}

export interface Channel {
  id: string;
  title: string;
  description?: string;
  slug: string;
  vertical?: string;
  createdAt: number;
}

export interface AppState {
  blocks: Block[];
  channels: Channel[];
  activeChannelId: string | null; // null means 'All'
}