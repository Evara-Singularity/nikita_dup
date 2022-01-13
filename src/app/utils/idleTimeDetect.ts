class IdleTimer {
    timeout: any;
    onTimeout: any;
    eventHandler: any;
    interval: any;
    timeoutTracker: any;
    renderer2: any;
    listener;
    that;

    constructor({ timeout, onTimeout }, renderer2, that) {
        this.timeout = timeout;
        this.onTimeout = onTimeout;
        this.renderer2 = renderer2;
        this.that = that;

        this.eventHandler = this.updateExpiredTime.bind(this);
        this.tracker();
        this.startInterval();
    }

    startInterval() {
        this.updateExpiredTime();

        this.interval = setInterval(() => {
            const expiredTime = parseInt(localStorage.getItem("_expiredTime"), 10);
            if (expiredTime < Date.now()) {
                if (this.onTimeout) {
                    this.onTimeout();
                    this.cleanUpTimer();
                }
            }

        }, 1000);
    }

    updateExpiredTime() {
        if (this.timeoutTracker) {
            clearTimeout(this.timeoutTracker);
        }
        this.timeoutTracker = setTimeout(() => {
            localStorage.setItem("_expiredTime", (Date.now() + this.timeout * 1000).toString());
        }, 200);
    }

    tracker() {
        this.listener = this.renderer2.listen('window', 'scroll', () => {
            this.that.enableNudge = false;
            clearTimeout(this.timeoutTracker);
            this.timeoutTracker = setTimeout(() => {
                localStorage.setItem("_expiredTime", (Date.now() + this.timeout * 1000).toString());
            }, 200);
        });
        window.addEventListener("mousemove", this.eventHandler);
        window.addEventListener("scroll", this.eventHandler);
        window.addEventListener("keydown", this.eventHandler);
    }

    addIdleEventToClass(className) {
        const elements = window.document.getElementsByClassName(className)
        console.log('idle timer', className);
        this.listener = this.renderer2.listen(elements[0], 'scroll', () => {
            console.log('idle timer', 'scrolled========>');
            this.that.enableNudge = false;
            clearTimeout(this.timeoutTracker);
            this.timeoutTracker = setTimeout(() => {
                localStorage.setItem("_expiredTime", (Date.now() + this.timeout * 1000).toString());
            }, 200);
        });
    }

    cleanLocalStorage() {
        localStorage.removeItem("_expiredTime");
    }

    cleanUpTimer() {
        clearInterval(this.interval);
        this.listener();
        window.removeEventListener("mousemove", this.eventHandler);
        window.removeEventListener("scroll", this.eventHandler);
        window.removeEventListener("keydown", this.eventHandler);
    }
}
export default IdleTimer;
