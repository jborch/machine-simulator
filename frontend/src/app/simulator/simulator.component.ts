import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CapComponent } from './cap/cap.component';
import { OverlapGraphComponent } from './overlap-graph/overlap-graph.component';
import { MoverComponent } from './mover/mover.component';
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
const OFFSET_RANGE = 50;
const CANVAS_W = 510 + OFFSET_RANGE * 2;
const CANVAS_H = PEN_Y + 1800 + OFFSET_RANGE * 2;

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CapComponent, MoverComponent, OverlapGraphComponent, PenComponent],
  templateUrl: './simulator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorComponent {
  readonly VISUAL_SCALE = 0.33;
  readonly CAP_OPACITY = 0.8;
  readonly ANIMATION_DURATION_MS = 700;
  readonly SNAP_TRANSLATE_Y = 490;
  readonly FRAME_MS = 16;

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

  onPenOffsetInput(axis: 'x' | 'y', event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    if (axis === 'x') this.penOffsetX.set(value);
    else this.penOffsetY.set(value);
    this.renderPenCanvas();
    this.calculateOverlap();
  }

  onMoverTiltInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.moverTilt.set(value);
    this.renderPenCanvas();
    this.calculateOverlap();
  }

  onMoverNumberInput(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.moverNumber.set(value);
  }

  onCapOffsetInput(axis: 'x' | 'y', event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    if (axis === 'x') this.capOffsetX.set(value);
    else this.capOffsetY.set(value);
    this.calculateOverlap();
  }

  private renderPenCanvas() {
    const ctx = this.penCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.save();
    const px = PEN_X + OFFSET_RANGE + this.penOffsetX();
    const py = PEN_Y + OFFSET_RANGE + this.penOffsetY();
    // Rotate around pen center
    const cx = px + 225;
    const cy = py + 900;
    ctx.translate(cx, cy);
    ctx.rotate(((this.moverTilt() + this.penTilt()) * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    ctx.translate(px, py);
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
    const capAbsY = OFFSET_RANGE + this.capTranslateY() + this.capOffsetY();
    const penAbsY = PEN_Y + OFFSET_RANGE + this.penOffsetY();

    // Vertical overlap region
    const capBottom = capAbsY + 320;
    const penBottom = penAbsY + 1800;
    const overlapTop = Math.max(capAbsY, penAbsY);
    const overlapBottom = Math.min(capBottom, penBottom);

    if (overlapTop >= overlapBottom) {
      this.overlapPixelCount.set(0);
      return;
    }

    const regionY = Math.floor(overlapTop);
    const regionH = Math.ceil(overlapBottom - overlapTop);

    // Draw cap onto its canvas
    const capCtx = this.capCanvas.getContext('2d')!;
    capCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    capCtx.save();
    capCtx.translate(OFFSET_RANGE + this.capOffsetX(), capAbsY);
    capCtx.fill(this.capPath);
    capCtx.restore();

    const capData = capCtx.getImageData(0, regionY, CANVAS_W, regionH).data;
    const penData = this.penCanvas
      .getContext('2d')!
      .getImageData(0, regionY, CANVAS_W, regionH).data;

    let count = 0;
    for (let i = 3; i < penData.length; i += 4) {
      if (penData[i] > 0 && capData[i] > 0) {
        count++;
      }
    }

    this.overlapPixelCount.set(count);
  }

  downloadPng() {
    const canvas = new OffscreenCanvas(CANVAS_W, CANVAS_H);
    const ctx = canvas.getContext('2d')!;

    const px = PEN_X + OFFSET_RANGE + this.penOffsetX();
    const py = PEN_Y + OFFSET_RANGE + this.penOffsetY();
    const cx = px + 225;
    const cy = py + 900;
    const totalTilt = ((this.moverTilt() + this.penTilt()) * Math.PI) / 180;

    // Draw pen
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(totalTilt);
    ctx.translate(-cx, -cy);
    ctx.translate(px, py);
    ctx.fillStyle = 'steelblue';
    ctx.fill(this.penPath);
    ctx.restore();

    // Draw mover (on top of pen)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((this.moverTilt() * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    ctx.translate(px - 45, py + 1200);
    ctx.beginPath();
    ctx.roundRect(0, 0, 540, 600, 10);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(8, 8, 524, 584, 6);
    ctx.fillStyle = '#aaa';
    ctx.fill();
    ctx.fillStyle = '#555';
    ctx.font = 'bold 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.moverNumber().toString(), 270, 540);
    ctx.restore();

    // Draw cap
    ctx.save();
    const capAbsY = OFFSET_RANGE + this.capTranslateY() + this.capOffsetY();
    ctx.translate(OFFSET_RANGE + this.capOffsetX(), capAbsY);
    ctx.fillStyle = 'red';
    ctx.globalAlpha = this.CAP_OPACITY;
    ctx.fill(this.capPath);
    ctx.restore();

    canvas.convertToBlob({ type: 'image/png' }).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simulator.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
