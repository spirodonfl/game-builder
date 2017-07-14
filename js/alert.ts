class cALERT {
    private static _instance: cALERT;
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    isShowing: boolean;
    divs: IHashOfHtmlDivElements;
    buttons: IHashOfHtmlButtonElements;

    divIDs: Array<string>;
    buttonIDs: Array<string>;

    initialize() {
        this.isShowing = false;
        this.divs = {};
        this.buttons = {};

        this.divIDs = ['alert_overlay', 'window_alert', 'window_alert_title', 'window_alert_content'];
        for (let w = 0; w < this.divIDs.length; ++w) {
            let id = this.divIDs[w];
            let elementWindow = SF.gei(id);
            if (elementWindow instanceof HTMLElement) {
                this.divs[id] = <HTMLDivElement>elementWindow;
            }
        }

        this.buttonIDs = ['window_alert_ok'];
        for (let b = 0; b < this.buttonIDs.length; ++b) {
            let id = this.buttonIDs[b];
            let elementButton = SF.gei(id);
            if (elementButton instanceof HTMLElement) {
                this.buttons[id] = <HTMLButtonElement>elementButton;
            }
        }

        this.buttons['window_alert_ok'].addEventListener('click', this.okClicked.bind(this));
    }
    okClicked() {
        this.hideAlert();
    }
    showAlert(message: string, title?: string) {
        this.divs['window_alert_content'].innerHTML = message;
        if (title) {
            this.divs['window_alert_title'].innerHTML = title;
        }
        this.divs['alert_overlay'].style.display = 'block';
        this.divs['window_alert'].style.display = 'block';
        this.isShowing = true;
    }
    hideAlert() {
        this.isShowing = false;
        this.divs['alert_overlay'].style.display = 'none';
        this.divs['window_alert'].style.display = 'none';
    }
}

let ALERT = cALERT.Instance;
ALERT.initialize();