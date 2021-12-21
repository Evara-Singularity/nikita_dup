
class IdleTimer {

    timeout: any;
    onTimeout: any;
    eventHandler: any;
    interval: any;
    timeoutTracker: any;

    constructor({ timeout, onTimeout }) {
        this.timeout = timeout;
        this.onTimeout = onTimeout;

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
                    this.cleanUp();
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
        }, 300);
    }

    tracker() {
        window.addEventListener("mousemove", this.eventHandler);
        window.addEventListener("scroll", this.eventHandler);
        window.addEventListener("keydown", this.eventHandler);
    }

    cleanUp() {
        clearInterval(this.interval);
        window.removeEventListener("mousemove", this.eventHandler);
        window.removeEventListener("scroll", this.eventHandler);
        window.removeEventListener("keydown", this.eventHandler);
    }
}
export default IdleTimer;
