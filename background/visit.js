import Storage from "./storage.js";

export class Visit {
    constructor(title, url, status, visitFromUrl, date, id) {
        this.title = title;
        this.url = url;
        this.status = status;

        this.visitFromUrl = visitFromUrl;

        if (date) {
            this.date = date;
        } else {
            this.date = new Date();
        }

        if (id == undefined) {
            this.id = this.uuidv4();
        } else {
            this.id = id;
        }
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    serializeJson() {
        return JSON.stringify(this);
    }

    fromJson(json) {
        return new Visit(json.title, json.url, json.status, json.visitFromUrl, json.date, json.id);
    }

    async save() {
        return Storage.put({
            title: this.title,
            url: this.url,
            visitFromUrl: this.visitFromUrl,
            date: this.date.getTime(),
            id: this.id,
        });
    }


    static getRecent() {
        let now = new Date();
        let hourago = new Date(now.getTime() - (1000*60*60));

        return Storage.queryDate(hourago.getTime(), now.getTime());
    }
}

// Store in indexed