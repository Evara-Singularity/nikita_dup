import { Component, OnInit, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


 // REVIEW POINTS: please change selector to home-page-skeletons and use it accordingly
@Component({
  selector: 'home-page-skeletons',
  templateUrl: './home-page-skeletons.component.html',
  styleUrls: ['./home-page-skeletons.component.scss']
})
export class HomePageSkeletonsComponent implements OnInit {

  @Input() type: 'RECENTLY' | 'FEATURED-ARRIVALS' | 'CATEGORIES' ;
  @Input() templateRefInstance: any = null;
   
  constructor() { }
  ngOnInit() {
  }

}

@NgModule({
  declarations: [
    HomePageSkeletonsComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    HomePageSkeletonsComponent
  ]
})
export class HomePageSkeletonsModule { }
