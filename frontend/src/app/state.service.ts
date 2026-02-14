import { Injectable, NgZone, signal } from '@angular/core';

export interface MoverState {
  id: string;
  itemId: string | null;
  itemName: string | null;
}

export interface MachineState {
  name: string;
  details: unknown;
}

export interface SimulatorState {
  isRunning: boolean;
  machines: MachineState[];
}

export interface ConveyorDetails {
  slots: (MoverState | null)[];
}

export interface StationDetails {
  mover: MoverState | null;
}

export interface ProcessingDetails {
  state: string;
  mover: MoverState | null;
  ticksRemaining: number;
}

export interface InfeedDetails {
  pensDispensed: number;
}

export interface OutfeedDetails {
  itemsReceived: number;
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
