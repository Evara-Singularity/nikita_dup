import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoaderService {

  private loaderState: Subject<boolean> = new Subject<boolean>();

  setLoaderState(status: boolean) {
    console.trace();
    this.loaderState.next(status);
  }

  getLoaderState(): Observable<boolean> {
    return this.loaderState.asObservable();
  }
}
