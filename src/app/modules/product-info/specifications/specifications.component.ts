import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
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
    @Output() callback: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input("specifications") specifications = null;
    public isAllListShow:boolean;
    enableSecondaryAttributes: boolean = false;
    showSecondaryAttributes: boolean = false;
    
    constructor(public _commonService: CommonService) { }

    ngOnInit() {
        this.checkSecondaryAttributes();
    }

    checkSecondaryAttributes() {
        if (this.specifications['secondaryAttributes']) {
            const secondaryAttributes = Object.assign({}, this.specifications['secondaryAttributes']);
            for (const key in secondaryAttributes) {
                if (Object.prototype.hasOwnProperty.call(secondaryAttributes, key)) {
                    const element = secondaryAttributes[key];
                    this.enableSecondaryAttributes = this.enableSecondaryAttributes || (element && element.length > 0)
                }
            }
        }
    }
    showMore() {
        this.showSecondaryAttributes = !this.showSecondaryAttributes;
        this.callback.emit(this.showSecondaryAttributes);
    }
}
