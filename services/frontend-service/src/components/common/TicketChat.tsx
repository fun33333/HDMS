'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '../ui/card';
import { THEME } from '../../lib/theme';
import { Send, MessageSquare, Plus, Mic } from 'lucide-react';

interface Message {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  employeeCode?: string;
  message: string;
  timestamp: string;
}

interface TicketChatProps {
  ticketId: string;
}

const TicketChat: React.FC<TicketChatProps> = ({ ticketId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    loadMessages();
  }, [ticketId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    try {
      const storedMessages = localStorage.getItem(`chat_${ticketId}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = (updatedMessages: Message[]) => {
    try {
      localStorage.setItem(`chat_${ticketId}`, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    const message: Message = {
      id: Date.now().toString(),
      ticketId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      employeeCode: user.employeeCode,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setNewMessage('');
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }
  };

  const shouldShowDate = (currentMsg: Message, previousMsg: Message | undefined) => {
    if (!previousMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const previousDate = new Date(previousMsg.timestamp).toDateString();
    return currentDate !== previousDate;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'moderator':
        return THEME.colors.primary;
      case 'assignee':
        return THEME.colors.success;
      case 'requester':
        return THEME.colors.medium;
      default:
        return THEME.colors.gray;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'moderator':
        return {
          backgroundColor: THEME.colors.light,
          color: THEME.colors.primary
        };
      case 'assignee':
        return {
          backgroundColor: '#D1FAE5',
          color: THEME.colors.success
        };
      case 'requester':
        return {
          backgroundColor: '#E9D5FF',
          color: THEME.colors.medium
        };
      default:
        return {
          backgroundColor: '#F3F4F6',
          color: THEME.colors.gray
        };
    }
  };

  return (
    <Card className="flex flex-col shadow-lg h-full" style={{ backgroundColor: THEME.colors.white }}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0" style={{ borderColor: THEME.colors.light }}>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: THEME.colors.primary }} />
            <h3 className="text-lg font-bold" style={{ color: THEME.colors.primary }}>
              Ticket Chat
            </h3>
          </div>
          <p className="text-sm mt-1" style={{ color: THEME.colors.gray }}>
            Communicate with requester, moderator, and assignee
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0" style={{ backgroundColor: '#ECE5DD', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\' /%3E%3C/svg%3E")' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12" style={{ color: THEME.colors.gray }}>
              <MessageSquare className="w-10 h-10 mb-2 opacity-40" style={{ color: THEME.colors.gray }} />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs opacity-75 mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const previousMsg = index > 0 ? messages[index - 1] : undefined;
              const showDate = shouldShowDate(msg, previousMsg);
              const isOwnMessage = msg.userId === user?.id;
              const getInitials = (name: string) => {
                return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              };
              
              const getAvatarColor = (name: string) => {
                const colors = [
                  THEME.colors.primary,
                  THEME.colors.medium,
                  THEME.colors.success,
                  '#8B5CF6',
                  '#F59E0B'
                ];
                const index = name.charCodeAt(0) % colors.length;
                return colors[index];
              };

              return (
                <React.Fragment key={msg.id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div className="px-3 py-1 rounded-full bg-gray-200">
                        <span className="text-xs text-gray-600 font-medium">
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Group Chat Style - Own messages on right, others on left */}
                  <div className={`flex items-start gap-2 mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {/* Avatar - Left for others, right for own messages */}
                    {!isOwnMessage && (
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold mt-0.5"
                        style={{ backgroundColor: getAvatarColor(msg.userName) }}
                      >
                        {getInitials(msg.userName)}
                      </div>
                    )}
                    
                    {/* Message Container */}
                    <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      {/* Employee Code at the top with hover name */}
                      <div className={`mb-0.5 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                        <span 
                          className="text-xs font-semibold cursor-pointer" 
                          style={{ color: '#128C7E' }}
                          title={msg.userName}
                        >
                          {msg.employeeCode || msg.userRole.charAt(0).toUpperCase() + msg.userRole.slice(1)}
                        </span>
                      </div>
                      
                      {/* Message Bubble */}
                      <div
                        className={`rounded-lg px-3 py-2 ${isOwnMessage ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                        style={{
                          backgroundColor: isOwnMessage ? '#DCF8C6' : '#F0F0F0',
                          color: '#111111',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words mb-1.5 leading-relaxed">{msg.message}</p>
                        {/* Timestamp at bottom */}
                        <div className={`flex items-center ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <p
                            className="text-xs"
                            style={{
                              color: 'rgba(0, 0, 0, 0.5)'
                            }}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Avatar - Right for own messages */}
                    {isOwnMessage && (
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold mt-0.5"
                        style={{ backgroundColor: getAvatarColor(msg.userName) }}
                      >
                        {getInitials(msg.userName)}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - WhatsApp Style */}
        <div className="p-3 border-t flex-shrink-0" style={{ borderColor: THEME.colors.light, backgroundColor: '#F0F2F5' }}>
          <div className="flex gap-2 items-center">
            {/* Plus Icon */}
            <button
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              style={{ color: '#54656F' }}
            >
              <Plus className="w-5 h-5" />
            </button>
            
            {/* Text Input */}
            <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center" style={{ border: `1px solid ${THEME.colors.light}` }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message"
                className="flex-1 bg-transparent border-0 outline-none resize-none text-sm placeholder:text-gray-400 text-gray-900 max-h-20 overflow-y-auto"
                style={{
                  minHeight: '24px'
                }}
                rows={1}
                disabled={loading || !user}
              />
            </div>

            {/* Send/Mic Button */}
            {newMessage.trim() ? (
              <button
                onClick={handleSendMessage}
                disabled={loading || !user}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: loading || !user ? '#8696A0' : '#25D366',
                  color: '#FFFFFF'
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                style={{ color: '#54656F' }}
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketChat;


