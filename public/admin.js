const socket = io();

const logArea = document.getElementById('logArea');

socket.on('chatLog', (data) => {
  let logEntry = '';
  if (data.type === 'message') {
    logEntry = `[${new Date(data.timestamp).toLocaleTimeString()}][${data.room}] ${data.user}: ${data.text || ''}`;
  } else if (data.type === 'join') {
    logEntry = `[${new Date(data.timestamp).toLocaleTimeString()}][${data.room}] ${data.user} が参加しました。`;
  } else if (data.type === 'leave') {
    logEntry = `[${new Date(data.timestamp).toLocaleTimeString()}][${data.room}] ${data.user} が退出しました。`;
  } else {
    logEntry = JSON.stringify(data);
  }

  logArea.text
