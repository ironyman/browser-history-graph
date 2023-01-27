import Storage from "./storage.js";

export class Visit {
  constructor({ title, url, fromUrl, status, date, id, fromId }) {
    this.title = title;
    this.url = url;
    this.status = status;
    this.fromUrl = fromUrl;
    this.fromId = fromId;

    if (date) {
      this.date = date;
    } else {
      this.date = new Date();
    }

    if (id) {
      this.id = id;
    } else {
      this.id = this.uuidv4();
    }
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  serializeJson() {
    return JSON.stringify(this);
  }

  fromJson(json) {
    return new Visit({
      title: json.title,
      url: json.url,
      fromUrl: json.fromUrl,
      status: json.status,
      date: json.date,
      id: json.id,
      fromId: json.fromId
    });
  }

  async save() {
    return Storage.put({
      title: this.title,
      url: this.url,
      fromUrl: this.fromUrl,
      date: this.date.getTime(),
      id: this.id,
      fromId: this.fromId,
    });
  }

  static async getRecent() {
    let now = new Date();
    let hourago = new Date(now.getTime() - (1000 * 60 * 60));

    return Storage.queryDate(hourago.getTime(), now.getTime());
  }

  static async getById(id) {
    return Storage.get(id).then(res => new Visit(res));
  }

  static async getByFromId(fromId) {
    return Storage.queryFromId(fromId);

  }
}