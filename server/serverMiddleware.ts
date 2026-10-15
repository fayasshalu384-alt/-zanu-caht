import type { IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { ViteDevServer } from 'vite';
import { generateStudioImage } from './aiImageService';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
}

const clients = new Set<ClientConnection>();

export function setupChatWaveBackend(server: ViteDevServer) {
  // 1. API middleware for handling POST /api/generate-image and other routes
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url === '/api/generate-image' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const { prompt, aspectRatio, imageSize, modelPreference } = JSON.parse(body || '{}');
          if (!prompt || typeof prompt !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Prompt is required' }));
            return;
          }

          const imageUrl = await generateStudioImage(
            prompt,
            aspectRatio || '1:1',
            imageSize || '1K',
            modelPreference || 'gemini-3-pro-image-preview'
          );

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, imageUrl }));
        } catch (err: unknown) {
          const error = err as Error;
          console.error('API /api/generate-image error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: error.message || 'Image generation failed',
            fallbackPrompt: true
          }));
        }
      });
      return;
    }

    if (req.url === '/api/health' && req.method === 'GET') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'healthy', app: 'ChatWave', timestamp: Date.now() }));
      return;
    }

    next();
  });

  // 2. Attach WebSocket server to httpServer if available
  if (server.httpServer) {
    const wss = new WebSocketServer({ noServer: true });

    server.httpServer.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
      if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    });

    wss.on('connection', (ws: WebSocket) => {
      const client: ClientConnection = { ws };
      clients.add(client);

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          
          if (msg.type === 'register_user') {
            client.userId = msg.userId;
            // Broadcast user presence
            broadcastExcept(client, {
              type: 'presence_change',
              userId: msg.userId,
              online: true,
              lastSeen: Date.now(),
            });
            return;
          }

          // Relay call signaling or chat message to matching user or broadcast
          if (msg.targetUserId) {
            // Unicast to target user
            for (const c of clients) {
              if (c.userId === msg.targetUserId && c.ws.readyState === WebSocket.OPEN) {
                c.ws.send(JSON.stringify(msg));
              }
            }
          } else {
            // Broadcast to other connected clients
            broadcastExcept(client, msg);
          }
        } catch (e) {
          console.error('WS message parse error:', e);
        }
      });

      ws.on('close', () => {
        clients.delete(client);
        if (client.userId) {
          broadcastExcept(client, {
            type: 'presence_change',
            userId: client.userId,
            online: false,
            lastSeen: Date.now(),
          });
        }
      });
    });
  }
}

function broadcastExcept(sender: ClientConnection, data: unknown) {
  const payload = JSON.stringify(data);
  for (const c of clients) {
    if (c !== sender && c.ws.readyState === WebSocket.OPEN) {
      c.ws.send(payload);
    }
  }
}
