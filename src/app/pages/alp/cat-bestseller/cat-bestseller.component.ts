import { Component, OnInit, Input, ViewChild } from "@angular/core";
import CONSTANTS from "src/app/config/constants";

@Component({
  selector: "cat-bestseller",
  templateUrl: "./cat-bestseller.component.html",
  styleUrls: ["./cat-bestseller.component.scss"],
})
export class CatBestsellerComponent implements OnInit {
  @Input("bestSeller_Data") bestSeller_Data;
  @Input("bestSlroptions") bestSlroptions;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + "assets/img/home_card.webp";
  name;
  descArr;
  openPopup: boolean;

  constructor() {
    this.openPopup = false;
  }

  ngOnInit() {}

  getBrandBy(brandName) {
    this.descArr = brandName.split(":");
    return this.descArr[1];
  }

  outData(data) {
    if (Object.keys(data).indexOf("hide") !== -1) {
      this.openPopup = !data.hide;
    }
  }
}
