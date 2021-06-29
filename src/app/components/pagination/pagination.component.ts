import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CommonService } from "@app/utils/services/common.service";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from "ngx-pagination";

@Component({
    selector: 'pagination',
    templateUrl: 'pagination.html',
    styleUrls: ['./pagination.scss'],
    encapsulation: ViewEncapsulation.None
})

export class PaginationComponent {
    @Input('paginationData') paginationData: any;

    constructor(public _commonService: CommonService, private _activatedRoute: ActivatedRoute) {};

    ngOnInit() {
        this.initializePageData();
    }

    initializePageData() {
        const queryParams = this._activatedRoute.snapshot.queryParams;

        this._commonService.selectedFilterData.pages = [];
        this._commonService.selectedFilterData.pageSize = queryParams['pageSize'] ? queryParams['pageSize'] : 10;
        this._commonService.selectedFilterData.page = queryParams['page'] ? queryParams['page'] : 1;

        for(let i = 0; i < Math.abs(this.paginationData.itemCount / this._commonService.selectedFilterData.pageSize); i++){
            this._commonService.selectedFilterData.pages.push(i+1);
        }
    }

    updatePageData(data) {
        this.paginationData = data;
        this.initializePageData();
    }

    pageChanged(event) {
        this._commonService.applyFilter(undefined, event);
    }

}

@NgModule({
    imports: [
        CommonModule,
        NgxPaginationModule,
    ],
    exports: [PaginationComponent],
    declarations: [PaginationComponent],
})
export class PaginationModule { }
export class BrandModule extends PaginationModule{ }
export class SearchModule extends PaginationModule { }
export class CategoryModule extends PaginationModule { }
