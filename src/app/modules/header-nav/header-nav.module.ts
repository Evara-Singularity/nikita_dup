import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderNavComponent } from './header-nav.component';
import { RouterModule } from '@angular/router';
import { TypeAheadService } from '../../utils/services/typeAhead.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeFixedHeaderModule } from '@app/components/home-fixed-header/home-fixed-header.module';
@NgModule({
  declarations: [HeaderNavComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HomeFixedHeaderModule
  ],
  exports: [
    HeaderNavComponent,
  ],
  providers: [
    TypeAheadService
  ]
})

export class HeaderNavModule { 
}
