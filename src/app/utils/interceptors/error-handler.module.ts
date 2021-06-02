import { CommonModule } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { GlobalErrorHandler } from "./global-error-handler";

@NgModule({
    declarations: [],
    imports: [CommonModule],
    
    // register the classes for the error interception here
    providers: [
      { 
        // processes all errors
        provide: ErrorHandler, 
        useClass: GlobalErrorHandler 
      }
    ]
  })
  export class ErrorHandlerModule {}