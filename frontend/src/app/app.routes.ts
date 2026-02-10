import { Routes } from '@angular/router';

import { OverviewComponent } from './machine/overview/overview.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewComponent,
  },
];
