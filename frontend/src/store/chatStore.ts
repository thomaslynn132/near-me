import { create } from 'zustand';

interface Message {
  _id: string;
  senderId: { _id: string; name: string };
  receiverId: { _id: string; name: string };
  matchId: string;
  content: string;
  messageType: 'text' | 'image' | 'voice' | 'location';
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  matchId: string;
  isBlind: boolean;
  isRevealed: boolean;
  otherUser: any;
  lastMessage?: Message;
  unreadCount: number;
  messageCount: number;
  revealThreshold: number;
}

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeChat: string | null;
  typingUsers: Record<string, string[]>;
  setConversations: (convs: Conversation[]) => void;
  setMessages: (matchId: string, msgs: Message[]) => void;
  addMessage: (matchId: string, msg: Message) => void;
  setActiveChat: (id: string | null) => void;
  setTyping: (matchId: string, userId: string, isTyping: boolean) => void;
  markAsRead: (matchId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeChat: null,
  typingUsers: {},

  setConversations: (convs) => set({ conversations: convs }),

  setMessages: (matchId, msgs) =>
    set((state) => ({ messages: { ...state.messages, [matchId]: msgs } })),

  addMessage: (matchId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), msg],
      },
    })),

  setActiveChat: (id) => set({ activeChat: id }),

  setTyping: (matchId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[matchId] || [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [matchId]: isTyping
            ? [...current.filter((id) => id !== userId), userId]
            : current.filter((id) => id !== userId),
        },
      };
    }),

  markAsRead: (matchId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.matchId === matchId ? { ...c, unreadCount: 0 } : c
      ),
    })),
}));
