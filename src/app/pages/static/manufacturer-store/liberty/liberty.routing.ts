import { Routes, RouterModule } from '@angular/router';
import { LibertyComponent } from './liberty.component';

const routes: Routes = [
	{
		path: '',
		component: LibertyComponent,
	},
];

export const routing = RouterModule.forChild(routes);
