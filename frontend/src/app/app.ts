import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StateService } from './state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  private stateService = inject(StateService);
  connected = this.stateService.connected;
}
