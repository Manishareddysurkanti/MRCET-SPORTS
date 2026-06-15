function toggleChatbot() {
    const chatBox = document.getElementById('chatbot-box');
    chatBox.classList.toggle('d-none');
}

async function submitChatMessage(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('chat-input-text');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage(text, 'user');

    // Show typing bubble
    const typingId = appendMessage('Typing...', 'bot typing');

    try {
        const userId = localStorage.getItem('user_id');
        const response = await API.queryChatbot(text, userId);
        
        // Remove typing
        removeMessage(typingId);
        
        appendMessage(response.reply, 'bot');
    } catch (e) {
        removeMessage(typingId);
        appendMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function sendQuickQuery(text) {
    document.getElementById('chat-input-text').value = text;
    submitChatMessage();
}

function appendMessage(text, sender) {
    const container = document.getElementById('chat-messages-container');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender}`;
    
    // Replace newlines with breaks, keep markdown formatting for strong and bullets
    let formattedText = text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/•\s(.*?)(<br>|$)/g, '<li>$1</li>');
        
    msgDiv.innerHTML = formattedText;
    
    const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    msgDiv.setAttribute('id', msgId);
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
    
    return msgId;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
