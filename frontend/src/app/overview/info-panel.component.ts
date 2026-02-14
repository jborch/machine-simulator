import { Component, input } from '@angular/core';

@Component({
  selector: 'app-info-panel',
  template: `
    <div class="flex flex-col items-center rounded-md border-2 border-green-600 bg-green-50 px-3 py-2 min-w-20">
      <span class="text-xs font-semibold mb-0.5">{{ name() }}</span>
      <span class="text-lg font-bold text-green-700">{{ value() }}</span>
      <span class="text-[9px] text-gray-500">{{ caption() }}</span>
    </div>
  `,
})
export class InfoPanelComponent {
  name = input.required<string>();
  value = input.required<number>();
  caption = input.required<string>();
}
