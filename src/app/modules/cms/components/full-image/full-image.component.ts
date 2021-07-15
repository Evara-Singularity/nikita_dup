import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CmsService } from '../../cms.service';

@Component({
  selector: 'full-image',
  templateUrl: './full-image.component.html',
  styleUrls: ['./full-image.component.scss']
})
export class FullImageComponent implements OnInit {
    @Input('listOfImgs') listOfImgs = null;
    @Input('imagePath') imagePath = null;
    @Input('componentName') componentName;
    @Input('customStyle') customStyle;
    constructor(public _cmsService : CmsService) { }
    ngOnInit() { }
}
