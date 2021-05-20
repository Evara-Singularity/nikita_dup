import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from './pagination.component';
import { PagerService } from './pager.service';
import {NgxPaginationModule} from "ngx-pagination";

import { RouterModule } from '@angular/router';
@NgModule({
    imports: [CommonModule, NgxPaginationModule,RouterModule],
    exports: [PaginationComponent],
    declarations: [PaginationComponent],
    providers: [PagerService],
})
export class PaginationModule { }