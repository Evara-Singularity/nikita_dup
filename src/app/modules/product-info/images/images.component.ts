import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'images',
    templateUrl: './images.component.html',
    styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit
{
    @Input("images") images: any[] = null;
    currentImageIndex = -1;

    constructor() { }

    ngOnInit(): void
    {
        if (this.images.length) { this.currentImageIndex = 0; }
    }

    updateImageIndex(index) { this.currentImageIndex = index; }

}
