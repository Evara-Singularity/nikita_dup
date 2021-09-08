import { Component, Input } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'filter-category-list',
    templateUrl: './filter-category.component.html',
    styleUrls: ['./filter-category.component.scss']
})
export class FilterCategoryComponent {
    @Input('categoryFilterData') categoryFilterData: any;
    @Input('isBrandPage') isBrandPage: any;

    constructor(public _commonService: CommonService){}
}