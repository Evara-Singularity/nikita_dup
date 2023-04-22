import { ArrayFilterPipeModule } from './../../utils/pipes/k-array-filter.pipe';
import { ComponentFactory, ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedProductCarouselComponent } from './shared-product-carousel.component';
import { SwipeDirectiveModule } from '@app/utils/directives/swipe.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  declarations: [SharedProductCarouselComponent],
  imports: [
    CommonModule,
    SwipeDirectiveModule,
    LazyLoadImageModule
  ],
  exports: [SharedProductCarouselComponent]
})
export class SharedProductCarouselModule
{
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }
  public resolveComponent(): ComponentFactory<SharedProductCarouselComponent>
  {
    return this.componentFactoryResolver.resolveComponentFactory(SharedProductCarouselComponent);
  }
}
