import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CapComponent } from './cap/cap.component';
import { OverlapGraphComponent } from './overlap-graph/overlap-graph.component';
import { PenComponent } from './pen/pen.component';

const PEN_PATH = `
  M 40 0 L 440 0 A 10 10 0 0 1 450 10
  L 450 95 A 5 5 0 0 1 445 100 L 435 100 A 5 5 0 0 0 430 105
  L 430 135 A 5 5 0 0 0 435 140 L 445 140 A 5 5 0 0 1 450 145
  L 450 225 A 5 5 0 0 1 445 230 L 415 230 A 5 5 0 0 0 410 235
  L 410 295 A 5 5 0 0 0 415 300 L 445 300 A 5 5 0 0 1 450 305
  L 450 1760 A 40 40 0 0 1 410 1800 L 40 1800 A 40 40 0 0 1 0 1760
  L 0 305 A 5 5 0 0 1 5 300 L 35 300 A 5 5 0 0 0 40 295
  L 40 235 A 5 5 0 0 0 35 230 L 5 230 A 5 5 0 0 1 0 225 L 0 145
  A 5 5 0 0 1 5 140 L 15 140 A 5 5 0 0 0 20 135
  L 20 105 A 5 5 0 0 0 15 100 L 5 100 A 5 5 0 0 1 0 95
  L 0 10 A 10 10 0 0 1 10 0 Z
`;

const CAP_PATH = `
  M 40 0 L 470 0 A 40 40 0 0 1 510 40
  L 510 315 A 5 5 0 0 1 505 320 L 485 320 A 40 40 0 0 1 445 280
  L 445 267 A 5 5 0 0 1 450 262 L 485 262 A 5 5 0 0 0 490 257
  L 490 165 A 5 5 0 0 0 485 160 A 20 20 0 0 1 465 140
  L 465 137 A 5 5 0 0 1 470 132 L 485 132 A 5 5 0 0 0 490 127
  L 490 35 A 10 10 0 0 0 480 25 L 30 25 A 10 10 0 0 0 20 35
  L 20 127 A 5 5 0 0 0 25 132 L 40 132 A 5 5 0 0 1 45 137
  L 45 140 A 20 20 0 0 1 25 160 A 5 5 0 0 0 20 165
  L 20 257 A 5 5 0 0 0 25 262 L 60 262 A 5 5 0 0 1 65 267
  L 65 280 A 40 40 0 0 1 25 320 L 5 320 A 5 5 0 0 1 0 315
  L 0 40 A 40 40 0 0 1 40 0 Z
`;

const PEN_X = 30;
const PEN_Y = 520;
const CANVAS_W = 510;
const CANVAS_H = PEN_Y + 1800;

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CapComponent, OverlapGraphComponent, PenComponent],
  templateUrl: './simulator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent {
  readonly CAP_OPACITY = 0.8;
  readonly ANIMATION_DURATION_MS = 700;
  readonly SNAP_TRANSLATE_Y = 490;
  readonly FRAME_MS = 16;

  capPercent = signal(0);
  capTranslateY = signal(0);
  penTilt = signal(0);
  snapped = signal(false);
  overlapPixelCount = signal(0);
  overlapHistory = signal<number[]>([]);

  private penCanvas: OffscreenCanvas;
  private capCanvas: OffscreenCanvas;
  private penPath: Path2D;
  private capPath: Path2D;

  constructor() {
    this.penPath = new Path2D(PEN_PATH);
    this.capPath = new Path2D(CAP_PATH);

    this.penCanvas = new OffscreenCanvas(CANVAS_W, CANVAS_H);
    this.capCanvas = new OffscreenCanvas(CANVAS_W, CANVAS_H);

    this.renderPenCanvas();
  }

  onSliderInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.capPercent.set(value);
    this.capTranslateY.set((value / 100) * this.SNAP_TRANSLATE_Y);
    this.snapped.set(value === 100);
    this.calculateOverlap();
  }

  onTiltInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.penTilt.set(value);
    this.renderPenCanvas();
    this.calculateOverlap();
  }

  private renderPenCanvas() {
    const ctx = this.penCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.save();
    // Rotate around pen center
    const cx = PEN_X + 225;
    const cy = PEN_Y + 900;
    ctx.translate(cx, cy);
    ctx.rotate((this.penTilt() * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    ctx.translate(PEN_X, PEN_Y);
    ctx.fill(this.penPath);
    ctx.restore();
  }

  toggle() {
    const isSnapped = this.snapped();
    const from = isSnapped ? this.SNAP_TRANSLATE_Y : 0;
    const to = isSnapped ? 0 : this.SNAP_TRANSLATE_Y;
    const totalFrames = Math.ceil(this.ANIMATION_DURATION_MS / this.FRAME_MS);
    let frame = 0;

    this.overlapHistory.set([]);

    const step = () => {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const y = from + (to - from) * progress;
      this.capTranslateY.set(y);
      this.capPercent.set(Math.round((y / this.SNAP_TRANSLATE_Y) * 100));
      this.calculateOverlap();

      if (!isSnapped) {
        this.overlapHistory.update((h) => [...h, this.overlapPixelCount()]);
      }

      if (progress < 1) {
        setTimeout(step, this.FRAME_MS);
      }
    };

    setTimeout(step, this.FRAME_MS);
    this.snapped.update((v) => !v);
  }

  private calculateOverlap() {
    const capY = this.capTranslateY();

    // Determine the vertical overlap region
    const capTop = capY;
    const capBottom = capY + 320;
    const penTop = PEN_Y;
    const penBottom = PEN_Y + 1800;

    const overlapTop = Math.max(capTop, penTop);
    const overlapBottom = Math.min(capBottom, penBottom);

    if (overlapTop >= overlapBottom) {
      this.overlapPixelCount.set(0);
      return;
    }

    const regionH = Math.ceil(overlapBottom - overlapTop);

    // Draw cap in the overlap region only
    const capCtx = this.capCanvas.getContext('2d')!;
    capCtx.clearRect(0, 0, CANVAS_W, regionH);
    capCtx.save();
    capCtx.translate(0, -overlapTop);
    capCtx.translate(0, capY);
    capCtx.fill(this.capPath);
    capCtx.restore();

    const capData = capCtx.getImageData(0, 0, CANVAS_W, regionH).data;

    // Get pen pixels for the same region
    const penData = this.penCanvas
      .getContext('2d')!
      .getImageData(0, Math.floor(overlapTop), CANVAS_W, regionH).data;

    let count = 0;
    for (let i = 3; i < penData.length; i += 4) {
      if (penData[i] > 0 && capData[i] > 0) {
        count++;
      }
    }

    this.overlapPixelCount.set(count);
  }
}
