import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { StateService, ProcessingDetails } from '../state.service';
import { SceneComponent, SceneState } from '../simulator/scene/scene.component';

@Component({
  selector: 'app-capping-view',
  standalone: true,
  imports: [SceneComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-1">
      <span class="text-xs font-semibold text-gray-600">Capping Scene</span>
      @if (sceneState(); as s) {
        <app-scene [state]="s" />
      } @else {
        <span class="text-xs text-gray-400">Idle</span>
      }
    </div>
  `,
})
export class CappingViewComponent {
  private stateService = inject(StateService);

  private cappingDetails = computed(() => {
    const machine = this.stateService.state().machines.find(m => m.name === 'Capping');
    return machine?.details as ProcessingDetails | undefined;
  });

  sceneState = computed<SceneState | null>(() => {
    const details = this.cappingDetails();
    if (!details) return null;

    const moverNumber = this.parseMoverNumber(details.mover?.id);
    const progress = details.totalTicks > 0
      ? (details.totalTicks - details.ticksRemaining) / details.totalTicks
      : 0;

    let capTranslateY: number;
    let capAttached: boolean;

    if (details.state === 'Done') {
      capTranslateY = 490;
      capAttached = true;
    } else if (details.state !== 'Idle') {
      // Processing — state is a progress string like "50/105"
      capTranslateY = progress * 490;
      capAttached = false;
    } else {
      capTranslateY = 0;
      capAttached = false;
    }

    return {
      penOffsetX: 0,
      penOffsetY: 0,
      penTilt: 0,
      moverTilt: 0,
      moverNumber,
      capTranslateY,
      capOffsetX: 0,
      capOffsetY: 0,
      capAttached,
      showMover: details.mover != null,
    };
  });

  private parseMoverNumber(id: string | undefined | null): number {
    if (!id) return 1;
    const match = id.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 1;
  }
}
