import { computed, Injectable, signal } from '@angular/core';
import { createInitialState, MachineState, tickState } from './machine-state';

@Injectable({ providedIn: 'root' })
export class MachineService {
  readonly state = signal<MachineState>(createInitialState());

  readonly movers = computed(() => this.state().movers);
  readonly nest = computed(() => this.state().nest);
  readonly stats = computed(() => this.state().stats);

  readonly running = signal(false);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  tick(): void {
    this.state.update(s => tickState(s));
  }

  start(intervalMs = 500): void {
    if (this.running()) return;
    this.running.set(true);
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.running.set(false);
  }

  reset(): void {
    this.stop();
    this.state.set(createInitialState());
  }
}
