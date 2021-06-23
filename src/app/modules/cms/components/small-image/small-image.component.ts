import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'small-image',
  templateUrl: './small-image.component.html',
  styleUrls: ['./small-image.component.scss']
})
export class SmallImageComponent implements OnInit {

    @Input('listOfImgs') listOfImgs = null;
    @Input('imagePath') imagePath = null;

    constructor(private router: Router) { }
    ngOnInit() { }

    navigateTo(link)
    {
        this.router.navigate([link]);
    }
}
