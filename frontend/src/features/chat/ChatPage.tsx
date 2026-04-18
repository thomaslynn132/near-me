import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { chatApi } from '@/services/api';
import { socketService } from '@/services/socket';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatTime } from '@/lib/utils';
import { Send, Image, MapPin, MoreVertical } from 'lucide-react';

export default function ChatPage() {
  const { conversations, messages, activeChat, setConversations, setMessages, addMessage, setActiveChat, setTyping } = useChatStore();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    loadConversations();
    setupSocketListeners();
    return () => {
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('user_stop_typing');
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
      socketService.joinMatch(activeChat);
    }
    return () => {
      if (activeChat) socketService.leaveMatch(activeChat);
    };
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[activeChat || '']]);

  const setupSocketListeners = () => {
    socketService.on('new_message', (msg: any) => {
      addMessage(msg.matchId, msg);
      if (activeChat === msg.matchId) {
        socketService.markRead(msg.matchId);
      }
    });

    socketService.on('user_typing', ({ matchId, userId }: { matchId: string; userId: string }) => {
      setTyping(matchId, userId, true);
    });

    socketService.on('user_stop_typing', ({ matchId, userId }: { matchId: string; userId: string }) => {
      setTyping(matchId, userId, false);
    });
  };

  const loadConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data.data);
    } catch (err) {
      console.error('Failed to load conversations');
    }
  };

  const loadMessages = async (matchId: string) => {
    try {
      const res = await chatApi.getMessages(matchId);
      setMessages(matchId, res.data.data);
    } catch (err) {
      console.error('Failed to load messages');
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || !activeChat) return;
    socketService.sendMessage(activeChat, newMessage);
    setNewMessage('');
    if (isTyping) {
      socketService.stopTyping(activeChat);
      setIsTyping(false);
    }
  };

  const handleTyping = () => {
    if (!isTyping && activeChat) {
      setIsTyping(true);
      socketService.startTyping(activeChat);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && activeChat) {
        setIsTyping(false);
        socketService.stopTyping(activeChat);
      }
    }, 2000);
  };

  const currentMessages = messages[activeChat || ''] || [];
  const activeConversation = conversations.find((c) => c.matchId === activeChat);

  return (
    <div className="h-full flex">
      <div className="w-80 border-r border-border flex flex-col bg-surface">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.matchId}
              onClick={() => setActiveChat(conv.matchId)}
              className={`p-4 border-b border-border cursor-pointer transition-colors ${
                activeChat === conv.matchId ? 'bg-primary/20' : 'hover:bg-surface-light'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conv.otherUser?.profileImages?.[0]?.url} />
                  <AvatarFallback>{conv.otherUser?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold truncate">
                      {conv.isBlind && !conv.isRevealed ? '👤 ' : ''}{conv.otherUser?.name || 'Unknown'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 truncate">
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No conversations yet. Start matching!
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3 bg-surface">
              <Avatar className="w-10 h-10">
                <AvatarImage src={activeConversation?.otherUser?.profileImages?.[0]?.url} />
                <AvatarFallback>{activeConversation?.otherUser?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {activeConversation?.isBlind && !activeConversation?.isRevealed ? '👤 ' : ''}
                  {activeConversation?.otherUser?.name || 'Unknown'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeConversation?.otherUser?.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation?.isBlind && !activeConversation?.isRevealed && (
                <div className="text-center py-2">
                  <span className="px-4 py-2 bg-surface-light rounded-full text-sm text-slate-400">
                    Blind Match • Chat {activeConversation.messageCount}/{activeConversation.revealThreshold} to reveal
                  </span>
                </div>
              )}
              
              {currentMessages.map((msg) => {
                const isMe = msg.senderId?._id === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-surface-light text-slate-100 rounded-bl-sm'
                      }`}
                    >
                      {msg.messageType === 'text' && <p>{msg.content}</p>}
                      {msg.messageType === 'image' && (
                        <img src={msg.mediaUrl} alt="" className="rounded-lg max-w-full" />
                      )}
                      <span className="text-xs opacity-70 mt-1 block">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-surface">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Image className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MapPin className="w-5 h-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!newMessage.trim()}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
