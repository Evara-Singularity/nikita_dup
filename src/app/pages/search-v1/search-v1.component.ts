import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductListService } from '@services/productList.service';

@Component({
  selector: 'search-v1',
  templateUrl: './search-v1.component.html',
  styleUrls: ['./search-v1.component.scss']
})
export class SearchV1Component implements OnInit {
  constructor(
    private _activatedRoute: ActivatedRoute,
    public _productListService: ProductListService
  ) { }

  ngOnInit(): void {
    this.setDataFromResolver();
  }

  setDataFromResolver() {
    this._activatedRoute.data.subscribe(result => {
      console.log(result);
      this._productListService.createAndProvideDataToSharedListingComponent(result['searchData'][0], 'Search Results');
    });
  }

}
