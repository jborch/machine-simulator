import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-overlap-graph',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas [width]="WIDTH" [height]="HEIGHT" class="border border-gray-300"></canvas>`,
})
export class OverlapGraphComponent {
  readonly WIDTH = 400;
  readonly HEIGHT = 200;
  readonly PADDING = 20;

  dataPoints = input<number[]>([]);

  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      this.draw(this.dataPoints());
    });
  }

  private draw(points: number[]) {
    const canvas = this.canvas().nativeElement;
    const ctx = canvas.getContext('2d')!;
    const w = this.WIDTH;
    const h = this.HEIGHT;
    const p = this.PADDING;

    ctx.clearRect(0, 0, w, h);

    // Draw axes
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p, p);
    ctx.lineTo(p, h - p);
    ctx.lineTo(w - p, h - p);
    ctx.stroke();

    if (points.length < 2) return;

    const maxVal = Math.max(...points, 1);
    const graphW = w - 2 * p;
    const graphH = h - 2 * p;

    // Draw line
    ctx.strokeStyle = 'steelblue';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
      const x = p + (i / (points.length - 1)) * graphW;
      const y = h - p - (points[i] / maxVal) * graphH;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Draw max label
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(maxVal.toString(), p - 4, p + 4);
    ctx.fillText('0', p - 4, h - p + 4);
  }
}
