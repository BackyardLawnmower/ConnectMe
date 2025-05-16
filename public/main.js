const socket = io();

const chat = document.getElementById('chat');
const form = document.getElementById('inputForm');
const input = document.getElementById('messageInput');

// Extract room ID from URL
const pathParts = window.location.pathname.split('/');
const roomID = pathParts[pathParts.length - 1];

// Assign roles A or B depending on connection order
let userRole = 'A';

// Join the room
socket.emit('join', roomID);

// When a new user joins, second person becomes B
socket.on('new-user', () => {
  if (userRole === 'A') {
    userRole = 'B';
  }
});

// Append message to chat window
function appendMessage(sender, message) {
  const p = document.createElement('p');
  p.textContent = `${sender}: ${message}`;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

// Send message to other user
form.addEventListener('submit', e => {
  e.preventDefault();
  const msg = input.value.trim();
  if (msg.length === 0) return;

  appendMessage(userRole, msg);
  socket.emit('signal', { type: 'chat-message', message: msg });
  input.value = '';
});

socket.on('signal', data => {
  if (data.type === 'chat-message') {
    // Show message from other user
    const otherUser = userRole === 'A' ? 'B' : 'A';
    appendMessage(otherUser, data.message);
  }
});

socket.on('room-full', () => {
  alert('Room is full, cannot join.');
  window.location.href = '/';
});

