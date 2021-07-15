import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'full-image',
  templateUrl: './full-image.component.html',
  styleUrls: ['./full-image.component.scss']
})
export class FullImageComponent implements OnInit {
    @Input('listOfImgs') listOfImgs = null;
    @Input('imagePath') imagePath = null;
    @Input('componentName') componentName;
    @Input('customStyle') customStyle;
    constructor(private router: Router) { }
    ngOnInit() { }
    navigateTo(link, qp)
    {
        this.router.navigate([link], { queryParams: qp });
    }
}
