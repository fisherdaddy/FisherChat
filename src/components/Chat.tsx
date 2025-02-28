import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  addMessage,
  updateMessage,
  addConversation,
  Message,
} from '../store/slices/chatSlice';
import { chatService } from '../services/chat';
import { apiService } from '../services/api';
import { ApiError } from '../services/api';
import { i18nService } from '../services/i18n';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  UserCircleIcon,
  SparklesIcon,
  LightBulbIcon,
  StopIcon,
  ClipboardDocumentIcon,
  PencilSquareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import ErrorMessage from './ErrorMessage';
import ModelSelector from './ModelSelector';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

// Function to convert LaTeX delimiters to remark-math compatible format
const convertLatexDelimiters = (text: string): string => {
  if (!text) return text;
  
  // Replace LaTeX inline math delimiters \( ... \) with $...$ 
  // Use a more robust approach to handle nested delimiters
  let result = text;
  
  // First, handle display math: \[ ... \] -> $$ ... $$
  const displayMathRegex = /\\\[([\s\S]*?)\\\]/g;
  result = result.replace(displayMathRegex, (_, math) => `$$${math}$$`);
  
  // Then handle inline math: \( ... \) -> $ ... $
  const inlineMathRegex = /\\\(([\s\S]*?)\\\)/g;
  result = result.replace(inlineMathRegex, (_, math) => `$${math}$`);
  
  return result;
};

// Modern AI typing indicator with pulse and shimmer effects
const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 animate-pulse">
    <div className="w-2 h-2 rounded-full bg-blue-400" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 rounded-full bg-blue-400" style={{ animationDelay: '200ms' }} />
    <div className="w-2 h-2 rounded-full bg-blue-400" style={{ animationDelay: '400ms' }} />
  </div>
);

const Chat: React.FC = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAiMessageId, setCurrentAiMessageId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [bottomPadding, setBottomPadding] = useState(120); // Default bottom padding
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const currentConversationId = useSelector((state: RootState) => state.chat.currentConversationId);
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  
  // Add useEffect to inject the shimmer animation CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Shimmer animation */
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      /* 添加这些新样式 */
      .markdown-content h1 h2 h3 h4 h5 h6 {
        margin-top: -2rem !important;
        margin-bottom: 0.5rem !important;
      }
      
      /* 为无序列表项添加自定义标记 */
      .markdown-content ul {
        margin-top: -1.5rem !important;
        margin-bottom: 0.5rem !important;
        padding-left: 0 !important;
      }
      
      .markdown-content ul > li {
        margin: 0.5em 0 !important;
        padding-left: 1.5em !important;
        list-style-type: none !important;
        position: relative !important;
        line-height: 1.6 !important;
      }
      
      .markdown-content ul > li::before {
        content: "•" !important;
        position: absolute !important;
        left: 0.2em !important;
        top: 0 !important;
        color: currentColor !important;
        font-weight: bold !important;
        font-size: 1.2em !important;
        display: inline-block !important;
        line-height: inherit !important;
      }
      
      /* 完全重写有序列表样式，使用表格布局 */
      .markdown-content ol {
        margin-top: -1.5rem !important;
        margin-bottom: -1.5rem !important;
        list-style: none !important;
        counter-reset: item !important;
        padding-left: 0 !important;
      }
      
      .markdown-content ol > li {
        counter-increment: item !important;
        display: table !important;
        width: 100% !important;
        margin: 0 !important;
      }
      
      .markdown-content ol > li::before {
        content: counter(item) ". " !important;
        display: table-cell !important;
        width: 1.5em !important;
        white-space: nowrap !important;
        padding-right: 0.5em !important;
        text-align: right !important;
        font-weight: bold !important;
      }
      
      /* 处理无序列表中的段落 */
      .markdown-content ul > li > p {
        margin: 0 !important;
        padding: 0 !important;
        display: inline-block !important;
        vertical-align: top !important;
      }
      
      /* KaTeX 公式样式优化 */
      .katex-display {
        margin: 1em 0 !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        padding-top: 0.5em !important;
        padding-bottom: 0.5em !important;
      }
      
      .katex {
        font-size: 1.1em !important;
      }
      
      /* 内联公式样式 */
      .katex-inline {
        display: inline-block !important;
        padding: 0 0.1em !important;
      }
      
      /* 块级公式样式 */
      .katex-block {
        display: block !important;
        padding: 0.5em 0 !important;
        overflow-x: auto !important;
      }
    `;
    document.head.appendChild(style);
  
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Update bottom padding when textarea content changes
  useEffect(() => {
    if (inputAreaRef.current) {
      const inputHeight = inputAreaRef.current.clientHeight;
      // Add more extra padding to ensure messages don't get hidden
      setBottomPadding(inputHeight + 50); // Increased from +10 to +50
    }
  }, [input]);

  // Update the scrollToBottom function for a more nuanced approach similar to mature AI chat applications
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Get the parent scroll container
      const scrollContainer = messagesEndRef.current.parentElement?.parentElement;
      if (!scrollContainer) return;
      
      // Calculate how much content is currently hidden
      const scrollBottom = scrollContainer.scrollTop + scrollContainer.clientHeight;
      const scrollMax = scrollContainer.scrollHeight;
      const scrollDistance = scrollMax - scrollBottom;
      
      // If user is very close to bottom or AI is responding, scroll all the way down
      if (scrollDistance < 100 || isAiResponding) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'  // Align to top of element (which is our spacer div)
        });
      }
      // Otherwise, user may be reading previous messages, so don't auto-scroll
    }
  };
  
  // Add a helper function to force scrolling to the very bottom (for use after new messages)
  const forceScrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Add dedicated scroll handling for when new user messages are sent
  useEffect(() => {
    // When user sends a message, always scroll to bottom
    if (currentConversation?.messages?.length && 
        currentConversation.messages[currentConversation.messages.length - 1]?.role === 'user') {
      forceScrollToBottom();
    }
  }, [currentConversation?.messages?.length]);

  // Update the mutation observer to use our new scroll logic
  useEffect(() => {
    // Only set up observer if we have messages
    if (!currentConversation?.messages?.length) return;
    
    // Create a mutation observer to watch for content changes in the AI message
    const messageContainer = messagesEndRef.current?.parentElement;
    if (!messageContainer) return;
    
    const observer = new MutationObserver((mutations) => {
      // Check if the mutations are related to AI response content
      const hasContentChanges = mutations.some(mutation => {
        return mutation.type === 'characterData' || 
               (mutation.type === 'childList' && mutation.addedNodes.length > 0);
      });
      
      if (hasContentChanges && isAiResponding) {
        requestAnimationFrame(() => {
          setTimeout(scrollToBottom, 10);
        });
      }
    });
    
    // Start observing content changes with appropriate config
    observer.observe(messageContainer, { 
      childList: true, 
      subtree: true, 
      characterData: true
    });
    
    // Clean up
    return () => observer.disconnect();
  }, [currentConversation?.messages?.length, isAiResponding]);

  // Update the handleSubmit function to use our improved scrolling logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let targetConversationId = currentConversationId;
    if (!targetConversationId) {
      const newConversation = chatService.createConversation();
      dispatch(addConversation(newConversation));
      targetConversationId = newConversation.id;
    }

    const userInput = input.trim();
    setInput('');
    setIsLoading(true);
    setIsAiResponding(true);
    
    // Create a temporary AI message ID to show loading immediately
    const tempAiMessageId = `ai-${Date.now()}`;
    setCurrentAiMessageId(tempAiMessageId);
    
    // Force scroll to bottom after user sends message
    setTimeout(forceScrollToBottom, 50);
    
    try {
      // Send the message and get the real AI message ID
      const { id: aiMessageId } = await chatService.sendMessage(
        targetConversationId, 
        userInput,
        (content) => {
          // Update the AI message content as streaming responses come in
          dispatch(updateMessage({
            conversationId: targetConversationId,
            messageId: aiMessageId,
            content,
          }));
          
          // Use requestAnimationFrame for smoother scrolling during streaming updates
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        }
      );
      
      // Update our reference to the real AI message ID
      setCurrentAiMessageId(aiMessageId);
      
      // Final scroll after all processing is complete
      setTimeout(forceScrollToBottom, 200);
    } catch (err) {
      // Handle error
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
      setIsAiResponding(false);
      // We don't set currentAiMessageId to null here anymore
      // so that we can still reference it for loading state
      // Force one final scroll after everything is complete
      setTimeout(forceScrollToBottom, 500);
    }
  };

  const handleStopResponse = () => {
    // Call API service to cancel the ongoing request
    if (apiService.cancelOngoingRequest()) {
      // Update UI state immediately
      setIsAiResponding(false);
    }
  };

  // Copy message content to clipboard
  const handleCopyMessage = (message: Message) => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        // Set the copied message ID to display checkmark
        setCopiedMessageId(message.id);
        
        // Could add a toast notification here
        console.log('Copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setError('Failed to copy text to clipboard');
      });
  };

  // Reset copied state after timeout
  useEffect(() => {
    if (copiedMessageId) {
      const timer = setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [copiedMessageId]);

  // Start editing a user message
  const handleEditMessage = (message: Message) => {
    if (message.role === 'user') {
      setEditingMessageId(message.id);
      setEditingContent(message.content);
    }
  };

  // Save the edited user message and update the associated AI response
  const handleSaveEdit = async (messageId: string) => {
    if (!editingContent.trim() || !currentConversationId) return;
    
    // Get the current conversation
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (!conversation) return;
    
    // Find the index of the edited message
    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Check if there's an AI response after this message
    const nextMessage = messageIndex < conversation.messages.length - 1 ? 
      conversation.messages[messageIndex + 1] : null;
    
    // Only proceed if the next message is an AI response
    const hasAiResponseToUpdate = nextMessage && nextMessage.role === 'assistant';
    
    // First, update the user message content
    dispatch(updateMessage({
      conversationId: currentConversationId,
      messageId,
      content: editingContent.trim(),
    }));
    
    // Reset editing state
    setEditingMessageId(null);
    setEditingContent('');
    
    // If there's an AI response to update, call the API
    if (hasAiResponseToUpdate && nextMessage) {
      setIsLoading(true);
      setIsAiResponding(true);
      
      try {
        // Use the new updateMessageResponse method to update the existing AI response
        await chatService.updateMessageResponse(
          currentConversationId,
          editingContent.trim(),
          nextMessage.id,
          (content) => {
            // Streaming updates are handled internally by the service
          }
        );
      } catch (err) {
        // Handle error
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
        console.error('Error sending edited message:', err);
      } finally {
        setIsLoading(false);
        setIsAiResponding(false);
      }
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderMessage = (message: Message) => {
    // Check if this is the latest assistant message
    const isLatestAssistantMessage = message.role === 'assistant' && 
      currentConversation?.messages?.filter(m => m.role === 'assistant').slice(-1)[0]?.id === message.id;
    
    // Show loading only for the latest assistant message when it's empty
    const showLoading = isLatestAssistantMessage && isLoading && !message.content;
    
    // Check if this message is being edited
    const isEditing = editingMessageId === message.id;
    
    return (
    <div
      key={message.id}
      className="py-1 px-4"
      onMouseEnter={() => setHoveredMessageId(message.id)}
      onMouseLeave={() => setHoveredMessageId(null)}
    >
      <div className="max-w-3xl mx-auto">
        <div className={`flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          {message.role === 'user' ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <UserCircleIcon className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
          )}
          <div className={`prose dark:prose-invert prose-slate max-w-2xl relative ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            {isEditing ? (
              // Editing mode for user messages
              <div className="w-full">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full resize-none dark:bg-slate-800 bg-white dark:text-white text-slate-900 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 border-slate-300 border"
                  rows={3}
                  autoFocus
                />
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm rounded-md dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-700 hover:dark:bg-slate-600 hover:bg-slate-300 transition-colors"
                  >
                    {i18nService.t('cancel')}
                  </button>
                  <button
                    onClick={() => handleSaveEdit(message.id)}
                    className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    {i18nService.t('save')}
                  </button>
                </div>
              </div>
            ) : (
              // Normal display mode
              <div className={`whitespace-pre-wrap dark:text-white text-slate-900 rounded-2xl px-4 py-3 bg-opacity-50 ${
                message.role === 'user' 
                  ? 'dark:bg-gradient-to-r dark:from-indigo-500/30 dark:to-purple-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-tr-none' 
                  : 'dark:bg-gradient-to-r dark:from-blue-500/20 dark:to-cyan-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-tl-none'
              }`}
              >
                {message.content ? (
                  <div className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[[rehypeKatex, { 
                        throwOnError: false,
                        output: 'html',
                        trust: true,
                        strict: false,
                        macros: {
                          // Add some common LaTeX macros if needed
                          "\\R": "\\mathbb{R}",
                          "\\N": "\\mathbb{N}",
                          "\\Z": "\\mathbb{Z}"
                        }
                      }]]}
                      components={{
                        p: ({ node, className, children, ...props }) => (
                          <p className="my-1 leading-normal dark:text-slate-100 text-slate-800" {...props}>
                            {children}
                          </p>
                        ),
                        h1: ({ node, className, children, ...props }) => (
                          <h1 className="text-2xl font-bold mt-4 mb-0.5 pb-1 dark:border-slate-700 border-slate-300 border-b" {...props}>
                            {children}
                          </h1>
                        ),
                        h2: ({ node, className, children, ...props }) => (
                          <h2 className="text-xl font-bold mt-3 mb-0.5 pb-1 dark:border-slate-700 border-slate-300 border-b" {...props}>
                            {children}
                          </h2>
                        ),
                        h3: ({ node, className, children, ...props }) => (
                          <h3 className="text-lg font-bold mt-2 mb-0.5" {...props}>
                            {children}
                          </h3>
                        ),
                        ul: ({ node, className, children, ...props }) => (
                          <ul className="list-disc pl-5 my-0.5" {...props}>
                            {children}
                          </ul>
                        ),
                        ol: ({ node, className, children, ...props }) => (
                          <ol className="list-decimal pl-6 my-0.5" {...props}>
                            {children}
                          </ol>
                        ),
                        li: ({ node, className, children, ...props }) => (
                          <li className="my-0.5 leading-normal" {...props}>
                            {children}
                          </li>
                        ),
                        blockquote: ({ node, className, children, ...props }) => (
                          <blockquote className="border-l-4 dark:border-slate-500 border-slate-400 pl-4 py-0.5 my-1 dark:bg-slate-800/50 bg-slate-200/50 rounded-r" {...props}>
                            {children}
                          </blockquote>
                        ),
                        code: ({ className, children, ...props }) => {
                          // @ts-ignore - Ignoring TypeScript complaints about inline property
                          const match = /language-(\w+)/.exec(className || '');
                          // @ts-ignore - Ignoring TypeScript complaints about inline property
                          return !props.inline && match ? (
                            <div className="my-2 rounded-md overflow-hidden">
                              <div className="dark:bg-slate-900 bg-slate-200 px-4 py-1 text-xs dark:text-slate-400 text-slate-600 dark:border-slate-700 border-slate-300 border-b">
                                {match[1]}
                              </div>
                              <SyntaxHighlighter
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-b-md"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="dark:bg-slate-800 bg-slate-200 px-1.5 py-0.5 rounded text-sm dark:text-pink-400 text-pink-600" {...props}>
                              {children}
                            </code>
                          );
                        },
                        table: ({ node, className, children, ...props }) => (
                          <div className="my-4 overflow-x-auto">
                            <table className="border-collapse dark:border-slate-700 border-slate-300 border w-full" {...props}>
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ node, className, children, ...props }) => (
                          <thead className="dark:bg-slate-800 bg-slate-200" {...props}>
                            {children}
                          </thead>
                        ),
                        tbody: ({ node, className, children, ...props }) => (
                          <tbody className="divide-y dark:divide-slate-700 divide-slate-300" {...props}>
                            {children}
                          </tbody>
                        ),
                        tr: ({ node, className, children, ...props }) => (
                          <tr className="divide-x dark:divide-slate-700 divide-slate-300" {...props}>
                            {children}
                          </tr>
                        ),
                        th: ({ node, className, children, ...props }) => (
                          <th className="px-4 py-2 text-left font-semibold" {...props}>
                            {children}
                          </th>
                        ),
                        td: ({ node, className, children, ...props }) => (
                          <td className="px-4 py-2" {...props}>
                            {children}
                          </td>
                        ),
                        a: ({ node, href, className, children, ...props }) => (
                          <a 
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                            {...props}
                          >
                            {children}
                          </a>
                        ),
                        img: ({ node, className, ...props }) => (
                          <img className="max-w-full h-auto rounded-md my-4" {...props} />
                        ),
                        hr: ({ node, ...props }) => (
                          <hr className="my-6 border-slate-700" {...props} />
                        ),
                      }}
                    >
                      {convertLatexDelimiters(message.content)}
                    </ReactMarkdown>
                  </div>
                ) : showLoading ? (
                  <TypingIndicator />
                ) : (
                  <span className="text-slate-500 italic">{i18nService.t('emptyMessage')}</span>
                )}
              </div>
            )}
            
            {/* Action buttons that show on hover - moved outside of the content area */}
            <div className={`flex space-x-1 rounded-md p-0.5 z-10 mt-0.5 h-6 items-center ${
              message.role === 'user' ? 'justify-end' : 'justify-end'
            } ${
              !message.content 
                ? 'hidden' // Hide completely when no content
                : hoveredMessageId === message.id && !isEditing 
                  ? 'opacity-100 pointer-events-auto' 
                  : 'opacity-0 pointer-events-none'
            } transition-opacity duration-200`}>
              <button
                onClick={() => handleCopyMessage(message)}
                className="p-1 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 rounded transition-colors dark:hover:bg-slate-700 hover:bg-slate-200"
                title={i18nService.t('copyToClipboard')}
                disabled={!message.content || isEditing}
              >
                {copiedMessageId === message.id ? (
                  <CheckIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
              {message.role === 'user' && (
                <button
                  onClick={() => handleEditMessage(message)}
                  className="p-1 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 rounded transition-colors dark:hover:bg-slate-700 hover:bg-slate-200"
                  title={i18nService.t('editMessage')}
                  disabled={!message.content || isEditing}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {showLoading && (
              <div className="text-xs text-blue-400 mt-1 ml-1 flex items-center">
                <SparklesIcon className="h-3 w-3 mr-1 animate-pulse" />
                {i18nService.t('thinking')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Update the button rendering in both places where the submit button appears
  // First instance (when no current conversation)
  const renderInputButton = () => {
    if (isAiResponding) {
      return (
        <button
          type="button"
          onClick={handleStopResponse}
          className="p-1.5 rounded-full text-white bg-red-500 hover:bg-red-600 shadow-md"
        >
          <StopIcon className="h-5 w-5" />
        </button>
      );
    }
    
    return (
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className={`p-1.5 rounded-full ${
          isLoading || !input.trim()
            ? 'dark:text-slate-400 text-slate-400 dark:bg-slate-700 bg-slate-200'
            : 'text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md'
        }`}
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </button>
    );
  };

  if (!currentConversationId) {
    return (
      <div className="flex-1 flex flex-col dark:bg-slate-900 bg-slate-50 relative">
        {/* Header with Model Selector */}
        <div className="absolute top-0 left-0 right-0 h-14 flex items-center px-4 dark:bg-slate-900 bg-slate-50 dark:border-slate-700 border-slate-300 border-b z-10">
          <ModelSelector />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pt-16" style={{ paddingBottom: `${bottomPadding}px` }}>
          {error && (
            <div className="sticky top-0 z-10">
              <ErrorMessage message={error} onClose={() => setError(null)} />
            </div>
          )}
          <div className="max-w-3xl mx-auto">
            {/* Welcome Message */}
            <div className="py-10 px-4">
              <div className="max-w-3xl mx-auto flex justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <LightBulbIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 dark:text-white text-slate-900">FisherChat</h2>
                  <p className="dark:text-slate-300 text-slate-600 text-lg">{i18nService.t('welcomeMessage')}</p>
                </div>
              </div>
            </div>
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Gradient Backdrop */}
        <div ref={inputAreaRef} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-900 pt-10">
          <div className="max-w-3xl mx-auto px-4 pb-6">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    placeholder={i18nService.t('typeMessage')}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="w-full rounded-xl dark:bg-slate-800 bg-white px-4 py-3 pr-14 dark:text-white text-slate-900 dark:border-slate-700 border-slate-300 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-slate-400 placeholder-slate-500 resize-none max-h-36 overflow-y-auto shadow-md"
                    style={{ minHeight: '56px' }}
                  />
                  <div className="absolute right-3 bottom-2.5 flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-1.5 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 rounded-full dark:hover:bg-slate-700 hover:bg-slate-200"
                    >
                      <MicrophoneIcon className="h-5 w-5" />
                    </button>
                    {renderInputButton()}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!currentConversation || currentConversation.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col dark:bg-slate-900 bg-slate-50 relative h-full">
        {/* Header with Model Selector - 保持在左上角 */}
        <div className="h-14 flex items-center px-4 dark:bg-slate-900 bg-slate-50 dark:border-slate-700 border-slate-300 border-b z-10 shrink-0">
          <ModelSelector />
        </div>
        
        {/* 空聊天界面 - 欢迎信息 */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ paddingBottom: `${bottomPadding}px` }}>
          <div className="max-w-3xl mx-auto">
            <div className="py-10 px-4">
              <div className="max-w-3xl mx-auto flex justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <LightBulbIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 dark:text-white text-slate-900">FisherChat</h2>
                  <p className="dark:text-slate-300 text-slate-600 text-lg">{i18nService.t('welcomeMessage')}</p>
                </div>
              </div>
            </div>
          </div>
          <div ref={messagesEndRef} />
        </div>
        
        {/* 输入框部分 - 保持提交按钮在右侧 */}
        <div ref={inputAreaRef} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-900 pt-10">
          <div className="max-w-3xl mx-auto px-4 pb-6">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    placeholder={i18nService.t('typeMessage')}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="w-full rounded-xl dark:bg-slate-800 bg-white px-4 py-3 pr-14 dark:text-white text-slate-900 dark:border-slate-700 border-slate-300 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-slate-400 placeholder-slate-500 resize-none max-h-36 overflow-y-auto shadow-md"
                    style={{ minHeight: '56px' }}
                  />
                  <div className="absolute right-3 bottom-2.5 flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-1.5 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 rounded-full dark:hover:bg-slate-700 hover:bg-slate-200"
                    >
                      <MicrophoneIcon className="h-5 w-5" />
                    </button>
                    {renderInputButton()}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col dark:bg-slate-900 bg-slate-50 relative h-full">
      {/* Header with Model Selector */}
      <div className="h-14 flex items-center px-4 dark:bg-slate-900 bg-slate-50 dark:border-slate-700 border-slate-300 border-b z-10 shrink-0">
        <ModelSelector />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ paddingBottom: `${bottomPadding}px` }}>
        {error && (
          <div className="sticky top-0 z-10">
            <ErrorMessage message={error} onClose={() => setError(null)} />
          </div>
        )}
        <div className="max-w-3xl mx-auto pt-4">
          {(!currentConversation?.messages || currentConversation.messages.length === 0) ? (
            // Welcome Message when no messages
            <div className="py-10 px-4">
              <div className="max-w-3xl mx-auto flex justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <LightBulbIcon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 dark:text-white text-slate-900">FisherChat</h2>
                  <p className="dark:text-slate-300 text-slate-600 text-lg">{i18nService.t('welcomeMessage')}</p>
                </div>
              </div>
            </div>
          ) : (
            // Conversation Messages
            currentConversation.messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} className="h-20" /> {/* Increased height to ensure better scrolling */}
        </div>
      </div>

      {/* Input Area with Gradient Backdrop */}
      <div ref={inputAreaRef} className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-900 pt-10">
        <div className="max-w-3xl mx-auto px-4 pb-6">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  placeholder={i18nService.t('typeMessage')}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full rounded-xl dark:bg-slate-800 bg-white px-4 py-3 pr-14 dark:text-white text-slate-900 dark:border-slate-700 border-slate-300 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-slate-400 placeholder-slate-500 resize-none max-h-36 overflow-y-auto shadow-md"
                  style={{ minHeight: '56px' }}
                />
                <div className="absolute right-3 bottom-2.5 flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-1.5 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 rounded-full dark:hover:bg-slate-700 hover:bg-slate-200"
                  >
                    <MicrophoneIcon className="h-5 w-5" />
                  </button>
                  {renderInputButton()}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 