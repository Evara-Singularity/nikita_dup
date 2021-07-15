import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'small-image',
  templateUrl: './small-image.component.html',
  styleUrls: ['./small-image.component.scss']
})
export class SmallImageComponent implements OnInit {
    @Input('customStyle') customStyle;
    @Input('listOfImgs') listOfImgs = null;
    @Input('componentName') componentName;
    @Input('imagePath') imagePath = null;

    constructor(private router: Router) { }
    ngOnInit() { }

    navigateTo(link, qp)
    {
        this.router.navigate([link], { queryParams: qp });
    }
}
