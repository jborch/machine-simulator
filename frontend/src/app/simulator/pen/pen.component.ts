import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pen',
  standalone: true,
  templateUrl: './pen.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PenComponent {}
