import { Component, Input } from "@angular/core";
import { CmsService } from "../../cms.service";

@Component({
    selector: 'dynamic-image-component',
    templateUrl: './dynamic-image.component.html',
    styleUrls: ['./dynamic-image.component.scss']
})
export class DynamicImageComponent {
    @Input('listOfImgs') listOfImgs = null;
    @Input('imagePath') imagePath = null;
    @Input('titleData') titleData = null;
    @Input('customStyle') customStyle;
    
    @Input('componentName') componentName;

    constructor(public _cmsService : CmsService){}
    
}