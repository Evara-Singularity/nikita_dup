import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchNotFoundComponent } from './search-not-found/search-not-found.component';
import { PageNotDeliveredComponent } from './page-not-delivered/page-not-delivered.component';
import { TrendingCategoriesModule } from '@app/components/ternding-categories/trending-categories.component';



@NgModule({
  declarations: [SearchNotFoundComponent, PageNotDeliveredComponent],
  imports: [
    CommonModule,RouterModule,TrendingCategoriesModule
  ],
  exports:[SearchNotFoundComponent, PageNotDeliveredComponent]
})
export class NotFoundModule { }
