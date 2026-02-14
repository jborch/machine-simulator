import { Component, input, computed } from '@angular/core';
import { ProcessingDetails } from '../state.service';

@Component({
  selector: 'app-processing-station',
  template: `
    <div class="flex flex-col items-center rounded-md border-2 border-blue-600 bg-blue-50 p-2 min-w-22">
      <span class="text-xs font-semibold mb-0.5">{{ name() }}</span>
      <span class="text-[10px] text-gray-500 mb-1">{{ details().state }}</span>
      <div class="mb-1 h-1 w-15 overflow-hidden rounded-sm bg-blue-200">
        <div class="h-full rounded-sm bg-blue-600 transition-[width] duration-100"
             [style.width.%]="progressPct()"></div>
      </div>
      <div class="flex size-5 items-center justify-center rounded border border-dashed border-blue-300">
        @if (details().mover; as mover) {
          <div class="size-3 rounded-full"
               [class.bg-gray-400]="mover.itemId === null"
               [class.bg-blue-600]="mover.itemId !== null"
               [title]="mover.id + (mover.itemName ? ' (' + mover.itemName + ')' : '')">
          </div>
        }
      </div>
    </div>
  `,
})
export class ProcessingStationComponent {
  name = input.required<string>();
  details = input.required<ProcessingDetails>();

  progressPct = computed(() => {
    const d = this.details();
    if (d.state === 'Idle') return 0;
    if (d.ticksRemaining <= 0) return 100;
    return ((d.totalTicks - d.ticksRemaining) / d.totalTicks) * 100;
  });
}
