import { Component } from "@angular/core";
import { CartService } from "@app/utils/services/cart.service";

@Component({
  selector: "gst-details",
  templateUrl: "./gst-details.component.html",
  styleUrls: ["./gst-details.component.scss"],
})
export class GstDetailsComponent {
  constructor(public _cartService: CartService) {}
}
