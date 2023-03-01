import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Injector, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';

@Component({
  selector: 'bulk-rquest-form-popup-lazy',
  templateUrl: './bulk-rquest-form-popup-lazy.component.html',
  styleUrls: ['./bulk-rquest-form-popup-lazy.component.scss'],
})
export class BulkRquestFormPopupLazyComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() usedInModule: 'CATEGORY' | 'HOME' = 'HOME';
  // ondemad loaded components for pincode servicibility check
  bulkRfqComponent = null;
  @ViewChild("bulkRfqForm", { read: ViewContainerRef })
  bulkRfqFormContainerRef: ViewContainerRef;

  constructor(
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private loader: GlobalLoaderService,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    if (this.commonService.isBrowser) {
      this.commonService.initiateBulkRfqStatus().subscribe(status => {
        if (status) {
          this.loader.setLoaderState(true);
          this.onVisiblePincodeSection();
        } else {
          this.deleteComponent();
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.deleteComponent();
  }

  async onVisiblePincodeSection() {
    const { BulkRquestFormPopupComponent } = await import(
      "../bulk-rquest-form-popup/bulk-rquest-form-popup.component"
    ).finally(() => {
      this.loader.setLoaderState(false);
    });
    const factory = this.cfr.resolveComponentFactory(
      BulkRquestFormPopupComponent
    );
    this.bulkRfqComponent = this.bulkRfqFormContainerRef.createComponent(
      factory,
      null,
      this.injector
    );
    (
      this.bulkRfqComponent.instance[
      "closePopup$"
      ] as EventEmitter<boolean>
    ).subscribe((status) => {
      this.deleteComponent();
    });

  }

  deleteComponent() {
    console.log('deleteComponent', )
    this.bulkRfqComponent = null;
    this.bulkRfqFormContainerRef.remove();
  }

  loadBulkRFQ(){
    this.commonService.initiateBulkRfq(true);
  }


}
