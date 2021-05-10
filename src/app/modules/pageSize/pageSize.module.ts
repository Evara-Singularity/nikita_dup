import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule  } from '@angular/router';
import { PageSizeComponent } from './pageSize.component';

import { PageSizeService } from './pageSize.service';
import {FormsModule} from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule
    ],
    exports: [PageSizeComponent],
    declarations: [PageSizeComponent],
    providers: [PageSizeService],
})
export class PageSizeModule { }