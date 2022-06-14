import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-oos-similar-section',
  templateUrl: './oos-similar-section.component.html',
  styleUrls: ['./oos-similar-section.component.scss']
})
export class OosSimilarSectionComponent  {

  @Input('productOutOfStock') productOutOfStock;
  @Input('productService') productService;
  @Input('oosSimilarcardFeaturesConfig') oosSimilarcardFeaturesConfig;
  @Input('similarForOOSContainer') similarForOOSContainer; 
  @Input('similarForOOSLoaded') similarForOOSLoaded; 
    
}