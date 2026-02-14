import { Component, input } from '@angular/core';
import { MoverState } from '../state.service';

@Component({
  selector: 'app-conveyor',
  template: `
    <div
      class="flex items-center gap-0.5 rounded bg-gray-200 p-1"
      [class.flex-col]="orientation() === 'vertical'"
      [class.flex-row-reverse]="orientation() === 'horizontal' && direction() === 'reverse'"
      [class.flex-col-reverse]="orientation() === 'vertical' && direction() === 'reverse'"
    >
      @for (slot of allSlots(); track slot.index) {
        <div
          class="size-0.5 shrink-0 rounded-full"
          [class.size-2]="!!slot.mover"
          [class.bg-gray-300]="!slot.mover"
          [class.bg-gray-400]="slot.mover && !slot.mover.hasItem"
          [class.bg-blue-600]="slot.mover?.hasItem"
          [title]="
            slot.mover
              ? slot.mover.id + (slot.mover.itemName ? ' (' + slot.mover.itemName + ')' : '')
              : ''
          "
        ></div>
      }
    </div>
  `,
})
export class ConveyorComponent {
  slots = input.required<Record<number, MoverState>>();
  slotCount = input(100);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  direction = input<'forward' | 'reverse'>('forward');

  allSlots = () => {
    const slots = this.slots();
    return Array.from({ length: this.slotCount() }, (_, i) => {
      const mover = slots[i];
      return {
        index: i,
        mover: mover
          ? { id: mover.id, hasItem: mover.itemId !== null, itemName: mover.itemName }
          : null,
      };
    });
  };
}
