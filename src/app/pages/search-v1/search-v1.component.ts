import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'search-v1',
  templateUrl: './search-v1.component.html',
  styleUrls: ['./search-v1.component.css']
})
export class SearchV1Component implements OnInit {

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log('SearchV1Component ngOnInit', 'called');
    this.route.data.subscribe(result=>{
      console.log('SearchV1Component result ==>', result);
    })
  }

}
