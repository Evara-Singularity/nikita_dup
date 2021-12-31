import { Component, OnInit, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'static-breadcrumb',
    templateUrl: './static-breadcrumb.component.html',
    styleUrls: ['./static-breadcrumb.component.scss'],
})
export class StaticBreadcrumbComponent implements OnInit
{

    @Input('breadCrumbList') breadCrumbList = [];
    @Input('marginTop') marginTop = 120;
    constructor() { }
    ngOnInit() { }
}

@NgModule({
    declarations: [StaticBreadcrumbComponent],
    imports: [CommonModule, RouterModule],
    exports: [StaticBreadcrumbComponent]
})
export class StaticBreadcrumbModule { }
