import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: 'home-feature-arrivals',
    templateUrl: './featuredArrivals.html',
    styleUrls: ['./featuredArrivals.scss']
})
export class FeaturedArrivals implements OnInit{
    @Input('featureArrivalData') featureArrivalData;
    @Input('defaultImage') defaultImage;
    @Input('imagePath') imagePath;

    ngOnInit() {
        console.log(this.featureArrivalData);
        console.log(this.defaultImage);
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