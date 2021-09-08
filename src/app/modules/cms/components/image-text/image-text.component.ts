import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { CmsService } from '../../cms.service';

@Component({
  selector: 'image-text',
  templateUrl: './image-text.component.html',
    styleUrls: ['./image-text.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ImageTextComponent implements OnInit {
    @Input('customStyle') customStyle;
    @Input('data') data = null;
    @Input('componentName') componentName;
    @Input('imagePath') imagePath = null;
    info = null;
    title: string = null;
    textDescription; string = null;
    imageLink: string = null;
    redirectPageLink: string = null;
    imageAlignment: string = null;
    altImageTitle: string = null;

    constructor(public _cmsService : CmsService, private domsanitizer:DomSanitizer) { }

    ngOnInit() { this.initialize(this.data[0]); }

    initialize(info)
    {
        this.info = info;
        this.title = info['title'];
        this.textDescription = this.domsanitizer.bypassSecurityTrustHtml(info['textDescription']);
        this.setImageDetails(info);
    }

    setImageDetails(info)
    {
        this.imageLink = this.imagePath + info['imageLink_m'];
        this.redirectPageLink = info['redirectPageLink'];
        this.altImageTitle = info['imageTitle'];
        this.imageAlignment = info['imageAlignment'];
    }
}
