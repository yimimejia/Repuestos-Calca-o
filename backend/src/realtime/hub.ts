import { WebSocketServer } from 'ws';

let wss: WebSocketServer | null = null;

export function iniciarHub(server: any) {
  wss = new WebSocketServer({ server, path: '/ws' });
}

export function emitir(evento: string, payload: unknown) {
  if (!wss) return;
  const msg = JSON.stringify({ evento, payload, fecha: new Date().toISOString() });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}
