import {
  Component,
  Input,
} from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-product-oos-similar-product-detail",
  templateUrl: "./product-oos-similar-product-detail.component.html",
  styleUrls: ["./product-oos-similar-product-detail.component.scss"],
})

export class ProductOosSimilarProductDetailComponent {
  @Input('product') product;
  constructor(
    private _router: Router,
  ) { }

  navigateLink(link) {
    this._router.navigate([link]);
  }
}
