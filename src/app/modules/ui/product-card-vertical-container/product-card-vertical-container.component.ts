import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'product-card-vertical-container',
  templateUrl: './product-card-vertical-container.component.html',
  styleUrls: ['./product-card-vertical-container.component.scss']
})
export class ProductCardVerticalContainerComponent implements OnInit {

  @Input() numberOfItems: number = 0;
  @Input() isScroll: boolean = true;


  constructor() { }

  ngOnInit(): void {
  }

}
