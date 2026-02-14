import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { OverlapGraphComponent } from './overlap-graph/overlap-graph.component';
import {
  SceneComponent,
  SceneState,
  CANVAS_W,
  CANVAS_H,
} from './scene/scene.component';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [OverlapGraphComponent, SceneComponent],
  templateUrl: './simulator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent {
  readonly CANVAS_W = CANVAS_W;
  readonly CANVAS_H = CANVAS_H;
  readonly FRAME_MS = 16;

  readonly SNAP_TRANSLATE_Y = 490;
  readonly SNAP_DURATION_MS = 700;

  readonly CAP_POSITION_MIN = 0;
  readonly CAP_POSITION_MAX = 100;
  readonly TILT_MIN = -3;
  readonly TILT_MAX = 3;
  readonly TILT_STEP = 0.01;
  readonly OFFSET_MIN = -10;
  readonly OFFSET_MAX = 10;
  readonly MOVER_TILT_MIN = -3;
  readonly MOVER_TILT_MAX = 3;
  readonly MOVER_TILT_STEP = 0.01;
  readonly MOVER_NUMBER_MIN = 1;
  readonly MOVER_NUMBER_MAX = 12;

  capPercent = signal(0);
  capTranslateY = signal(0);
  moverTilt = signal(0);
  moverNumber = signal(1);
  penTilt = signal(0);
  penOffsetX = signal(0);
  penOffsetY = signal(0);
  capOffsetX = signal(0);
  capOffsetY = signal(0);
  capAttached = signal(false);
  animating = signal(false);
  snapped = signal(false);
  overlapHistory = signal<number[]>([]);

  scene = viewChild.required(SceneComponent);

  sceneState = computed<SceneState>(() => ({
    penOffsetX: this.penOffsetX(),
    penOffsetY: this.penOffsetY(),
    penTilt: this.penTilt(),
    moverTilt: this.moverTilt(),
    moverNumber: this.moverNumber(),
    capTranslateY: this.capTranslateY(),
    capOffsetX: this.capOffsetX(),
    capOffsetY: this.capOffsetY(),
    capAttached: this.capAttached(),
  }));

  onSliderInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.capPercent.set(value);
    this.capTranslateY.set((value / 100) * this.SNAP_TRANSLATE_Y);
    const isSnapped = value === 100;
    this.snapped.set(isSnapped);
    this.capAttached.set(isSnapped);
  }

  onTiltInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.penTilt.set(value);
  }

  onPenOffsetInput(axis: 'x' | 'y', event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    if (axis === 'x') this.penOffsetX.set(value);
    else this.penOffsetY.set(value);
  }

  onMoverTiltInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.moverTilt.set(value);
  }

  onMoverNumberInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.moverNumber.set(value);
  }

  onCapOffsetInput(axis: 'x' | 'y', event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    if (axis === 'x') this.capOffsetX.set(value);
    else this.capOffsetY.set(value);
  }

  async toggle() {
    if (this.animating()) return;

    if (this.snapped()) {
      this.capTranslateY.set(0);
      this.capPercent.set(0);
      this.capAttached.set(false);
      this.snapped.set(false);
      this.overlapHistory.set([]);
      return;
    }

    this.animating.set(true);
    this.overlapHistory.set([]);

    // Snap cap down
    await this.animateValue(
      (v) => {
        this.capTranslateY.set(v);
        this.capPercent.set(Math.round((v / this.SNAP_TRANSLATE_Y) * 100));
      },
      0,
      this.SNAP_TRANSLATE_Y,
      this.SNAP_DURATION_MS,
      true,
    );

    this.capAttached.set(true);
    this.snapped.set(true);
    this.animating.set(false);
  }

  downloadPng() {
    const canvas = new OffscreenCanvas(CANVAS_W, CANVAS_H);
    this.scene().drawToContext(canvas.getContext('2d')!);
    canvas.convertToBlob({ type: 'image/png' }).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simulator.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  private animateValue(
    setter: (v: number) => void,
    from: number,
    to: number,
    durationMs: number,
    trackOverlap = false,
  ): Promise<void> {
    return new Promise((resolve) => {
      const totalFrames = Math.ceil(durationMs / this.FRAME_MS);
      let frame = 0;

      const step = () => {
        frame++;
        const progress = Math.min(frame / totalFrames, 1);
        setter(from + (to - from) * progress);
        this.scene().redraw();

        if (trackOverlap) {
          this.overlapHistory.update((h) => [
            ...h,
            this.scene().overlapPixelCount(),
          ]);
        }

        if (progress < 1) {
          setTimeout(step, this.FRAME_MS);
        } else {
          resolve();
        }
      };

      setTimeout(step, this.FRAME_MS);
    });
  }
}
