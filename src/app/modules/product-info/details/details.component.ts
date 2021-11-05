import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit
{

    @Input("details") details = null;

    constructor() { }

    ngOnInit(): void
    {
        console.clear();
        console.log(this.details);
    }

}
