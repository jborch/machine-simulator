import { Routes } from '@angular/router';

import { SimulatorComponent } from './simulator/simulator.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SimulatorComponent,
  },
];
