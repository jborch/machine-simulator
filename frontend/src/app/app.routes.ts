import { Routes } from '@angular/router';

import { OverviewComponent } from './machine/overview/overview.component';
import { StationComponent } from './machine/station/station.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewComponent,
  },
  {
    path: 'station/:id',
    component: StationComponent,
  },
];
