import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'filter-category-list',
    templateUrl: './filter-category.component.html',
    styleUrls: ['./filter-category.component.scss']
})
export class FilterCategoryComponent {
    @Input('categoryFilterData') categoryFilterData: any;
    @Input('isBrandPage') isBrandPage: any;
    @Input('brandName') brandName: any;
    @Input('brandUrl') brandUrl: any;
    @Output('toggleFilter') toggleFilter: EventEmitter<any> = new EventEmitter<any>();

    constructor(public _commonService: CommonService){}

    applyFilter(item)
    {
        this._commonService.applyFilter(this.isBrandPage ? ('/brands/' + this.brandUrl + '/' + item?.categoryLink) : item?.categoryLink)
    }
}