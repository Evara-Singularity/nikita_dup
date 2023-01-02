import { Component, Input, OnInit } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'product-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class DetailsComponent {
    @Input("details") details = null;
    @Input("removeEllipse") removeEllipse = false;
    prodUrl: string;
    productStaticData = this._commonService.defaultLocaleValue;

    constructor(public _commonService: CommonService) { 
        this.prodUrl = CONSTANTS.PROD
    }
    ngOnInIt(){
        this.getStaticSubjectData();
    }

    get description() { return this.details['description'] || null }

    getStaticSubjectData(){
        this._commonService.changeStaticJson.subscribe(staticJsonData => {
          this.productStaticData = staticJsonData;
        });
    }

}
