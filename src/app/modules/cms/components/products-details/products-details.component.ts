import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'products-details',
  templateUrl: './products-details.component.html',
  styleUrls: ['./products-details.component.scss']
})
export class ProductsDetailsComponent implements OnInit {

    @Input('listOfProducts') listOfProducts: any[] = null;
    @Input('titleData') titleData = null;
    @Input('imagePath') imagePath = null;
    title: string = '';
    viewAll: boolean = false;
    constructor(private router: Router) { }

    ngOnInit() { this.initialize(); }

    initialize()
    {
        this.title = this.titleData['titleName'];
    }

    navigateTo(link)
    {
        this.router.navigate([link]);
    }
}
