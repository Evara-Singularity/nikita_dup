import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonService } from "src/app/utils/services/common.service";

@Component({
    selector: 'home-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.scss']
})
export class Categories {
    @Input('middleImageJsonData') middleImageJsonData;
    @Input('categories') categories;
    @Input('carouselData') carouselData;
    @Input('defaultImage') defaultImage;
    @Input('imagePath') imagePath;
    @Input('recentProductList') recentProductList;
    @Output('sendDataToPopUP') sendDataToPopUP = new EventEmitter();
    openPopup;
    categoryNameFromHomePage;
    
    constructor(private _commonService: CommonService) {}

    getCategoryLabel(categoryName) {
      this.categoryNameFromHomePage = categoryName;
      setTimeout(() => {
        window.scrollTo(window.scrollX, window.scrollY + 1);
        window.scrollTo(window.scrollX, window.scrollY - 1);
      }, 100);
    }

    setCategoryorBrandCookie(categoryName, type) {
        this._commonService.setSectionClickInformation("homepage", "listing");
        var date = new Date();
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (type === "tbrand") {
          document.cookie =
            "adobeClick=" +
            "Brand" +
            "_" +
            categoryName +
            "; expires=" +
            date.toUTCString() +
            ";path=/";
        } else if (type === "tcat") {
          document.cookie =
            "adobeClick=" +
            "Category" +
            "_" +
            categoryName +
            "; expires=" +
            date.toUTCString() +
            ";path=/";
        }
      }

      setCookieLink(catName, categoryCodeorBannerName, type) {
        this._commonService.setSectionClickInformation("homepage", type);
        var date = new Date();
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
        document.cookie =
          "adobeClick=" +
          catName +
          "_" +
          categoryCodeorBannerName +
          "; expires=" +
          date.toUTCString() +
          ";path=/";
      }

      getBrandName(brand_description) {
        const ParsebrandName = brand_description.split("||");
        const brandName = ParsebrandName[0]; // brandName i,e Brand: ABC at 0th Position
        const afterRemoveBrandWord = brandName.replace("Brand:", "");
        return afterRemoveBrandWord;
      }

      beforeDiscount(afterDiscountPrice, discount_percentage) {
        const val = 100 / (100 - discount_percentage);
        const val2 = Math.round(val * 100) / 100;
        const original = afterDiscountPrice * val2;
        const removeDecimal = Math.round(original * 100) / 100;
        const newValue = Math.round(0.0 + removeDecimal);
        return newValue;
      }

}