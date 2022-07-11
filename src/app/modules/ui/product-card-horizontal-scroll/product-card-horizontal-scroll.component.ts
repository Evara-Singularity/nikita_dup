import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'horizontal-scroll-container',
  templateUrl: './product-card-horizontal-scroll.component.html',
  styleUrls: ['./product-card-horizontal-scroll.component.scss']
})
export class ProductCardHorizontalScrollComponent implements OnInit {
  @Input() numberOfItems: number = 0;
  constructor() { }

  ngOnInit(): void {
  }

}
