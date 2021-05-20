import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectCustomerTypeComponent } from './select-customer-type.component';
import { SelectCustomerTypeService } from './select-customer-type.service';
import { FormsModule } from '@angular/forms';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        PopUpModule
    ],
    declarations: [
        SelectCustomerTypeComponent
    ],
    exports: [
        SelectCustomerTypeComponent
    ],
    providers: [
        SelectCustomerTypeService
    ],
})
export class SelectCustomerTypeModule {

}
