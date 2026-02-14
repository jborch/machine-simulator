import { Component, computed, inject } from '@angular/core';
import {
  StateService,
  MachineState,
  ConveyorDetails,
  StationDetails,
  ProcessingDetails,
  InfeedDetails,
  OutfeedDetails,
  BufferDetails,
} from '../state.service';
import { ConveyorComponent } from './conveyor.component';
import { StationComponent } from './station.component';
import { ProcessingStationComponent } from './processing-station.component';
import { InfoPanelComponent } from './info-panel.component';

@Component({
  selector: 'app-overview',
  imports: [ConveyorComponent, StationComponent, ProcessingStationComponent, InfoPanelComponent],
  templateUrl: './overview.component.html',
})
export class OverviewComponent {
  private stateService = inject(StateService);

  state = this.stateService.state;
  connected = this.stateService.connected;
  isRunning = computed(() => this.state().isRunning);

  private machine = (name: string) =>
    this.state().machines.find((m) => m.name === name);

  nestInfeed = computed(() => this.machine('NestInfeed')?.details as InfeedDetails | undefined);
  cartonOutfeed = computed(() => this.machine('CartonOutfeed')?.details as OutfeedDetails | undefined);

  bufferDeNesting = computed(() => this.machine('Buffer-DeNesting')?.details as ConveyorDetails | undefined);
  deNestingCapping = computed(() => this.machine('DeNesting-Capping')?.details as ConveyorDetails | undefined);
  cappingReject = computed(() => this.machine('Capping-Reject')?.details as ConveyorDetails | undefined);
  rejectPacking = computed(() => this.machine('Reject-Packing')?.details as ConveyorDetails | undefined);
  packingBuffer = computed(() => this.machine('Packing-Buffer')?.details as ConveyorDetails | undefined);

  deNesting = computed(() => this.machine('DeNesting')?.details as ProcessingDetails | undefined);
  packing = computed(() => this.machine('Packing')?.details as ProcessingDetails | undefined);

  capping = computed(() => this.machine('Capping')?.details as StationDetails | undefined);
  reject = computed(() => this.machine('Reject')?.details as StationDetails | undefined);
  buffer = computed(() => this.machine('Buffer')?.details as BufferDetails | undefined);

  onRun(): void {
    this.stateService.sendCommand('start');
  }

  onStop(): void {
    this.stateService.sendCommand('stop');
  }

  onReset(): void {
    this.stateService.sendCommand('reset');
  }
}
