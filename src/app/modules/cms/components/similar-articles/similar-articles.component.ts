import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'similar-articles',
  templateUrl: './similar-articles.component.html',
  styleUrls: ['./similar-articles.component.scss']
})
export class SimilarArticlesComponent implements OnInit {

    @Input('data') data = null
    
    constructor() { }

  ngOnInit() {
  }

}
