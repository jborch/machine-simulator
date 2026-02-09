import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-simulator',
  standalone: true,
  templateUrl: './simulator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent { }
