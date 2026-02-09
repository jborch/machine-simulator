import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-mover',
  standalone: true,
  templateUrl: './mover.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoverComponent {
  moverNumber = input(1);
}
