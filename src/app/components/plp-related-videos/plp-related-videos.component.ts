import { Component, OnInit, NgModule } from '@angular/core';

@Component({
  selector: 'app-plp-related-videos',
  templateUrl: './plp-related-videos.component.html',
  styleUrls: ['./plp-related-videos.component.scss']
})
export class PlpRelatedVideosComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
@NgModule({
  declarations:[PlpRelatedVideosComponent],
  exports:[PlpRelatedVideosComponent]
})
export class PlpRelatedVideosModule{}