import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'product-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class DetailsComponent {
    @Input("details") details = null;

    constructor(public _commonService: CommonService) { }

    get description() { return this.details['description'] || null }

}
