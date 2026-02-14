import { Component, input } from '@angular/core';
import { MoverState } from '../state.service';

@Component({
  selector: 'app-station',
  template: `
    <div class="flex flex-col items-center rounded-md border-2 border-gray-500 bg-gray-50 p-2 min-w-20">
      <span class="text-xs font-semibold mb-1">{{ name() }}</span>
      <div class="flex size-5 items-center justify-center rounded border border-dashed border-gray-400">
        @if (mover()) {
          <div class="size-3 rounded-full"
               [class.bg-gray-400]="mover()!.itemId === null"
               [class.bg-blue-600]="mover()!.itemId !== null"
               [title]="mover()!.id + (mover()!.itemName ? ' (' + mover()!.itemName + ')' : '')">
          </div>
        }
      </div>
    </div>
  `,
})
export class StationComponent {
  name = input.required<string>();
  mover = input.required<MoverState | null>();
}
