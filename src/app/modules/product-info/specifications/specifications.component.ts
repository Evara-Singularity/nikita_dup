import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { fade } from '@utils/animations/animation';
@Component({
    selector: 'specifications',
    templateUrl: './specifications.component.html',
    styleUrls: ['./specifications.component.scss'],
    animations: [
        fade
    ]
})
export class SpecificationsComponent implements OnInit
{
    @Input("specifications") specifications = null;
    public isAllListShow:boolean;
    showtText:string="SHOW MORE";
    
    constructor(public _commonService: CommonService) { }

    ngOnInit() {
    }
    showMore() {
        this.isAllListShow = !this.isAllListShow;
        if(this.isAllListShow)
        {
            this.showtText="SHOW LESS";
        }
        else{
            this.showtText="SHOW MORE";
        }
    }
}
