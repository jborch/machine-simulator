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

function isStationFree(movers: Mover[], station: Station | null): boolean {
  return !movers.some(m => m.station === station);
}

export function tickState(state: MachineState): MachineState {
  let movers = state.movers.map(m => ({ ...m, pen: m.pen ? { ...m.pen } : null }));
  let nest = { ...state.nest };
  let penIdCounter = state.penIdCounter;
  let stats = { ...state.stats };

  // Process in reverse station order to avoid double-moves

  // 1. Packing
  for (const mover of movers) {
    if (mover.station !== 'packing') continue;
    if (mover.pen && mover.pen.capped && !mover.pen.rejected) {
      mover.pen.packed = true;
      stats.produced++;
      mover.pen = null;
      mover.station = null;
    }
  }

  // 2. Reject
  for (const mover of movers) {
    if (mover.station !== 'reject') continue;
    if (mover.pen && mover.pen.rejected) {
      stats.rejected++;
      mover.pen = null;
      mover.station = null;
    } else if (mover.pen && !mover.pen.rejected) {
      if (isStationFree(movers, 'packing')) {
        mover.station = 'packing';
      }
    }
  }

  // 3. Capping
  for (const mover of movers) {
    if (mover.station !== 'capping') continue;
    if (mover.pen && !mover.pen.capped) {
      mover.pen.capped = true;
      if (Math.random() < 0.1) {
        mover.pen.rejected = true;
      }
      if (isStationFree(movers, 'reject')) {
        mover.station = 'reject';
      }
    }
  }

  // 4. De-nesting
  for (const mover of movers) {
    if (mover.station !== 'de-nesting') continue;
    if (!mover.pen && nest.pensRemaining > 0) {
      penIdCounter++;
      mover.pen = { id: penIdCounter, capped: false, rejected: false, packed: false };
      nest.pensRemaining--;
      if (isStationFree(movers, 'capping')) {
        mover.station = 'capping';
      }
    } else if (!mover.pen && nest.pensRemaining === 0) {
      nest.pensRemaining = 8;
      nest.totalNestsUsed++;
    }
  }

  // 5. Transit — first mover in transit moves to de-nesting if free
  if (isStationFree(movers, 'de-nesting')) {
    const transitMover = movers.find(m => m.station === null);
    if (transitMover) {
      transitMover.station = 'de-nesting';
    }
  }

  return { movers, nest, penIdCounter, stats };
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
