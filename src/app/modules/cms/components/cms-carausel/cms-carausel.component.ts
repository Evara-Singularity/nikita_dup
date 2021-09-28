import { Component, Input } from "@angular/core";
import { CmsService } from "../../cms.service";

@Component({
    selector: 'cms-carausel',
    templateUrl: './cms-carausel.component.html',
    styleUrls: ['./cms-carausel.component.scss']
})
export class CmsCarauselComponent {
    @Input('data') data = [];
    @Input('imagePath') imagePath = '';
    @Input('customStyle') customStyle;
    @Input('componentName') componentName;
    imageTitle = '';
    redirectPageLink = '';

    constructor(public _cmsService : CmsService){}

    ngOnInit() { 
    }
}