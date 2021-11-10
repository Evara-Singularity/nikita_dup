import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'product-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit
{
    @Input("details") details = null;

    constructor() { }

    ngOnInit(): void
    {
    }


    get description() { return this.details['description'] || null }

}
