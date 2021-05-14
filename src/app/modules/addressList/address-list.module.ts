import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AddressListComponent } from './address-list.component';
import { AddressListService } from './address-list.service';
import { ShowActivePipeModule } from 'src/app/utils/pipes/show-active.pipe';
import { ContinueModule } from '../continue/continue.module';
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';
import { ClickOutsideDirectiveModule } from 'src/app/utils/directives/clickOutside.directive';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ShowActivePipeModule,
        ReactiveFormsModule,
        RouterModule,
        ContinueModule,
        MathCeilPipeModule,
        ClickOutsideDirectiveModule,
        BottomMenuModule
    ],
    exports: [AddressListComponent],
    declarations: [AddressListComponent],
    providers: [ AddressListService],
})
export class AddressListModule { }
