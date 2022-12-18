import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RfqSupplierComponent } from './rfq-supplier.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { BottomMenuModule } from '../../modules/bottomMenu/bottom-menu.module';
import { RfqSupplierService } from './rfq-supplier.service';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginPopupModule } from '@app/modules/login-popup/login-popup.module';
import { PaginationModule } from '@app/components/pagination/pagination.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';

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
    BottomMenuModule,
    NumberDirectiveModule,
    ReactiveFormsModule,
    LoginPopupModule,
    PaginationModule,
    NumberDirectiveModule,
    ObserveVisibilityDirectiveModule
  ],
  declarations: [RfqSupplierComponent],
  exports: [RfqSupplierComponent],
  providers: [
    RfqSupplierService
  ]
})
export class RfqSupplierModule { }
