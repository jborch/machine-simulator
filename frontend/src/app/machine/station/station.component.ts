import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MachineService } from '../machine.service';
import { Mover, Station } from '../machine-state';

const stationMeta: Record<Station, { label: string; number: number; description: string }> = {
  'de-nesting': {
    label: 'De-nesting',
    number: 1,
    description: 'Picks a pen from the nest and loads it onto the mover.',
  },
  capping: {
    label: 'Capping',
    number: 2,
    description: 'Places a cap onto the pen. ~10% chance the result is rejected.',
  },
  reject: {
    label: 'Reject',
    number: 3,
    description: 'Inspects the pen. Rejected pens are discarded; good pens move to packing.',
  },
  packing: {
    label: 'Packing',
    number: 4,
    description: 'Packs the finished pen and releases the mover back to transit.',
  },
};

@Component({
  selector: 'app-station',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-900 text-white p-8">
      <a routerLink="/" class="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">&larr; Back to Overview</a>

      @if (meta()) {
        <h1 class="text-2xl font-bold mb-2">Station {{ meta()!.number }} &mdash; {{ meta()!.label }}</h1>
        <p class="text-gray-400 mb-8">{{ meta()!.description }}</p>

        <!-- Current mover -->
        <div class="max-w-md">
          <h2 class="text-sm text-gray-400 mb-2">Current Mover</h2>
          @if (mover(); as m) {
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div class="flex items-center gap-3 mb-3">
                <span [class]="moverClass(m)" class="text-lg">{{ m.id }}</span>
                <span class="font-semibold">Mover #{{ m.id }}</span>
              </div>
              @if (m.pen) {
                <div class="mt-2 space-y-1 text-sm">
                  <div>Pen ID: <span class="text-white font-mono">{{ m.pen.id }}</span></div>
                  <div>Capped:
                    <span [class]="m.pen.capped ? 'text-green-400' : 'text-gray-500'">
                      {{ m.pen.capped ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div>Rejected:
                    <span [class]="m.pen.rejected ? 'text-red-400' : 'text-gray-500'">
                      {{ m.pen.rejected ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div>Packed:
                    <span [class]="m.pen.packed ? 'text-green-400' : 'text-gray-500'">
                      {{ m.pen.packed ? 'Yes' : 'No' }}
                    </span>
                  </div>
                </div>
              } @else {
                <div class="text-gray-500 text-sm mt-2">No pen loaded</div>
              }
            </div>
          } @else {
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 text-gray-500">
              Station is empty
            </div>
          }
        </div>

        <!-- Controls -->
        <div class="mt-8 flex gap-3">
          <button
            (click)="machine.tick()"
            [disabled]="machine.running()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded font-semibold text-sm">
            Step
          </button>
          <button
            (click)="machine.start()"
            [disabled]="machine.running()"
            class="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded font-semibold text-sm">
            Start
          </button>
          <button
            (click)="machine.stop()"
            [disabled]="!machine.running()"
            class="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 rounded font-semibold text-sm">
            Stop
          </button>
        </div>
      } @else {
        <h1 class="text-2xl font-bold mb-4">Unknown Station</h1>
        <p class="text-gray-400">Station "{{ stationId() }}" not found.</p>
      }
    </div>
  `,
})
export class StationComponent {
  readonly machine = inject(MachineService);
  private readonly route = inject(ActivatedRoute);

  readonly stationId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly meta = computed(() => {
    const id = this.stationId() as Station;
    return stationMeta[id] ?? null;
  });

  readonly mover = computed<Mover | null>(() => {
    const id = this.stationId() as Station;
    if (!stationMeta[id]) return null;
    return this.machine.movers().find(m => m.station === id) ?? null;
  });

  moverClass(mover: Mover): string {
    const base = 'inline-flex items-center justify-center w-8 h-8 rounded text-sm font-bold';
    if (!mover.pen) return `${base} bg-gray-600 text-gray-300`;
    if (mover.pen.rejected) return `${base} bg-red-600 text-white`;
    if (mover.pen.capped) return `${base} bg-green-600 text-white`;
    return `${base} bg-blue-600 text-white`;
  }
}
