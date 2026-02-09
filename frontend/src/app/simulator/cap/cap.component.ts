import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cap',
  standalone: true,
  templateUrl: './cap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapComponent {}
