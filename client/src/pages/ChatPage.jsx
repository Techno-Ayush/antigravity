import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Calendar,
  Clock,
  Sparkles,
  CheckCheck
} from 'lucide-react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [peerTyping, setPeerTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      if (socket) {
        socket.emit('join_conversation', activeConv._id);
      }
    }
  }, [activeConv?._id, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg) => {
      if (msg.conversation?.toString() === activeConv?._id?.toString()) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    socket.on('user_typing', () => setPeerTyping(true));
    socket.on('user_stop_typing', () => setPeerTyping(false));

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, activeConv?._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0) {
          setActiveConv(res.data.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      // Send via socket for instant broadcast
      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConv._id,
          senderId: user._id,
          text: textToSend
        });
        socket.emit('stop_typing', { conversationId: activeConv._id });
      } else {
        // Fallback to REST API
        await api.post(`/conversations/${activeConv._id}/messages`, { text: textToSend });
        fetchMessages(activeConv._id);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getCounterparty = (conv) => {
    return conv.participants.find((p) => p._id?.toString() !== user?._id?.toString()) || conv.participants[0];
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to peer messaging..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[75vh]">
        {/* Left Pane: Conversations List */}
        <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Session Messages</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                No active conversations yet. Conversations appear when you book or receive a session!
              </div>
            ) : (
              conversations.map((conv) => {
                const peer = getCounterparty(conv);
                const isSelected = activeConv?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isSelected ? 'bg-white shadow-2xs border-l-4 border-brand-600' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <img
                      src={peer?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={peer?.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{peer?.name}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.updatedAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage?.text || 'Session coordination'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Message Thread */}
        {activeConv ? (
          <div className="md:col-span-2 flex flex-col h-full bg-white">
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getCounterparty(activeConv)?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={getCounterparty(activeConv)?.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    {getCounterparty(activeConv)?.name}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Active Session Partner • 1 Credit / Hour Exchange
                  </p>
                </div>
              </div>

              {activeConv.session && (
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                  {activeConv.session?.skill?.name || 'Skill Exchange'}
                </span>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Start coordinating your session details below!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender?._id?.toString() === user?._id?.toString();

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMine
                            ? 'bg-brand-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              {peerTyping && (
                <div className="text-xs text-slate-400 italic">Typing...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message to coordinate your exchange..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center p-8 text-center text-xs text-slate-400">
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
