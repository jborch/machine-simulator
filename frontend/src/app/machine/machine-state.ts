export type Station = 'de-nesting' | 'capping' | 'reject' | 'packing';

export interface Pen {
  id: number;
  capped: boolean;
  rejected: boolean;
  packed: boolean;
}

export interface Mover {
  id: number;
  station: Station | null;
  pen: Pen | null;
}

export interface Nest {
  pensRemaining: number;
  totalNestsUsed: number;
}

export interface MachineState {
  movers: Mover[];
  nest: Nest;
  penIdCounter: number;
  stats: { produced: number; rejected: number };
}

export function createInitialState(): MachineState {
  const movers: Mover[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    station: null,
    pen: null,
  }));

  return {
    movers,
    nest: { pensRemaining: 8, totalNestsUsed: 1 },
    penIdCounter: 0,
    stats: { produced: 0, rejected: 0 },
  };
}
