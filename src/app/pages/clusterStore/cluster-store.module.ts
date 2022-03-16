import { ClusterStoreComponent } from './cluster-store.component';
import { routing } from './cluster-store.routing';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClusterStoreService } from './cluster-store.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { ClusterCategoryComponent } from '@app/components/cluster-store/cluster-category/cluster-category.component';
import { ClusterStoreResolver } from './cluster-store.resolver';
import { ClusterFooterComponent } from '@app/components/cluster-store/cluster-footer/cluster-footer.component';
import CategoryCardModule from '@app/components/category-card/category-card.component';
import { NotFoundModule } from '@app/modules/not-found/not-found.module';

@NgModule({
	declarations: [ClusterStoreComponent, ClusterCategoryComponent, ClusterFooterComponent],
	imports: [
		CommonModule,
		RouterModule,
		routing,
		LazyLoadImageModule,
		ObserveVisibilityDirectiveModule,
		CategoryCardModule,
		NotFoundModule
	],
	providers: [ClusterStoreService, ClusterStoreResolver],
})
export class ClusterStoreModule {}
