import { Component, OnInit, Input } from '@angular/core';
import { CmsService } from '../../cms.service';

@Component({
  selector: 'small-image',
  templateUrl: './small-image.component.html',
  styleUrls: ['./small-image.component.scss']
})
export class SmallImageComponent implements OnInit {
    @Input('customStyle') customStyle;
    @Input('listOfImgs') listOfImgs = null;
    @Input('componentName') componentName;
    @Input('imagePath') imagePath = null;

    constructor(public _cmsService : CmsService){}

    ngOnInit() { }
}
