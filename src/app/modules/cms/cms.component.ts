import { Component, Input } from "@angular/core";
import CONSTANTS from "../../config/constants";

@Component({
    selector: 'data-cms',
    styleUrls: ['./cms.component.scss'],
    templateUrl: './cms.component.html'
})
export class CmsWrapperComponent {
    readonly componentLabel = 'componentLabel';
    readonly data = 'data';
    readonly title = 'title';
    readonly class = 'componentClass';
    readonly titleData = 'titleData';
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    sample = {'padding': '20px', 'background': 'red'};

    @Input('cmsData') cmsData: any;
    @Input('isAppDevice') isAppDevice:boolean=false;
    @Input('background') background: string = 'bg-white';

    ngOnInit() {
    }

    get cmsItems() { 
        let retValue = [];
        if (this.cmsData) { retValue = this.cmsData['data'] || retValue; }
        return retValue;
    }
}