import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'specifications',
    templateUrl: './specifications.component.html',
    styleUrls: ['./specifications.component.scss']
})
export class SpecificationsComponent implements OnInit
{

    @Input("specifications") specifications = null;

    constructor() { }

    ngOnInit()
    {
        console.clear();
        console.log(this.specifications);
    }

}
