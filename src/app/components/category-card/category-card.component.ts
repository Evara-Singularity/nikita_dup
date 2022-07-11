import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@Component({
  selector: 'category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss']
})
export class CategoryCardComponent implements OnInit {

  @Input('page') page: string;
  @Input('image') image;
  @Input('title') title;
  @Input('item') item?;
  @Input('url') url?;
  @Input('isSelected') isSelected: boolean = false;
  @Output() cardClicked$: EventEmitter<any> = new EventEmitter<any>();

  imagePath = CONSTANTS.IMAGE_BASE_URL;

  constructor() { }
  ngOnInit(): void {}
}

@NgModule({
  declarations: [CategoryCardComponent],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule
  ],
  exports: [
    CategoryCardComponent
  ]
})
export default class CategoryCardModule { }