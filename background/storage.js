import { Visit } from "./visit.js";

let DB;

// export default {
let Storage = {
  init: () => {
    const request = window.indexedDB.open("visits", 1);
    request.onupgradeneeded = e => {
      const db = request.result;
      const store = db.createObjectStore("visits", {
        keyPath: "id"
      });

      store.createIndex("fromUrl", "fromUrl");
      store.createIndex("fromId", "fromId");
      store.createIndex("url", "url");
      store.createIndex("date", "date");
    };

    return new Promise(resolve => {
      request.onsuccess = e => {
        DB = request.result;
        // console.log("=>init()", e);
        resolve(e);
      };
      request.onerror = e => {
        console.log("storage failed init()", e);
      };
    });
  },

  put: visit => {
    // log.log(logDir, "put()", session);
    // console.log("Putting ", typeof visit);
    const db = DB;
    const transaction = db.transaction("visits", "readwrite");
    const store = transaction.objectStore("visits");
    const request = store.put(visit);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        // log.log(logDir, "=>put()", "success");
        resolve();
      };
      request.onerror = e => {
        // log.error(logDir, "put()", e.target);
        reject(e.target);
      };
    });
  },

  delete: id => {
    log.log(logDir, "delete()", id);
    const db = DB;
    const transaction = db.transaction("visits", "readwrite");
    const store = transaction.objectStore("visits");
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        log.log(logDir, "=>delete()", "complete");
        resolve();
      };
      transaction.onerror = e => {
        log.error(logDir, "delete()", e.target);
        reject(e.target);
      };
    });
  },

  deleteAll: () => {
    log.log(logDir, "deleteAll()");
    DB.close("visits");

    const request = window.indexedDB.deleteDatabase("visits");

    return new Promise(resolve => {
      request.onsuccess = () => {
        log.log(logDir, "=>deleteAll()", "success");
        resolve(visits.init());
      };
      request.onerror = e => {
        log.error(logDir, "deleteAll()", e);
        reject(e);
      };
    });
  },

  get: id => {
    // log.log(logDir, "get()", id);
    const db = DB;
    const transaction = db.transaction("visits", "readonly");
    const store = transaction.objectStore("visits");
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          //   log.log(logDir, "=>get()", request.result);
          resolve(request.result);
        } else reject(request);
      };
      request.onerror = e => {
        // log.error(logDir, "get()", e);
        reject(request);
      };
    });
  },
  // I don't think this works.
  open: async () => {
    const dbPromise = window.indexedDB.open('History', 1, function (upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          if (!upgradeDb.objectStoreNames.contains('visits')) {
            const store = upgradeDb.createObjectStore("visits", {
              keyPath: "id"
            });

            store.createIndex("fromUrl", "fromUrl", { unique: false });
            store.createIndex("url", "url", { unique: false });
            store.createIndex("date", "date", { unique: false });
          }

        //   case 1:
        //     const peopleStore = upgradeDb.transaction.objectStore('store');
        //     peopleStore.createIndex('price', 'price');
      }
    });
    return dbPromise;
  },
  put2(visit) {
    return Storage.open()
      .then(function (db) {
        const tx = db.transaction('visits', 'readwrite');
        const store = tx.objectStore('visits');
        store.put(visit);
        return tx.complete;
      })
      .then(function () {
        console.log('Added item to the store!');
      });
  },

  queryDate: async (lower, upper) => {
    if (lower === '' && upper === '') {
      return;
    }

    let range;
    if (lower !== '' && upper !== '') {
      range = IDBKeyRange.bound(lower, upper);
    } else if (lower === '') {
      range = IDBKeyRange.upperBound(upper);
    } else {
      range = IDBKeyRange.lowerBound(lower);
    }

    const tx = DB.transaction(['visits'], 'readonly');
    const store = tx.objectStore('visits');
    const index = store.index('date');

    return new Promise(resolve => {
      let result = [];
      // no range means all https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/index
      index.openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor) {
          resolve(result);
          return;
        }

        // This is the date
        // console.log('Cursored at:', cursor.key);
        // for (const field in cursor.value) {
          // console.log(field, cursor.value[field]);
        // }
        // console.log("twf", cursor.value.url);
        result.push(new Visit(cursor.value));
        return cursor.continue();
      };
    });
  },
  queryFromId: async (fromId) => {

    const tx = DB.transaction(['visits'], 'readonly');
    const store = tx.objectStore('visits');
    const index = store.index('fromId');

    return new Promise(resolve => {
      let result = [];
      // for multiple indices https://stackoverflow.com/questions/16501459/javascript-searching-indexeddb-using-multiple-indexes
      //  objectStore.index('ssn, email, age').get(['444-44-4444', 'bill@bill@company.com', 30])
      index.get(fromId).onsuccess = (event) => {
        resolve(event.result);
        return;
      };
    });
  }
}
export default Storage;