import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, NgModule, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';


@Component({
	selector: 'fresh-chat',
	template: '',
})
export class FreshChat implements AfterViewInit {
	constructor() {};
    text = `window.prechatTemplate = {
        "SubmitLabel": "Start Chat",
        "fields": {
          "0": {
            "error": "Please Enter a valid name",
            "fieldId": "name",
            "label": "Name",
            "required": "yes",
            "type": "text"
          },
          "1": {
            "error": "Please Enter a valid Email",
            "fieldId": "email",
            "label": "Email",
            "required": "yes",
            "type": "email"
          },
          "2": {
            "error": "Please Enter a valid Phone Number",
            "fieldId": "phone",
            "label": "Phone",
            "required": "no",
            "type": "phone"
          }
        },
        "heading": "Chat with Us",
        "mainbgColor": "#e30e2d",
        "maintxColor": "#fff",
        "textBanner": "We can't wait to talk to you. But first, please take a couple of moments to tell us a bit about yourself."
      };
      window.fcSettings = {
        "config": {
          "cssNames": {
            "expanded": "custom_fc_expanded",
            "widget": "custom_fc_frame"
          }
        },
        "host": "https://moglicustomerservice.freshchat.com",
        "token": "d6cabf88-e82c-4c68-ac49-c51203aa34a1",
        "externalId": "{{localstorage userId mobile}}",
        "onInit": function () {
          window.fcPreChatform.fcWidgetInit(window.prechatTemplate);
          if( (window.location.href.indexOf('quickorder') != -1) || (window.location.href.indexOf('checkout') != -1 ) || (window.location.href.indexOf('/mp/') != -1) || (window.location.href.indexOf('login') != -1 )){
            window.fcWidget.hide();
          }
        }
      };`
    scriptUrls = [
        this.text,
        'https://snippets.freshchat.com/js/fc-pre-chat-form-v2.js',
        'https://moglicustomerservice.freshchat.com/js/widget.js',
    ]
    ngAfterViewInit() {
        if(!this.isScriptLoaded(this.scriptUrls[1])) {
            this.loadFreshChatScripts();
        }
    }

    isScriptLoaded(url: string): boolean {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src === url) {
                return true;
            }
        }
        return false;
    }

    loadFreshChatScripts(){
        from(this.scriptUrls)
        .pipe(
          concatMap((url) => {
              return this.loadScript(url);
          })
        )
        .subscribe(
          () => {
            console.log('Script loaded successfully');
          },
          (error) => {
            console.error('Failed to load script:', error);
          },
          () => {
              console.log('All scripts loaded');
          }
        );
     }

     loadScript(urlOrText: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          if (urlOrText.startsWith('http')) {
            // If the input is a URL (starts with 'http'), treat it as a script with 'src' attribute
            script.src = urlOrText;
            script.onload = () => resolve();
            script.onerror = () => reject();
          } else {
            // If the input is not a URL, treat it as a script with 'text' content
            script.type = 'text/javascript';
            script.text = urlOrText;
            const observer = new MutationObserver(() => {
              if (Array.from(document.scripts).find((s) => s === script)) {
                observer.disconnect();
                resolve();
              }
            });
            observer.observe(document.head, { childList: true });
          }
          document.head.appendChild(script);
        });
      }    
}

@NgModule({
	declarations: [FreshChat],
	imports: [CommonModule],
	exports: [FreshChat]
})
export class FreshChatModule {}
