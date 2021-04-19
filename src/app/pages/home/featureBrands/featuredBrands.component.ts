import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: 'home-feature-brands',
    templateUrl: './featuredBrands.html',
    styleUrls: ['./featuredBrands.scss']
})
export class FeaturedBrands implements OnInit{
    @Input('featureBrandData') featureBrandData;
    @Input('defaultImage') defaultImage;
    @Input('imagePath') imagePath;

    ngOnInit() {
        console.log(this.featureBrandData);
        console.log(this.defaultImage, this.imagePath);
    }

    setCookieFeatured(imageTitle) {
        var date = new Date();
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
        document.cookie =
          "adobeClick=" +
          "Featured" +
          "_" +
          imageTitle +
          "; expires=" +
          date.toUTCString() +
          ";path=/";
      }
}