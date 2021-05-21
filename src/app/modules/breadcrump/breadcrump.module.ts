import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { BreadcrumpComponent  } from './breadcrump.component';
import { BreadcrumpService } from './breadcrump.service';

@NgModule({
    imports: [HttpClientModule,RouterModule,CommonModule],
    exports: [BreadcrumpComponent],
    declarations: [BreadcrumpComponent],
    providers: [BreadcrumpService],
})
export class BreadCrumpModule { }
