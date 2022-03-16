import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchNotFoundComponent } from './search-not-found/search-not-found.component';
import { PageNotDeliveredComponent } from './page-not-delivered/page-not-delivered.component';



@NgModule({
  declarations: [SearchNotFoundComponent, PageNotDeliveredComponent],
  imports: [
    CommonModule,RouterModule
  ],
  exports:[SearchNotFoundComponent, PageNotDeliveredComponent]
})
export class NotFoundModule { }
