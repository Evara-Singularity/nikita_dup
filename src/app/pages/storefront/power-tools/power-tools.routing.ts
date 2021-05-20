import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { PowerToolsComponent } from './power-tools.component';

const routes: Routes = [
	{
		path: '',
		component: PowerToolsComponent,
		resolve: {
			data: LayoutResolver,
		},
	},
];

export const routing = RouterModule.forChild(routes);
