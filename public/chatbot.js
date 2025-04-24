class ChatbotUI {
    constructor(config) {
        this.config = config;
        this.initUI();
        this.messages = [];
        this.ws = null;
        this.connectWebSocket();
    }

    connectWebSocket() {
        // Create WebSocket connection
        const wsUrl = this.config.wsEndpoint || `ws://localhost:8000/api/v1/playground/chat`;
        this.ws = new WebSocket(wsUrl);

        // Connection opened
        this.ws.onopen = () => {
            console.log('WebSocket connection established');
            this.addMessage({
                text: "Connected to chatbot! How can I help you?",
                isUser: false,
                timestamp: new Date()
            });
        };

        // Listen for messages
        this.ws.onmessage = (event) => {
            this.addMessage({
                text: event.data,
                isUser: false,
                timestamp: new Date()
            });
        };

        // Handle connection errors
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.addMessage({
                text: "Connection error. Please try again later.",
                isUser: false,
                timestamp: new Date()
            });
        };

        // Handle connection close
        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.addMessage({
                text: "Connection closed. Reconnecting...",
                isUser: false,
                timestamp: new Date()
            });
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    initUI() {
        // Create chat container
        this.container = document.createElement('div');
        this.container.id = 'chatbot-container';
        this.container.className = 'h-full flex flex-col';
        
        // Create card structure
        const card = document.createElement('div');
        card.className = 'flex-1 flex flex-col';
        
        // Card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'p-4 border-b';
        cardHeader.innerHTML = `
            <h1 class="text-xl font-semibold">Chatbot</h1>
        `;
        
        // Card content
        const cardContent = document.createElement('div');
        cardContent.className = 'flex-1 flex flex-col p-0';
        
        // Message area
        this.messageArea = document.createElement('div');
        this.messageArea.className = 'flex-1 p-4 min-h-[300px] max-h-[400px] overflow-y-auto';
        
        // Input form
        const form = document.createElement('form');
        form.className = 'p-4 border-t';
        form.onsubmit = this.handleSubmit.bind(this);
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'flex gap-2';
        
        this.input = document.createElement('input');
        this.input.className = 'flex-1 p-2 border rounded';
        this.input.placeholder = 'Type your message...';
        
        const submitButton = document.createElement('button');
        submitButton.className = 'p-2 bg-blue-500 text-white rounded';
        submitButton.innerHTML = 'Send';
        
        // Assemble components
        inputContainer.appendChild(this.input);
        inputContainer.appendChild(submitButton);
        form.appendChild(inputContainer);
        cardContent.appendChild(this.messageArea);
        cardContent.appendChild(form);
        card.appendChild(cardHeader);
        card.appendChild(cardContent);
        this.container.appendChild(card);
        
        // Position container
        this.container.style.position = 'fixed';
        this.container.style.bottom = '20px';
        this.container.style.right = '20px';
        this.container.style.width = '350px';
        this.container.style.height = '500px';
        this.container.style.backgroundColor = 'white';
        this.container.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        this.container.style.borderRadius = '8px';
        this.container.style.zIndex = '1000';
        
        document.body.appendChild(this.container);
    }

    handleSubmit(e) {
        e.preventDefault();
        const message = this.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage({
            text: message,
            isUser: true,
            timestamp: new Date()
        });
        
        // Clear input
        this.input.value = '';
        
        // Send message through WebSocket
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            this.addMessage({
                text: "Not connected. Please wait...",
                isUser: false,
                timestamp: new Date()
            });
        }
    }

    addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`;
        
        const bubble = document.createElement('div');
        bubble.className = `max-w-[80%] rounded-lg p-3 ${
            message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-100'
        }`;
        
        const text = document.createElement('p');
        text.className = 'text-sm';
        text.textContent = message.text;
        
        const timestamp = document.createElement('p');
        timestamp.className = 'text-xs mt-1 opacity-80';
        timestamp.textContent = message.timestamp.toLocaleTimeString();
        
        bubble.appendChild(text);
        bubble.appendChild(timestamp);
        messageElement.appendChild(bubble);
        this.messageArea.appendChild(messageElement);
        
        // Scroll to bottom
        this.messageArea.scrollTop = this.messageArea.scrollHeight;
    }
}

window.initChatbot = function() {
    const script = document.querySelector('script[workspaceId-attr]');
    console.log("workspaceId-attr", script.getAttribute('workspaceId-attr'));
    console.log("userId-attr", script.getAttribute('userId-attr'));

    const config = {
        workspaceId: script.getAttribute('workspaceId-attr'),
        wsEndpoint: `ws://localhost:8000/api/v1/playground/chat`,
        userId: script.getAttribute('userId-attr'),
        theme: "light",
        position: "bottom-right",
        launcher: true
    }
    
    window.chatbotInstance = new ChatbotUI(config);
};

document.addEventListener('DOMContentLoaded', function() {
    window.initChatbot();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(window.initChatbot, 1);
}
