import { Component, Input, OnInit } from "@angular/core";
import { CartService } from "@app/utils/services/cart.service";

@Component({
  selector: "gst-details",
  templateUrl: "./gst-details.component.html",
  styleUrls: ["./gst-details.component.scss"],
})
export class GstDetailsComponent implements OnInit {
  constructor(public _cartService: CartService) {}

  ngOnInit(): void {}
}
