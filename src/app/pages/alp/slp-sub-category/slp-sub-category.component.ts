import { Component, OnInit, Input, ViewChild } from "@angular/core";
import CONSTANTS from "src/app/config/constants";

@Component({
  selector: "slp-sub-category",
  templateUrl: "./slp-sub-category.component.html",
  styleUrls: ["./slp-sub-category.component.scss"],
})
export class SlpSubCategoryComponent implements OnInit {
  @Input("sub_category_Data") sub_category_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + "assets/img/home_card.webp";
  openPopup: boolean;

  constructor() {
    this.openPopup = false;
  }

  ngOnInit() {}

  outData(data) {
    if (Object.keys(data).indexOf("hide") !== -1) {
      this.openPopup = !data.hide;
    }
  }
}