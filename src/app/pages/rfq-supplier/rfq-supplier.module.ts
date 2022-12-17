import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RfqSupplierComponent } from './rfq-supplier.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { BottomMenuModule } from '../../modules/bottomMenu/bottom-menu.module';

const routes: Routes = [
  {
    path: '',
    component: RfqSupplierComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    RouterModule,
    NgxPaginationModule,
    BottomMenuModule
  ],
  declarations: [RfqSupplierComponent],
  exports:[RfqSupplierComponent]
})
export class RfqSupplierModule { }
