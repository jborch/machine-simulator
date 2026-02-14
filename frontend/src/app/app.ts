import { Component, computed, inject } from '@angular/core';
import { StateService } from './state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private stateService = inject(StateService);

  state = this.stateService.state;
  connected = this.stateService.connected;
  isRunning = computed(() => this.state()?.isRunning ?? false);
  stateJson = computed(() => JSON.stringify(this.state(), null, 2));

  onRun(): void {
    this.stateService.sendCommand('start');
  }

  onStop(): void {
    this.stateService.sendCommand('stop');
  }
}
