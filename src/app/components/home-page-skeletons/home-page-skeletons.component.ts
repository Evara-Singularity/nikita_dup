import { Component, OnInit, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


 // REVIEW POINTS: please change selector to home-page-skeletons and use it accordingly
@Component({
  selector: 'app-home-page-skeletons',
  templateUrl: './home-page-skeletons.component.html',
  styleUrls: ['./home-page-skeletons.component.scss']
})
export class HomePageSkeletonsComponent implements OnInit {
  @Input() templateRefInstance: any = null;
  // REVIEW POINTS: string types needs to be added 
  // REVIEW POINTS: formatting 
  @Input() type: 'RECENTLY' ;

 
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
