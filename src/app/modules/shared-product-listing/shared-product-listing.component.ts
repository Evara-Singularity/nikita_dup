import { EventEmitter, Component, Input, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { ProductListingDataEntity } from '@app/utils/models/product.listing.search';

@Component({
  selector: 'shared-product-listing',
  templateUrl: './shared-product-listing.component.html',
  styleUrls: ['./shared-product-listing.component.scss']
})
export class SharedProductListingComponent implements OnInit {
  private filterInstance = null;
  @ViewChild('filter', { read: ViewContainerRef }) filterContainerRef: ViewContainerRef;

  private sortByInstance = null;
  @ViewChild('sortBy', { read: ViewContainerRef }) sortByContainerRef: ViewContainerRef;

  @Input() productsListingData: ProductListingDataEntity;

  constructor(private _componentFactoryResolver: ComponentFactoryResolver, private _injector: Injector) { }

  ngOnInit(): void {
  }

  async filterUp() {
    if (!this.filterInstance) {
        const { FilterComponent } = await import('@app/components/filter/filter.component').finally(() => {
            setTimeout(() => {
                const mob_filter = document.querySelector('.mob_filter');
                if (mob_filter) {
                    mob_filter.classList.add('upTrans');
                }
            }, 0);
        });
        const factory = this._componentFactoryResolver.resolveComponentFactory(FilterComponent);
        this.filterInstance = this.filterContainerRef.createComponent(factory, null, this._injector);
        this.filterInstance.instance['filterData'] = this.productsListingData.filterData;
        (this.filterInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
            this.filterUp();
        });
    } else {
        const mob_filter = document.querySelector('.mob_filter');

        if (mob_filter) {
            mob_filter.classList.toggle('upTrans');
        }
    }
  }

  async toggleSortBy() {
    if (!this.sortByInstance) {
        const { SortByComponent } = await import('@app/components/sortBy/sortBy.component');
        const factory = this._componentFactoryResolver.resolveComponentFactory(SortByComponent);
        this.sortByInstance = this.sortByContainerRef.createComponent(factory, null, this._injector);

        (this.sortByInstance.instance['toggleFilter'] as EventEmitter<any>).subscribe(data => {
            this.toggleSortBy();
        });
    } else {
        const sortByFilter = document.querySelector('sort-by');

        if (sortByFilter) {
            sortByFilter.classList.toggle('open');
        }
    }
}

  resetLazyComponents() {
    if (this.filterInstance) {
        this.filterInstance = null;
        this.filterContainerRef.remove();
    }

    if (this.sortByInstance) {
      this.sortByInstance = null;
      this.sortByContainerRef.remove();
    }
  }

  ngOnDestroy() {
    this.resetLazyComponents();
  }

}
