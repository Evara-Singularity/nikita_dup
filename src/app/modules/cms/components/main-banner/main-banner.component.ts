import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'main-banner',
    templateUrl: './main-banner.component.html',
    styleUrls: ['./main-banner.component.scss']
})
export class MainBannerComponent implements OnInit
{
    @Input('data') data = [];
    @Input('imagePath') imagePath = null;
    mainBannerImgLink = '';
    imageTitle = '';
    redirectPageLink = '';

    constructor(private router: Router) { }
    ngOnInit() { this.initialize(this.data[0]); }
    initialize(info) { 
        this.mainBannerImgLink = this.imagePath + info['imageLink_m']; 
        this.imageTitle = info['imageTitle'];
        this.redirectPageLink = info['redirectPageLink']; 
    }
    navigateTo(link) { this.router.navigate([link]); }

}
