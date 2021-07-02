import { Component, Input, SimpleChange } from "@angular/core";
import { Router } from '@angular/router';

@Component({
    selector: 'dynamic-image-component',
    templateUrl: './dynamic-image.component.html',
    styleUrls: ['./dynamic-image.component.scss']
})
export class DynamicImageComponent {
    @Input('listOfImgs') listOfImgs = null;
    @Input('imagePath') imagePath = null;
    @Input('titleData') titleData = null;
    @Input('customStyle') customStyle;
    constructor(private router: Router){}

    naivgateTo(link){
        this.router.navigate([link]);
    }
}