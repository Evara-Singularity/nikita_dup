import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { PopUpModule } from "../../modules/popUp/pop-up.module";
import { MathCeilPipeModule } from "../../utils/pipes/math-ceil";

@Component({
  selector: 'app-home-popup',
  templateUrl: './home.popup.component.html',
  styleUrls: ['./home.popup.component.scss'],
})
export class HomePopupComponet implements OnInit {
  @Input('openPopup') openPopup;
  @Input('arrivalPopup') arrivalPopup;
  @Input('defaultImage') defaultImage;
  @Input('carouselData') carouselData: any;
  @Input('imagePath') imagePath: any;
  @Input('categoryNameFromHomePage') categoryNameFromHomePage;
  @Input('dataKeyToPopUpPage') dataKeyToPopUpPage;
  @Output() outData$: EventEmitter<{}>;
  ngOnInit() {
    console.log(this);
  }

  outData(data) {
    if (Object.keys(data).indexOf("hide") !== -1) {
      this.openPopup = !data.hide;
      this.arrivalPopup = !data.hide;
    }
  }

  beforeDiscount(afterDiscountPrice, discount_percentage) {
    const val = 100 / (100 - discount_percentage);
    const val2 = Math.round(val * 100) / 100;
    const original = afterDiscountPrice * val2;
    const removeDecimal = Math.round(original * 100) / 100;
    const newValue = Math.round(0.0 + removeDecimal);
    return newValue;
  }
  getBrandName(brand_description) {
    const ParsebrandName = brand_description.split("||");
    const brandName = ParsebrandName[0]; // brandName i,e Brand: ABC at 0th Position
    const afterRemoveBrandWord = brandName.replace("Brand:", "");
    return afterRemoveBrandWord;
  }
}

@NgModule({
  declarations: [HomePopupComponet],
  imports: [CommonModule, LazyLoadImageModule, MathCeilPipeModule, RouterModule, PopUpModule],
})
export default class HomePopupModule { }