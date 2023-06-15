import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-plp-inline-top-banner',
  templateUrl: './plp-inline-top-banner.component.html',
  styleUrls: ['./plp-inline-top-banner.component.scss']
})
export class PlpInlineBannerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

@NgModule({
  declarations: [
    PlpInlineBannerComponent
  ],
  imports: [CommonModule],
  exports:[
    PlpInlineBannerComponent
  ]
})
export class PlpInlineBannerModule{}
