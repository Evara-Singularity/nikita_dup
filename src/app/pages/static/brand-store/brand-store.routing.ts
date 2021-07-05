import { Routes, RouterModule } from '@angular/router';
import { BrandStoreResolver } from '@app/utils/resolvers/brandstore.resolver';
import { BrandComponent } from './brand-store.component';

const routes: Routes = [
	{
		path: '',
		component: BrandComponent,
		resolve: {
			brandData: BrandStoreResolver,
		},
	},
];

export const routing = RouterModule.forChild(routes);
