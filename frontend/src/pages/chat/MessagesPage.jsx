import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Send, MessageSquare, User, Clock, CheckCheck, 
  Search, AlertCircle, ArrowLeft, Shield 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { partnerId: routePartnerId } = useParams();
  const [searchParams] = useSearchParams();
  const queryPartnerId = searchParams.get('partner');

  const activePartnerId = routePartnerId || queryPartnerId;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch conversations list
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await api.get('/chat/conversations');
      if (res?.success) {
        setConversations(res.data?.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Resolve active partner details
  useEffect(() => {
    if (!activePartnerId) return;

    const pid = parseInt(activePartnerId, 10);
    const existing = conversations.find((c) => c.partner_id === pid);

    if (existing) {
      setSelectedPartner(existing);
      fetchMessages(pid);
    } else {
      // Fetch user profile directly if no previous conversation exists
      api
        .get(`/profiles/${pid}`)
        .then((res) => {
          if (res?.success) {
            const u = res.data?.user;
            const newPartner = {
              partner_id: u.id,
              partner_name: `${u.profile?.first_name || ''} ${u.profile?.last_name || ''}`.trim() || u.email,
              partner_avatar: u.profile?.avatar_url,
              partner_headline: u.profile?.headline || u.role,
              partner_role: u.role,
              last_message: 'Start a new conversation...',
              unread_count: 0
            };
            setSelectedPartner(newPartner);
            fetchMessages(pid);
          }
        })
        .catch((err) => console.error('Error fetching partner profile:', err));
    }
  }, [activePartnerId, conversations.length]);

  // 3. Fetch messages for active conversation
  const fetchMessages = async (partnerId) => {
    try {
      setLoadingMessages(true);
      const res = await api.get(`/chat/messages/${partnerId}`);
      if (res?.success) {
        setMessages(res.data?.messages || []);
        // Reset unread badge in conversation list
        setConversations((prev) =>
          prev.map((c) => (c.partner_id === partnerId ? { ...c, unread_count: 0 } : c))
        );
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. Real-time Socket.IO Message Listener
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (msg) => {
      // If message is from currently active conversation partner
      if (
        selectedPartner &&
        (msg.sender_id === selectedPartner.partner_id || msg.recipient_id === selectedPartner.partner_id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      // Update conversations list snippet and unread count
      setConversations((prev) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const exists = prev.some((c) => c.partner_id === partnerId);

        if (exists) {
          return prev.map((c) =>
            c.partner_id === partnerId
              ? {
                  ...c,
                  last_message: msg.content,
                  last_message_at: msg.created_at,
                  unread_count:
                    selectedPartner?.partner_id === partnerId ? 0 : (c.unread_count || 0) + 1
                }
              : c
          );
        } else {
          fetchConversations();
          return prev;
        }
      });
    };

    socket.on('new_message', handleIncomingMessage);
    return () => {
      socket.off('new_message', handleIncomingMessage);
    };
  }, [socket, selectedPartner, user?.id]);

  // 5. Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartner || sending) return;

    const payload = {
      recipient_id: selectedPartner.partner_id,
      content: inputText.trim()
    };

    try {
      setSending(true);
      const res = await api.post('/chat/send', payload);
      if (res?.success) {
        const sentMsg = res.data?.message;
        setMessages((prev) => [...prev, sentMsg]);
        setInputText('');

        // Update local conversation item
        setConversations((prev) =>
          prev.map((c) =>
            c.partner_id === selectedPartner.partner_id
              ? { ...c, last_message: sentMsg.content, last_message_at: sentMsg.created_at }
              : c
          )
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.partner_name || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-6rem)]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm h-full flex overflow-hidden">
        {/* Left Sidebar: Conversations */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
            selectedPartner ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Direct Messages
            </h2>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
            {loadingConversations ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                No active conversations yet. Visit the Alumni Directory or Mentorship page to connect!
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedPartner?.partner_id === c.partner_id;
                return (
                  <button
                    key={c.partner_id}
                    onClick={() => {
                      setSelectedPartner(c);
                      fetchMessages(c.partner_id);
                    }}
                    className={`w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                      isSelected ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                        {c.partner_name?.[0] || 'U'}
                      </div>
                      {c.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {c.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {c.partner_name}
                        </p>
                        <span className="text-[10px] text-gray-400">
                          {c.last_message_at
                            ? new Date(c.last_message_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {c.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Pane: Active Conversation */}
        <div
          className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/40 ${
            !selectedPartner ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedPartner ? (
            <>
              {/* Partner Header */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mr-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedPartner.partner_name?.[0] || 'U'}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {selectedPartner.partner_name}
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold">
                        {selectedPartner.partner_role}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {selectedPartner.partner_headline || 'Alumni Connect Member'}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/alumni/${selectedPartner.partner_id}`}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View Profile
                </Link>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="text-center text-xs text-gray-400 py-8">Loading history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    This is the start of your direct conversation with {selectedPartner.partner_name}. Say hello!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSelf = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isSelf
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isSelf && <CheckCheck className="w-3 h-3 text-blue-500" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Write a message to ${selectedPartner.partner_name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare className="w-16 h-16 stroke-1 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                Select a Conversation
              </h3>
              <p className="text-xs max-w-sm mt-1">
                Choose a partner from the sidebar or click "Message" on any Alumni or Mentor card to begin a chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
