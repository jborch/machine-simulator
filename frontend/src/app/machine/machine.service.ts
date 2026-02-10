import { computed, Injectable, signal } from '@angular/core';
import { createInitialState, MachineState } from './machine-state';

@Injectable({ providedIn: 'root' })
export class MachineService {
  readonly state = signal<MachineState>(createInitialState());

  readonly movers = computed(() => this.state().movers);
  readonly nest = computed(() => this.state().nest);
  readonly stats = computed(() => this.state().stats);
}
