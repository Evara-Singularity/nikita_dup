import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RfqSupplierComponent } from './rfq-supplier.component';
import { RouterModule, Routes } from '@angular/router';

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
    RouterModule
  ],
  declarations: [RfqSupplierComponent],
  exports:[RfqSupplierComponent]
})
export class RfqSupplierModule { }
