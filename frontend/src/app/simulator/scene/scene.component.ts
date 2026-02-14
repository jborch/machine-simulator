import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';

export interface SceneState {
  penOffsetX: number;
  penOffsetY: number;
  penTilt: number;
  moverTilt: number;
  moverNumber: number;
  capTranslateY: number;
  capOffsetX: number;
  capOffsetY: number;
  capAttached: boolean;
  showMover?: boolean;
}

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
export const CANVAS_W = 510 + OFFSET_RANGE * 2;
export const CANVAS_H = PEN_Y + 1800 + OFFSET_RANGE * 2;

const VISUAL_SCALE = 0.33;
const CAP_OPACITY = 0.8;

@Component({
  selector: 'app-scene',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas
    #canvas
    [width]="CANVAS_W"
    [height]="CANVAS_H"
    class="border border-dashed border-gray-400"
    [style.width.px]="CANVAS_W * VISUAL_SCALE"
    [style.height.px]="CANVAS_H * VISUAL_SCALE"
  ></canvas>`,
})
export class SceneComponent {
  readonly CANVAS_W = CANVAS_W;
  readonly CANVAS_H = CANVAS_H;
  readonly VISUAL_SCALE = VISUAL_SCALE;

  state = input.required<SceneState>();

  readonly overlapPixelCount = signal(0);

  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private penPath = new Path2D(PEN_PATH);
  private capPath = new Path2D(CAP_PATH);

  constructor() {
    afterNextRender(() => {
      this.redraw();
    });

    effect(() => {
      this.redraw();
    });
  }

  redraw() {
    const ctx = this.canvas().nativeElement.getContext('2d')!;
    const state = this.state();
    this.drawScene(ctx, state);
    this.overlapPixelCount.set(this.countOverlapPixels(ctx, state));
  }

  drawToContext(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
    this.drawScene(ctx, this.state());
  }

  private countOverlapPixels(ctx: CanvasRenderingContext2D, state: SceneState): number {
    const capAbsY = OFFSET_RANGE + state.capTranslateY + state.capOffsetY;
    const penAbsY = PEN_Y + OFFSET_RANGE + state.penOffsetY;

    const capBottom = capAbsY + 320;
    const penBottom = penAbsY + 1800;
    const overlapTop = Math.max(capAbsY, penAbsY);
    const overlapBottom = Math.min(capBottom, penBottom);

    if (overlapTop >= overlapBottom) {
      return 0;
    }

    const regionY = Math.floor(overlapTop);
    const regionH = Math.ceil(overlapBottom - overlapTop);

    const imageData = ctx.getImageData(0, regionY, CANVAS_W, regionH).data;

    let count = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      if (imageData[i + 3] === 255 && imageData[i] > 200 && imageData[i + 1] > 0) {
        count++;
      }
    }

    return count;
  }

  private drawScene(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    state: SceneState,
  ) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const px = PEN_X + OFFSET_RANGE + state.penOffsetX;
    const py = PEN_Y + OFFSET_RANGE + state.penOffsetY;
    const cx = px + 225;
    const cy = py + 900;
    const totalTilt = ((state.moverTilt + state.penTilt) * Math.PI) / 180;

    if (state.showMover !== false) {
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
      ctx.rotate((state.moverTilt * Math.PI) / 180);
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
      ctx.fillText(state.moverNumber.toString(), 270, 540);
      ctx.restore();
    }

    // Draw cap
    ctx.save();
    const capAbsY = OFFSET_RANGE + state.capTranslateY + state.capOffsetY;
    ctx.translate(OFFSET_RANGE + state.capOffsetX, capAbsY);
    ctx.fillStyle = 'red';
    ctx.globalAlpha = CAP_OPACITY;
    ctx.fill(this.capPath);
    ctx.restore();
  }
}
