import { Server } from 'ws';
import { NextApiResponse } from 'next';
import { createServer } from 'http';

let wss: Server;

export function initWebSocket(server: ReturnType<typeof createServer>) {
  wss = new Server({ server });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to status WebSocket');
    
    ws.on('error', console.error);
    
    ws.on('close', () => {
      console.log('Client disconnected from status WebSocket');
    });
  });
}

export function broadcastStatus(status: any) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(status));
      }
    });
  }
} 