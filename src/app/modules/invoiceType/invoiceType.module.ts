import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceTypeComponent } from './invoiceType.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [InvoiceTypeComponent],
    declarations: [InvoiceTypeComponent],
    providers: [],
})
export class InvoiceTypeModule { }
