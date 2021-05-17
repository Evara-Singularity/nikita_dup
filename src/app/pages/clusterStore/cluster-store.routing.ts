import { Routes, RouterModule } from '@angular/router';
import { ClusterStoreComponent } from './cluster-store.component';
import { ClusterStoreResolver } from './cluster-store.resolver';

const routes: Routes = [
	{
		path: '',
		component: ClusterStoreComponent,
		resolve: {
			clusterStoreData: ClusterStoreResolver,
		},
	},
];

export const routing = RouterModule.forChild(routes);
