import { Component, OnInit, NgModule } from '@angular/core';

@Component({
  selector: 'app-inline-rectangle-banner',
  templateUrl: './inline-rectangle-banner.component.html',
  styleUrls: ['./inline-rectangle-banner.component.scss']
})
export class InlineRectangleBannerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
@NgModule(
  {
    declarations:[InlineRectangleBannerComponent],
    exports:[InlineRectangleBannerComponent]
  }
)
export class InlineRectangleBannerModule{}
