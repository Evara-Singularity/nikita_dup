import { Component, OnInit,Input } from '@angular/core';
import CONSTANTS from '../../config/constants';

@Component({
    selector: 'loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
})

export class LoaderComponent implements OnInit {
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    constructor() { }
    offerHeader: string;
    @Input() showLoader:boolean;
    isServer:boolean = typeof window != 'undefined' ? false : true;
    ngOnInit() {
        if(!this.isServer){
            this.offerHeader = localStorage.getItem('offerHeader');
        }
    }
}
