import {
  Component,
  Input,
} from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from '../../../utils/services/common.service';

@Component({
  selector: "app-product-oos-similar-product-detail",
  templateUrl: "./product-oos-similar-product-detail.component.html",
  styleUrls: ["./product-oos-similar-product-detail.component.scss"],
})

export class ProductOosSimilarProductDetailComponent {
  @Input('product') product;
  productStaticData = this.commonService.defaultLocaleValue;
  constructor(
    private _router: Router,
    private commonService:CommonService
  ) { }
  ngOnInIt(){
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this.commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }

  navigateLink(link) {
    this._router.navigate([link]);
  }
}
