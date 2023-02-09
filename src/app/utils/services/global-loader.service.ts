import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoaderService {

  private loaderState: Subject<boolean> = new Subject<boolean>();
  public state: boolean = false;

  setLoaderState(status: boolean) {
    this.state = status;
    this.loaderState.next(status);
  }

  getLoaderState(): Observable<boolean> {
    return this.loaderState.asObservable();
  }
}
