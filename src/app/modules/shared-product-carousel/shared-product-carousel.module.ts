import { ArrayFilterPipeModule } from './../../utils/pipes/k-array-filter.pipe';
import { ComponentFactory, ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedProductCarouselComponent } from './shared-product-carousel.component';
import { SwipeDirectiveModule } from '@app/utils/directives/swipe.directive';
import { SelectLanguageModule } from "../../components/select-language/select-language.component";

@NgModule({
    declarations: [SharedProductCarouselComponent],
    exports: [SharedProductCarouselComponent],
    imports: [
        CommonModule,
        SwipeDirectiveModule,
        SelectLanguageModule
    ]
})
export class SharedProductCarouselModule
{
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }
  public resolveComponent(): ComponentFactory<SharedProductCarouselComponent>
  {
    return this.componentFactoryResolver.resolveComponentFactory(SharedProductCarouselComponent);
  }
}
