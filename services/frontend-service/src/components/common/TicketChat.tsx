'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/auth';
import { ticketService } from '../../services/api/ticketService';
import { Comment } from '../../types';
import { Card, CardContent } from '../ui/card';
import { THEME } from '../../lib/theme';
import { Send, MessageSquare, Plus, Mic, Paperclip, X, Download, Eye, File, Image as ImageIcon } from 'lucide-react';
import { formatFileSize } from '../../lib/helpers';

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 or URL
  thumbnail?: string; // for images
}

interface Message {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  employeeCode?: string;
  message: string;
  timestamp: string;
  attachments?: FileAttachment[];
}

interface TicketChatProps {
  ticketId: string;
  allowSubTicketRequest?: boolean;
}

const TicketChat: React.FC<TicketChatProps> = ({ ticketId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages from backend
  useEffect(() => {
    loadMessages();
    // Poll for new messages every 10 seconds? Or just rely on reloads/actions for now
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [ticketId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const comments = await ticketService.getComments(ticketId);
      const mappedMessages: Message[] = comments.map(c => ({
        id: c.id,
        ticketId: c.ticketId,
        userId: c.userId,
        userName: c.userName,
        userRole: c.userRole || 'user',
        employeeCode: c.employeeCode,
        message: c.content,
        timestamp: c.timestamp,
        attachments: c.attachments?.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type,
          size: att.size,
          data: att.url, // URL mapping
          thumbnail: att.thumbnailUrl
        }))
      }));
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newAttachments: FileAttachment[] = [];

    for (const file of fileArray) {
      try {
        const fileData = await convertFileToBase64(file);
        const attachment: FileAttachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileData,
        };

        // Generate thumbnail for images
        if (file.type.startsWith('image/')) {
          attachment.thumbnail = fileData;
        }

        newAttachments.push(attachment);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }

    setSelectedFiles(prev => [...prev, ...newAttachments]);
    setShowFileMenu(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Remove selected file
  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    return File;
  };

  // Check if file is image
  const isImage = (type: string) => type.startsWith('image/');

  // Check if file is document
  const isDocument = (type: string) => {
    return type.includes('pdf') ||
      type.includes('document') ||
      type.includes('word') ||
      type.includes('excel') ||
      type.includes('text') ||
      type.includes('sheet');
  };

  // Download file
  const handleDownload = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preview file
  const handlePreview = (attachment: FileAttachment) => {
    setPreviewFile(attachment);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !user) return;

    setLoading(true);
    try {
      // Send message via API
      if (newMessage.trim()) {
        const comment = await ticketService.addComment(ticketId, newMessage.trim());

        // Optimistic update or wait for reload?
        // Let's reload to be safe and ensure consistent ID/timestamp
        await loadMessages();
      }

      // TODO: Handle file attachments upload separately if needed
      if (selectedFiles.length > 0) {
        console.warn('File attachments not yet supported in backend chat API');
      }

      setNewMessage('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Maybe show toast error
    } finally {
      setLoading(false);
    }
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
      case 'requestor':
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
      case 'requestor':
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
            Communicate with requestor, moderator, and assignee
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
                        {/* Message Text */}
                        {msg.message && (
                          <p className="text-sm whitespace-pre-wrap break-words mb-1.5 leading-relaxed">{msg.message}</p>
                        )}

                        {/* File Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-2 mb-1.5">
                            {msg.attachments.map((attachment) => {
                              const FileIcon = getFileIcon(attachment.type);

                              return (
                                <div
                                  key={attachment.id}
                                  className="bg-white rounded-lg p-2 border border-gray-200 hover:border-gray-300 transition-colors"
                                >
                                  {/* Image Preview */}
                                  {isImage(attachment.type) && attachment.thumbnail && (
                                    <div className="mb-2 rounded overflow-hidden cursor-pointer" onClick={() => handlePreview(attachment)}>
                                      <img
                                        src={attachment.thumbnail}
                                        alt={attachment.name}
                                        className="w-full max-w-xs h-auto rounded"
                                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                                      />
                                    </div>
                                  )}

                                  {/* File Info */}
                                  <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0">
                                      <FileIcon className="w-5 h-5" style={{ color: THEME.colors.primary }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate" title={attachment.name}>
                                        {attachment.name}
                                      </p>
                                      <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {isImage(attachment.type) && (
                                        <button
                                          onClick={() => handlePreview(attachment)}
                                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                                          title="Preview"
                                        >
                                          <Eye className="w-4 h-4 text-gray-600" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDownload(attachment)}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        title="Download"
                                      >
                                        <Download className="w-4 h-4 text-gray-600" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

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

        {/* File Preview Modal */}
        {previewFile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewFile(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Preview Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">{previewFile.name}</h3>

                {isImage(previewFile.type) ? (
                  <img
                    src={previewFile.data}
                    alt={previewFile.name}
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '70vh' }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    {(() => {
                      const FileIconComponent = getFileIcon(previewFile.type);
                      return <FileIconComponent className="w-16 h-16 text-gray-400 mb-4" />;
                    })()}
                    <p className="text-gray-600 mb-2">{previewFile.name}</p>
                    <p className="text-sm text-gray-500 mb-4">{formatFileSize(previewFile.size)}</p>
                    <button
                      onClick={() => handleDownload(previewFile)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="px-3 py-2 border-t flex-shrink-0 bg-white" style={{ borderColor: THEME.colors.light }}>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200"
                >
                  {isImage(file.type) && file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <File className="w-4 h-4 text-gray-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate max-w-[100px]" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - WhatsApp Style */}
        <div className="p-3 border-t flex-shrink-0" style={{ borderColor: THEME.colors.light, backgroundColor: '#F0F2F5' }}>
          <div className="flex gap-2 items-center">
            {/* File Upload Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFileMenu(!showFileMenu);
                  fileInputRef.current?.click();
                }}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                style={{ color: '#54656F' }}
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            </div>

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
            {(newMessage.trim() || selectedFiles.length > 0) ? (
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
export { TicketChat };


