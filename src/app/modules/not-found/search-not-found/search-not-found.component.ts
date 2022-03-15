import { Component, OnInit } from '@angular/core';
import { CONSTANTS } from '@app/config/constants';

@Component({
  selector: 'app-search-not-found',
  templateUrl: './search-not-found.component.html',
  styleUrls: ['./search-not-found.component.scss']
})
export class SearchNotFoundComponent implements OnInit {

  imagePath = CONSTANTS.IMAGE_BASE_URL;

  constructor() { }

  ngOnInit(): void {
  }

}
