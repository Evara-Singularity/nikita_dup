import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from '@app/config/constants';

@Component({
  selector: 'app-search-not-found',
  templateUrl: './search-not-found.component.html',
  styleUrls: ['./search-not-found.component.scss']
})
export class SearchNotFoundComponent implements OnInit {

  imagePath = CONSTANTS.IMAGE_BASE_URL;
  notFoundCategories: any = CONSTANTS.NOT_FOUND_CATEGORY;
  @Input() helpText: string[] = [];
  @Input() helpSubText: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
