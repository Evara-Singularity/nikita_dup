import { Component, Input, OnInit } from '@angular/core';
import { CmsService } from '../../cms.service';

@Component({
    selector: 'main-banner',
    templateUrl: './main-banner.component.html',
    styleUrls: ['./main-banner.component.scss']
})
export class MainBannerComponent implements OnInit
{
    @Input('data') data = [];
    @Input('componentName') componentName;
    @Input('customStyle') customStyle;
    @Input('imagePath') imagePath = '';

    mainBannerImgLink = '';
    imageTitle = '';
    redirectPageLink = '';

    constructor(public _cmsService : CmsService) { }

    ngOnInit() { 
        this.initialize(this.data[0]); 
    }
    initialize(info) { 
        this.mainBannerImgLink = this.imagePath + info['imageLink']; 
        this.imageTitle = info['imageTitle'];
        this.redirectPageLink = info['redirectPageLink']; 
    }

}
