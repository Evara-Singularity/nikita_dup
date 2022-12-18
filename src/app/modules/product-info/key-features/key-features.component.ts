import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../../utils/services/common.service';

@Component({
    selector: 'key-features',
    templateUrl: './key-features.component.html',
    styleUrls: ['./key-features.component.scss']
})
export class KeyFeaturesComponent implements OnInit
{
    productStaticData = this._commonService.defaultLocaleValue;
    @Input("features") features = null;

    constructor(private _commonService:CommonService) { }

    ngOnInit()
    {
        this.getStaticSubjectData();  
    }
    getStaticSubjectData(){
        this._commonService.changeStaticJson.subscribe(staticJsonData => {
          this.productStaticData = staticJsonData;
        });
    }
}
