// Simple Node.js server to handle message storage
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from current directory
app.use(express.static('./'));

// Path to messages JSON file
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Helper function to read messages from file
const readMessages = async () => {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
};

// Helper function to write messages to file
const writeMessages = async (messages) => {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
};

// Sanitize input data to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Endpoint to get all messages
app.get('/api/messages',