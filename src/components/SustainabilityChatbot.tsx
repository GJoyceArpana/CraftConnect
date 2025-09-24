import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Lightbulb, Leaf, TrendingUp, Recycle, Minimize } from 'lucide-react';
import { apiService } from '../services/api';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface SustainabilityChatbotProps {
  productData?: any;
  currentImpact?: any;
  onSuggestionApply?: (suggestion: any) => void;
  onClose?: () => void;
  minimized?: boolean;
  onMinimize?: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: string;
  description: string;
}

export const SustainabilityChatbot: React.FC<SustainabilityChatbotProps> = ({
  productData,
  currentImpact,
  onSuggestionApply,
  onClose,
  minimized = false,
  onMinimize
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: `👋 Hi! I'm your sustainability assistant. I can help you:
      
🔍 Analyze your product's carbon footprint
📈 Suggest improvements to boost your sustainability score  
💡 Recommend parameter changes for better environmental impact
🌿 Share eco-friendly crafting tips

What would you like to explore today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(!minimized);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  const quickActions: QuickAction[] = [
    {
      id: 'analyze',
      label: 'Analyze My Product',
      icon: <TrendingUp className="h-4 w-4" />,
      action: 'analyze_product',
      description: 'Get detailed sustainability analysis'
    },
    {
      id: 'improve',
      label: 'How to Improve',
      icon: <Lightbulb className="h-4 w-4" />,
      action: 'improvement_suggestions',
      description: 'Get specific improvement recommendations'
    },
    {
      id: 'materials',
      label: 'Material Tips',
      icon: <Recycle className="h-4 w-4" />,
      action: 'material_suggestions',
      description: 'Learn about eco-friendly materials'
    },
    {
      id: 'carbon',
      label: 'Reduce CO2',
      icon: <Leaf className="h-4 w-4" />,
      action: 'carbon_reduction',
      description: 'Ways to lower carbon footprint'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test backend connectivity on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/');
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        console.warn('Backend connection test failed:', error);
        setConnectionStatus('disconnected');
      }
    };

    testConnection();
  }, []);

  const sendMessage = async (message: string, isQuickAction = false) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let apiResponse: any;
      
      // Handle quick actions with specific API calls
      if (isQuickAction) {
        switch (message) {
          case 'analyze_product':
            if (productData && currentImpact) {
              apiResponse = await apiService.getAIAnalysis(productData, currentImpact);
            } else {
              // Fallback if no data available
              apiResponse = await apiService.chatWithAI('Please analyze this product for sustainability improvements', {
                product_data: productData,
                current_impact: currentImpact
              });
            }
            break;
          case 'improvement_suggestions':
            if (productData) {
              apiResponse = await apiService.getParameterSuggestions(productData, 'overall');
            } else {
              apiResponse = await apiService.chatWithAI('What are specific ways to improve sustainability for my product?', {
                product_data: productData,
                current_impact: currentImpact
              });
            }
            break;
          case 'material_suggestions':
            const materialMessage = productData?.category 
              ? `What are the best eco-friendly materials for ${productData.category} products?`
              : 'What are the best eco-friendly materials for my product category?';
            apiResponse = await apiService.chatWithAI(materialMessage, {
              product_data: productData,
              current_impact: currentImpact
            });
            break;
          case 'carbon_reduction':
            const carbonMessage = currentImpact?.carbon_footprint
              ? `I currently save ${currentImpact.carbon_footprint}kg CO2. How can I reduce the carbon footprint further?`
              : 'How can I reduce the carbon footprint of my products?';
            apiResponse = await apiService.chatWithAI(carbonMessage, {
              product_data: productData,
              current_impact: currentImpact
            });
            break;
        }
      } else {
        // Regular chat message
        apiResponse = await apiService.chatWithAI(message, {
          product_data: productData,
          current_impact: currentImpact
        });
      }

      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }

      const data = apiResponse.data;
      
      let botContent = '';
      let suggestions: string[] = [];

      if (!data) {
        throw new Error('No data received from AI service');
      }

      // Handle different response types
      if (data.success === false) {
        botContent = data.fallback_response || data.error || 'I apologize, but I encountered an issue. Here are some general tips: use recycled materials, minimize packaging, and choose local suppliers.';
        suggestions = data.fallback_suggestions || [];
      } else if (data.analysis) {
        // AI Analysis response
        botContent = data.analysis;
        suggestions = data.suggestions?.map((s: any) => s.description || s) || [];
      } else if (data.parameter_suggestions) {
        // Parameter suggestions response
        botContent = data.parameter_suggestions;
        suggestions = Object.values(data.fallback_suggestions || {}) as string[];
      } else if (data.response) {
        // Regular chat response
        botContent = data.response;
        suggestions = data.suggestions || [];
      } else {
        botContent = 'I received your message! How else can I help you improve your sustainability?';
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botContent,
        timestamp: new Date(),
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      console.log('Product data being sent:', productData);
      console.log('Current impact being sent:', currentImpact);
      
      // Provide more specific error information in development
      const isDev = process.env.NODE_ENV === 'development';
      const errorDetails = isDev ? `\n\n🔧 **Debug Info:**\n- Error: ${error}\n- Product data available: ${!!productData}\n- Impact data available: ${!!currentImpact}` : '';
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I'm having trouble connecting to the AI service right now, but here are some general sustainability tips:

🌱 **Quick Wins:**
- Use recycled materials when possible
- Minimize packaging weight and size
- Source materials locally (within 200km)
- Choose handmade production methods
- Use renewable energy for power tools

🔄 **What to try:**
- Make sure you've calculated your carbon footprint first
- Check that the backend server is running on port 5000
- Try refreshing the page and calculating impact again

Would you like me to try again, or do you have specific questions about any of these suggestions?${errorDetails}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.action, true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionApply) {
      onSuggestionApply({ suggestion });
    }
    // Also send it as a message for more details
    sendMessage(`Tell me more about: ${suggestion}`);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (onMinimize) {
      onMinimize();
    }
  };

  const formatMessage = (content: string) => {
    // Enhanced markdown-like formatting for sustainability content
    return content
      // Headers
      .replace(/^## (.*$)/gm, '<h3 class="font-bold text-base mt-3 mb-2 text-gray-800">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="font-bold text-lg mt-4 mb-3 text-gray-800">$1</h2>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Italic text  
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // Code/parameter highlighting
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono text-gray-800">$1</code>')
      // Bullet points
      .replace(/^- (.*$)/gm, '<div class="flex items-start gap-2 my-1"><span class="text-green-500 mt-1">•</span><span>$1</span></div>')
      // Numbered lists
      .replace(/^(\d+)\. (.*$)/gm, '<div class="flex items-start gap-2 my-1"><span class="text-blue-500 font-medium min-w-[20px]">$1.</span><span>$2</span></div>')
      // Line breaks
      .replace(/\n\n/g, '<div class="h-3"></div>')
      .replace(/\n/g, '<br />');
  };

  if (minimized && !isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleChat}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="hidden sm:inline text-sm font-medium">Sustainability AI</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 h-[500px] sm:h-[600px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-green-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          <h3 className="font-semibold">Sustainability Assistant</h3>
          {connectionStatus !== 'unknown' && (
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-300' : 'bg-red-300'
            }`} title={`Backend ${connectionStatus}`} />
          )}
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={toggleChat}
              className="p-1 hover:bg-green-700 rounded transition-colors"
            >
              <Minimize className="h-4 w-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-green-700 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-600 mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className="flex items-center gap-2 p-3 bg-white hover:bg-green-50 hover:border-green-300 border border-gray-200 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow"
              title={action.description}
            >
              <div className="text-green-600">{action.icon}</div>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
              }`}
            >
              <div 
                className={`text-sm leading-relaxed ${
                  message.type === 'bot' ? 'prose prose-sm max-w-none' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              
              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-gray-700 mb-2">💡 Try these suggestions:</div>
                  {message.suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left text-sm p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 transition-all duration-200 hover:shadow-sm font-medium"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">➤</span>
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-green-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
            placeholder="Ask about sustainability improvements..."
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(inputMessage)}
            disabled={isLoading || !inputMessage.trim()}
            className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityChatbot;