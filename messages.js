document.addEventListener("DOMContentLoaded", () => {
    // Display messages
    const messagesList = document.getElementById("messages-list");
    const loadingMessage = document.getElementById("loading-message");
    const errorMessage = document.getElementById("error-message");
    
    if (!messagesList || !loadingMessage || !errorMessage) return;
    
    const displayMessages = async () => {
        try {
            // Fetch messages from backend API
            const response = await fetch('/api/messages');
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const messages = await response.json();
            
            displayMessagesList(messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            
            // Fallback to localStorage if API request fails
            try {
                const localMessages = JSON.parse(localStorage.getItem("contactMessages") || "[]");
                displayMessagesList(localMessages);
                
                // Show warning about using local data
                if (localMessages.length > 0) {
                    errorMessage.textContent = "Unable to connect to server. Showing locally saved messages.";
                    errorMessage.style.display = "block";
                    errorMessage.className = "warning-message";
                }
            } catch (localError) {
                console.error("Error loading local messages:", localError);
                loadingMessage.style.display = "none";
                errorMessage.textContent = "Failed to load messages. Please try again later.";
                errorMessage.style.display = "block";
            }
        }
    };
    
    const displayMessagesList = (messages) => {
        loadingMessage.style.display = "none";
        
        if (!messages || messages.length === 0) {
            messagesList.innerHTML = "<li>No messages yet.</li>";
            return;
        }
        
        messagesList.innerHTML = "";
        messages.forEach(message => {
            const messageItem = document.createElement("li");
            messageItem.className = "message-card";
            
            // Format date for display
            let displayDate = "Unknown date";
            try {
                const date = new Date(message.timestamp);
                displayDate = date.toLocaleString();
            } catch (e) {
                console.error("Date parsing error:", e);
            }
            
            messageItem.innerHTML = `
                <h3>From: ${message.name}</h3>
                <div class="message-subject">Subject: ${message.subject}</div>
                <div class="message-date">Date: ${displayDate}</div>
                <div class="message-content">${message.message}</div>
            `;
            
            messagesList.appendChild(messageItem);
        });
    };
    
    // Start loading messages
    displayMessages();
});