import { Component, input } from '@angular/core';
import { MoverState } from '../state.service';

@Component({
  selector: 'app-conveyor',
  template: `
    <div class="flex items-center gap-0.5 rounded bg-gray-200 p-1 min-h-5"
         [class.flex-col]="orientation() === 'vertical'"
         [class.flex-row-reverse]="orientation() === 'horizontal' && direction() === 'reverse'"
         [class.flex-col-reverse]="orientation() === 'vertical' && direction() === 'reverse'">
      @for (mover of movers(); track mover.index) {
        <div class="size-2.5 shrink-0 rounded-full"
             [class.bg-gray-400]="!mover.hasItem"
             [class.bg-blue-600]="mover.hasItem"
             [title]="mover.id + (mover.itemName ? ' (' + mover.itemName + ')' : '')">
        </div>
      }
    </div>
  `,
})
export class ConveyorComponent {
  slots = input.required<(MoverState | null)[]>();
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  direction = input<'forward' | 'reverse'>('forward');

  movers = () => {
    return this.slots()
      .map((slot, index) => ({ slot, index }))
      .filter((entry) => entry.slot !== null)
      .map((entry) => ({
        index: entry.index,
        id: entry.slot!.id,
        hasItem: entry.slot!.itemId !== null,
        itemName: entry.slot!.itemName,
      }));
  };
}
