// Healthcare Platform AI Chatbot
// Handles the floating chatbot widget and communication with the backend API

class HealthcareChatbot {
    constructor() {
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.apiEndpoint = '/api/chatbot';
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadWelcomeMessage();
    }
    
    initializeElements() {
        this.chatbotContainer = document.getElementById('chatbot-container');
        this.chatbotToggle = document.getElementById('chatbot-toggle');
        this.chatbotWindow = document.getElementById('chatbot-window');
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input');
        this.chatbotSend = document.getElementById('chatbot-send');
        this.chatbotClose = document.getElementById('chatbot-close');
        
        if (!this.chatbotContainer) {
            console.error('Chatbot container not found');
            return;
        }
        
        // Set initial state
        this.chatbotWindow.style.display = 'none';
    }
    
    attachEventListeners() {
        // Toggle chatbot window
        this.chatbotToggle?.addEventListener('click', () => this.toggleChatbot());
        this.chatbotClose?.addEventListener('click', () => this.closeChatbot());
        
        // Send message events
        this.chatbotSend?.addEventListener('click', () => this.sendMessage());
        this.chatbotInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize input
        this.chatbotInput?.addEventListener('input', () => this.autoResizeInput());
        
        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.chatbotContainer.contains(e.target)) {
                this.closeChatbot();
            }
        });
        
        // Prevent closing when clicking inside chatbot
        this.chatbotWindow?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    loadWelcomeMessage() {
        const welcomeMessage = {
            text: "Hello! I'm your healthcare assistant. I can help you with:\n\n• Finding medicines for your symptoms\n• General health information\n• Emergency contacts\n• Product recommendations\n\nHow can I assist you today?",
            isBot: true,
            timestamp: new Date()
        };
        
        this.addMessage(welcomeMessage);
    }
    
    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }
    
    openChatbot() {
        this.isOpen = true;
        this.chatbotWindow.style.display = 'block';
        this.chatbotWindow.classList.add('show');
        this.chatbotToggle.style.display = 'none';
        
        // Focus input field
        setTimeout(() => {
            this.chatbotInput?.focus();
        }, 300);
        
        // Update toggle icon
        this.updateToggleIcon();
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    closeChatbot() {
        this.isOpen = false;
        this.chatbotWindow.style.display = 'none';
        this.chatbotWindow.classList.remove('show');
        this.chatbotToggle.style.display = 'flex';
        
        // Update toggle icon
        this.updateToggleIcon();
    }
    
    updateToggleIcon() {
        const icon = this.chatbotToggle?.querySelector('i');
        if (icon) {
            icon.className = this.isOpen ? 'fas fa-times' : 'fas fa-comment-medical';
        }
    }
    
    async sendMessage() {
        const message = this.chatbotInput?.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage({
            text: message,
            isBot: false,
            timestamp: new Date()
        });
        
        // Clear input
        this.chatbotInput.value = '';
        this.autoResizeInput();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to backend API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add bot response with typing animation
            this.typeMessage({
                text: data.response || "I apologize, but I'm having trouble understanding that. Please try rephrasing your question or contact our support team.",
                isBot: true,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Chatbot API Error:', error);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Show error message
            this.addMessage({
                text: "I'm sorry, I'm experiencing technical difficulties right now. Please try again in a moment, or contact our support team for immediate assistance.\n\nFor emergencies, call 911 or 1-800-AMBULANCE.",
                isBot: true,
                timestamp: new Date(),
                isError: true
            });
        }
    }
    
    addMessage(messageData) {
        const messageElement = this.createMessageElement(messageData);
        this.chatbotMessages?.appendChild(messageElement);
        this.messages.push(messageData);
        this.scrollToBottom();
    }
    
    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.isBot ? 'bot-message' : 'user-message'}`;
        
        if (messageData.isError) {
            messageDiv.classList.add('error-message');
        }
        
        const time = messageData.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Convert newlines to HTML breaks
        const formattedText = messageData.text.replace(/\n/g, '<br>');
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${messageData.isBot ? '<i class="fas fa-robot me-2 text-primary"></i>' : ''}
                <span class="message-text">${formattedText}</span>
            </div>
            <div class="message-time">
                <small class="text-muted">${time}</small>
            </div>
        `;
        
        // Add message actions for bot messages
        if (messageData.isBot && !messageData.isError) {
            this.addMessageActions(messageDiv, messageData.text);
        }
        
        return messageDiv;
    }
    
    addMessageActions(messageElement, messageText) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions mt-2';
        
        // Add quick action buttons based on message content
        const actions = this.getQuickActions(messageText);
        
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary btn-sm me-2 mb-1';
            button.innerHTML = `<i class="${action.icon} me-1"></i>${action.label}`;
            button.onclick = action.handler;
            actionsDiv.appendChild(button);
        });
        
        if (actions.length > 0) {
            messageElement.appendChild(actionsDiv);
        }
    }
    
    getQuickActions(messageText) {
        const actions = [];
        const lowerText = messageText.toLowerCase();
        
        // Medicine search actions
        if (lowerText.includes('medicine') || lowerText.includes('medication')) {
            actions.push({
                icon: 'fas fa-pills',
                label: 'Browse Medicines',
                handler: () => window.location.href = '/products'
            });
        }
        
        // Emergency actions
        if (lowerText.includes('emergency') || lowerText.includes('911')) {
            actions.push({
                icon: 'fas fa-phone',
                label: 'Call 911',
                handler: () => {
                    if (confirm('This will call emergency services. Continue?')) {
                        window.location.href = 'tel:911';
                    }
                }
            });
        }
        
        // Ambulance actions
        if (lowerText.includes('ambulance')) {
            actions.push({
                icon: 'fas fa-ambulance',
                label: 'Call Ambulance',
                handler: () => {
                    if (confirm('This will call ambulance services. Continue?')) {
                        window.location.href = 'tel:1-800-AMBULANCE';
                    }
                }
            });
        }
        
        // Health information actions
        if (lowerText.includes('symptom') || lowerText.includes('condition')) {
            actions.push({
                icon: 'fas fa-stethoscope',
                label: 'Health Info',
                handler: () => window.location.href = '/ailments'
            });
        }
        
        return actions;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot me-2 text-primary"></i>
                <span class="typing-text">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </span>
            </div>
        `;
        
        this.chatbotMessages?.appendChild(typingDiv);
        this.scrollToBottom();
        
        // Add CSS for typing animation if not exists
        this.addTypingStyles();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = this.chatbotMessages?.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    typeMessage(messageData) {
        const messageElement = this.createMessageElement({
            ...messageData,
            text: '' // Start with empty text
        });
        
        this.chatbotMessages?.appendChild(messageElement);
        this.scrollToBottom();
        
        const messageTextElement = messageElement.querySelector('.message-text');
        const fullText = messageData.text;
        let currentText = '';
        let currentIndex = 0;
        
        const typeInterval = setInterval(() => {
            if (currentIndex < fullText.length) {
                currentText += fullText[currentIndex];
                messageTextElement.innerHTML = currentText.replace(/\n/g, '<br>');
                currentIndex++;
                this.scrollToBottom();
            } else {
                clearInterval(typeInterval);
                
                // Add message actions after typing is complete
                if (messageData.isBot && !messageData.isError) {
                    this.addMessageActions(messageElement, fullText);
                }
                
                this.messages.push(messageData);
            }
        }, 30); // Typing speed
        
        // Store interval for cleanup
        window.chatbotTypingInterval = typeInterval;
    }
    
    addTypingStyles() {
        if (document.querySelector('.typing-styles')) return;
        
        const style = document.createElement('style');
        style.className = 'typing-styles';
        style.textContent = `
            .typing-indicator .typing-text {
                display: inline-block;
            }
            
            .typing-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #6c757d;
                margin: 0 1px;
                animation: typingPulse 1.4s infinite ease-in-out;
            }
            
            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }
            .typing-dot:nth-child(3) { animation-delay: 0s; }
            
            @keyframes typingPulse {
                0%, 80%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            .error-message {
                border-left: 4px solid var(--bs-danger);
                background-color: rgba(220, 53, 69, 0.1);
            }
            
            .message-actions .btn {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
            }
            
            .message-time {
                text-align: right;
                margin-top: 0.25rem;
            }
            
            .user-message .message-time {
                text-align: left;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    autoResizeInput() {
        if (!this.chatbotInput) return;
        
        this.chatbotInput.style.height = 'auto';
        this.chatbotInput.style.height = Math.min(this.chatbotInput.scrollHeight, 100) + 'px';
    }
    
    scrollToBottom() {
        if (this.chatbotMessages) {
            setTimeout(() => {
                this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
            }, 100);
        }
    }
    
    // Public methods for external use
    sendQuickMessage(message) {
        if (this.chatbotInput) {
            this.chatbotInput.value = message;
            this.sendMessage();
        }
    }
    
    openWithMessage(message) {
        this.openChatbot();
        setTimeout(() => {
            this.sendQuickMessage(message);
        }, 500);
    }
    
    clearMessages() {
        this.messages = [];
        if (this.chatbotMessages) {
            this.chatbotMessages.innerHTML = '';
        }
        this.loadWelcomeMessage();
    }
    
    // Get chat history
    getChatHistory() {
        return this.messages.map(msg => ({
            text: msg.text,
            isBot: msg.isBot,
            timestamp: msg.timestamp
        }));
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global chatbot instance
    window.healthcareChatbot = new HealthcareChatbot();
});

// Quick access functions for global use
window.ChatbotAPI = {
    open: () => window.healthcareChatbot?.openChatbot(),
    close: () => window.healthcareChatbot?.closeChatbot(),
    sendMessage: (message) => window.healthcareChatbot?.sendQuickMessage(message),
    openWithMessage: (message) => window.healthcareChatbot?.openWithMessage(message),
    clear: () => window.healthcareChatbot?.clearMessages()
};

// Predefined quick messages for common healthcare queries
window.ChatbotQuickMessages = {
    emergency: "I need emergency help",
    headache: "I have a headache, what can I take?",
    fever: "I have a fever, what should I do?",
    cough: "I have a persistent cough",
    allergies: "I'm having allergy symptoms",
    stomach: "I have stomach pain",
    insomnia: "I can't sleep",
    firstAid: "I need first aid information"
};

// Integration with search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add chatbot integration to search results
    const searchForm = document.querySelector('form[action*="search"]');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const query = this.querySelector('input[name="q"]')?.value;
            if (query) {
                // Store search query for chatbot context
                sessionStorage.setItem('lastSearch', query);
            }
        });
    }
    
    // Add quick chatbot access buttons to error pages
    const noResultsSection = document.querySelector('.text-center.py-5');
    if (noResultsSection && noResultsSection.textContent.includes('No results found')) {
        const chatButton = document.createElement('button');
        chatButton.className = 'btn btn-outline-primary mt-3';
        chatButton.innerHTML = '<i class="fas fa-comment-medical me-2"></i>Ask Our Health Assistant';
        chatButton.onclick = () => {
            const lastSearch = sessionStorage.getItem('lastSearch');
            const message = lastSearch ? 
                `I searched for "${lastSearch}" but didn't find what I need. Can you help?` :
                "I need help finding health information";
            window.healthcareChatbot?.openWithMessage(message);
        };
        noResultsSection.appendChild(chatButton);
    }
});

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // Alt + C to toggle chatbot
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        window.healthcareChatbot?.toggleChatbot();
    }
    
    // Escape to close chatbot
    if (e.key === 'Escape' && window.healthcareChatbot?.isOpen) {
        window.healthcareChatbot?.closeChatbot();
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, clear typing interval
        if (window.chatbotTypingInterval) {
            clearInterval(window.chatbotTypingInterval);
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HealthcareChatbot };
}
