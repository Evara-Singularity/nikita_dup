import { Component, Input } from "@angular/core";
import CONSTANTS from "../../config/constants";

@Component({
    selector: 'cms',
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
    @Input('background') background: string = 'bg-white';

    ngOnInit() {
    }
}