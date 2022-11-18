import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsWidgetWrapperComponent } from './analytics-widget-wrapper.component';
import { AnalyticsGraphWidgetModule } from '../analytics-graph-widget/analytics-graph-widget.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';

@NgModule({
  declarations: [AnalyticsWidgetWrapperComponent],
  imports: [
    CommonModule,
    AnalyticsGraphWidgetModule,
    ObserveVisibilityDirectiveModule
  ],
  exports:[
    AnalyticsWidgetWrapperComponent
  ]
})
export class AnalyticsWidgetWrapperModule { }
