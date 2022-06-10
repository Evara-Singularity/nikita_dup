import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderNavComponent } from './header-nav.component';
import { RouterModule } from '@angular/router';
import { TypeAheadService } from '../../utils/services/typeAhead.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeFixedHeaderModule } from '@app/components/home-fixed-header/home-fixed-header.module';
import { HomeExpandedHeaderModule } from '@app/components/home-expanded-header/home-expanded-header.module';
import { PlpFixedHeaderModule } from '@app/components/plp-fixed-header/plp-fixed-header.module';
import { DashboardHeaderModule } from '@app/components/dashboard-header/dashboard-header.module';
import { CartHeaderModule } from '@app/components/cart-header/cart-header.module';
@NgModule({
  declarations: [HeaderNavComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HomeFixedHeaderModule,
    HomeExpandedHeaderModule,
    PlpFixedHeaderModule,
    DashboardHeaderModule,
    CartHeaderModule,
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
