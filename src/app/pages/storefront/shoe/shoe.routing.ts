import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '../../../utils/resolvers/layout.resolver';
import { ShoeComponent } from './shoe.component';

const routes: Routes = [
	{
		path: '',
		component: ShoeComponent,
		resolve: {
			shoeData: LayoutResolver,
		},
	},
];

export const routing = RouterModule.forChild(routes);
