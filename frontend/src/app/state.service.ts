import { Injectable, NgZone, signal } from '@angular/core';

export interface SimulatorState {
  isRunning: boolean;
  stations: unknown[];
}

@Injectable({ providedIn: 'root' })
export class StateService {
  readonly state = signal<SimulatorState | null>(null);
  readonly connected = signal(false);

  private ws: WebSocket | null = null;

  constructor(private zone: NgZone) {
    this.connect();
  }

  sendCommand(command: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ command }));
    }
  }

  private connect(): void {
    this.zone.runOutsideAngular(() => {
      const ws = new WebSocket('ws://localhost:5000/ws');

      ws.onopen = () => {
        this.zone.run(() => this.connected.set(true));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as SimulatorState;
        this.zone.run(() => this.state.set(data));
      };

      ws.onclose = () => {
        this.zone.run(() => this.connected.set(false));
        setTimeout(() => this.connect(), 1000);
      };

      this.ws = ws;
    });
  }
}
