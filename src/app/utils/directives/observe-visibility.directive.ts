import { CommonModule, isPlatformBrowser, isPlatformServer } from "@angular/common";
import { AfterViewInit, Directive, ElementRef, EventEmitter, Inject, Input, NgModule, OnDestroy, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { Subject } from "rxjs";
import { delay, filter } from "rxjs/operators";

@Directive({
  selector: '[observeVisibility]',
})
export class ObserveVisibilityDirective
  implements OnDestroy, OnInit, AfterViewInit {
  isServer: boolean;
  isBrowser: boolean;

  @Input() debounceTime = 0;
  @Input() threshold = 1;

  @Output() visible: EventEmitter<HTMLElement> = new EventEmitter<HTMLElement>();

  private observer: IntersectionObserver | undefined;
  private subject$ = new Subject<{
    entry: IntersectionObserverEntry;
    observer: IntersectionObserver;
  }>();

  constructor(
    private element: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.createObserver();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.startObservingElements();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = undefined;
      }

      this.subject$.next();
      this.subject$.complete();
    }
  }

  private isVisible(element: HTMLElement) {
    return new Promise(resolve => {
      const observer = new IntersectionObserver(([entry]) => {
        resolve(entry.intersectionRatio === 1);
        observer.disconnect();
      });

      observer.observe(element);
    });
  }

  private createObserver() {
    const options = {
      rootMargin: '0px',
      threshold: this.threshold,
    };

    const isIntersecting = (entry: IntersectionObserverEntry) =>
      entry.isIntersecting || entry.intersectionRatio > 0;

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (isIntersecting(entry)) {
          this.subject$.next({ entry, observer });
        }
      });
    }, options);
  }

  private startObservingElements() {
    
    if (!this.observer) {
      return;
    }

    this.observer.observe(this.element.nativeElement);

    this.subject$
      .pipe(delay(this.debounceTime), filter(Boolean))
      .subscribe(async ({ entry, observer }) => {
        const target = entry.target;
        const isStillVisible = await this.isVisible(target);

        if (isStillVisible) {
          this.visible.emit(target);
          observer.unobserve(target);
        }
      });
  }
}

//exporting directive as an module
@NgModule({
  declarations: [ObserveVisibilityDirective],
  imports: [
      CommonModule
  ],
  exports: [ObserveVisibilityDirective],
})
export class ObserveVisibilityDirectiveModule { }