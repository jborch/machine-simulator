import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CapComponent } from './cap/cap.component';
import { PenComponent } from './pen/pen.component';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CapComponent, PenComponent],
  templateUrl: './simulator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent {}
