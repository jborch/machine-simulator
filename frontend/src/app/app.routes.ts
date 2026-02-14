import { Routes } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';
import { SimulatorComponent } from './simulator/simulator.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewComponent,
  },
  {
    path: 'simulator',
    component: SimulatorComponent,
  },
];
