import { ArrayFilterPipeModule } from './../../utils/pipes/k-array-filter.pipe';
import { ComponentFactory, ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedProductCarouselComponent } from './shared-product-carousel.component';

@NgModule({
  declarations: [SharedProductCarouselComponent],
  imports: [
    CommonModule,
    ArrayFilterPipeModule
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
