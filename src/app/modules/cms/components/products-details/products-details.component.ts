import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CmsService } from '../../cms.service';

@Component({
  selector: 'products-details',
  templateUrl: './products-details.component.html',
  styleUrls: ['./products-details.component.scss']
})
export class ProductsDetailsComponent implements OnInit {
    @Input('customStyle') customStyle;
    @Input('componentName') componentName;
    @Input('listOfProducts') listOfProducts: any[] = null;
    @Input('titleData') titleData = null;
    @Input('imagePath') imagePath = null;
    title: string = '';
    viewAll: boolean = false;
    constructor(public _cmsService : CmsService) { }

    ngOnInit() { this.initialize(); }

    initialize()
    {
        this.title = this.titleData['titleName'];
    }
}