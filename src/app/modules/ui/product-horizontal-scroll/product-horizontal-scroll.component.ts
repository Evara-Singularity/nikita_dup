import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'product-horizontal-scroll',
  templateUrl: './product-horizontal-scroll.component.html',
  styleUrls: ['./product-horizontal-scroll.component.scss']
})
export class ProductHorizontalScrollComponent implements OnInit {

  constructor() { }
  @Input() numberOfItems: number = 0;

  ngOnInit(): void {
  }

}
