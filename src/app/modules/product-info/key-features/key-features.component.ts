import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'key-features',
    templateUrl: './key-features.component.html',
    styleUrls: ['./key-features.component.scss']
})
export class KeyFeaturesComponent implements OnInit
{

    @Input("features") features = null;

    constructor() { }

    ngOnInit()
    {
        console.log(this.features);
    }

}
