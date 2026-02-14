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
  slotCount: number;
  slots: Record<number, MoverState>;
}

export interface StationDetails {
  mover: MoverState | null;
}

export interface ProcessingDetails {
  state: string;
  mover: MoverState | null;
  ticksRemaining: number;
  totalTicks: number;
}

export interface InfeedDetails {
  pensDispensed: number;
}

export interface OutfeedDetails {
  itemsReceived: number;
}

export interface BufferDetails {
  queueLength: number;
}

export interface RejectBinDetails {
  itemsRejected: number;
}

function defaultState(): SimulatorState {
  const conveyor = (): ConveyorDetails => ({ slotCount: 0, slots: {} });
  const processing = (): ProcessingDetails => ({ state: 'Idle', mover: null, ticksRemaining: 0, totalTicks: 0 });

  return {
    isRunning: false,
    machines: [
      { name: 'NestInfeed', details: { pensDispensed: 0 } as InfeedDetails },
      { name: 'Buffer-DeNesting', details: conveyor() },
      { name: 'DeNesting', details: processing() },
      { name: 'DeNesting-Capping', details: conveyor() },
      { name: 'Capping', details: processing() },
      { name: 'Capping-Reject', details: conveyor() },
      { name: 'Reject', details: processing() },
      { name: 'Reject-Packing', details: conveyor() },
      { name: 'Packing', details: processing() },
      { name: 'Packing-Buffer', details: conveyor() },
      { name: 'Buffer', details: { queueLength: 0 } as BufferDetails },
      { name: 'CartonOutfeed', details: { itemsReceived: 0 } as OutfeedDetails },
      { name: 'RejectBin', details: { itemsRejected: 0 } as RejectBinDetails },
    ],
  };
}

@Injectable({ providedIn: 'root' })
export class StateService {
  readonly state = signal<SimulatorState>(defaultState());
  readonly connected = signal(false);

  private ws: WebSocket | null = null;

  constructor(private zone: NgZone) {
    this.connect();
  }

  sendCommand(command: string, value?: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ command, value }));
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
