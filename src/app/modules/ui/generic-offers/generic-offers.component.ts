import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';

@Component({
  selector: 'generic-offers',
  templateUrl: './generic-offers.component.html',
  styleUrls: ['./generic-offers.component.scss']
})
export class GenericOffersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
@NgModule({
  declarations: [GenericOffersComponent],
  imports: [
    CommonModule
  ],
  exports: [GenericOffersComponent],
})
export class GenericOffersModule{
}
