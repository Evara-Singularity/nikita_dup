import { ErrorHandler, Injectable, NgZone } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private zone: NgZone) {}

  handleError(error: Error) {

    
    this.zone.run(() => {
        console.log('inside zone run ===>');
        console.log(JSON.stringify(error));
        console.log(error.message);
        console.log('=====> end of run zone');
    });

    console.log("Error from global error handler", JSON.stringify(error));
  }
}