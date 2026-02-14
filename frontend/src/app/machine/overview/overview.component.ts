import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MachineService } from '../machine.service';
import { Mover, Station } from '../machine-state';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './overview.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  readonly machine = inject(MachineService);

  moversAt(station: Station | null): Mover[] {
    return this.machine.movers().filter((m) => m.station === station);
  }

  moverClass(mover: Mover): string {
    const base = 'inline-flex items-center justify-center w-8 h-8 rounded text-sm font-bold';
    if (!mover.pen) return `${base} bg-gray-600 text-gray-300`;
    if (mover.pen.rejected) return `${base} bg-red-600 text-white`;
    if (mover.pen.capped) return `${base} bg-green-600 text-white`;
    return `${base} bg-blue-600 text-white`;
  }
}
