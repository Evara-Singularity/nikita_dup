import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'specifications',
    templateUrl: './specifications.component.html',
    styleUrls: ['./specifications.component.scss']
})
export class SpecificationsComponent implements OnInit
{
    @Input("specifications") specifications = null;

    constructor(public _commonService: CommonService) { }

    ngOnInit() {
    }

}
