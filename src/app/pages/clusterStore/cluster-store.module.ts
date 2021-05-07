import { ClusterStoreResolver } from './cluster-store.resolver';
import { ClusterStoreComponent } from './cluster-store.component';
import { routing } from './cluster-store.routing';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClusterStoreService } from './cluster-store.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgxSiemaModule } from 'ngx-siema';
import { LoaderModule } from '../../modules/loader/loader.module';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { ClusterCategoryComponent } from 'src/app/components/cluster-store/cluster-category/cluster-category.component';

@NgModule({
  declarations: [
    ClusterStoreComponent,
    ClusterCategoryComponent
    ],
  imports: [
    CommonModule,
    RouterModule,
    routing,
    LazyLoadImageModule,
    LoaderModule,
    NgxSiemaModule.forRoot(),
    ObserveVisibilityDirectiveModule
  ],
providers:[
  ClusterStoreService,
  ClusterStoreResolver
  ],
})
export class ClusterStoreModule { }
