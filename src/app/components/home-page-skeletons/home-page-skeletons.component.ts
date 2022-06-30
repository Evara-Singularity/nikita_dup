import { Component, OnInit, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home-page-skeletons',
  templateUrl: './home-page-skeletons.component.html',
  styleUrls: ['./home-page-skeletons.component.scss']
})
export class HomePageSkeletonsComponent implements OnInit {
  @Input() templateRefInstance: any = null;
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
