import { Component, Input } from '@angular/core';
import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'app-oos-similar-section',
  templateUrl: './oos-similar-section.component.html',
  styleUrls: ['./oos-similar-section.component.scss']
})
export class OosSimilarSectionComponent {

  @Input('productOutOfStock') productOutOfStock;
  @Input('oosSimilarcardFeaturesConfig') oosSimilarcardFeaturesConfig;
  @Input('similarForOOSContainer') similarForOOSContainer;
  @Input('similarForOOSLoaded') similarForOOSLoaded;

  constructor(public productService: ProductService) { }

}