var lib = {
  // (A) INIT
  iDB : null, iTX : null, iName : "MyLib", // idb object & transaction
  hForm : null, hID : null, hCode : null, // html elements
  hTitle : null, hAuthor : null, hLoc : null, hList : null,
  init : () => {
    // (A1) IDB SUPPORT CHECK
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    if (!window.indexedDB) {
      alert("Your browser does not support indexed database.");
      return false;
    }

    // (A2) OPEN "MYLIB" DATABASE
    let req = window.indexedDB.open(lib.iName, 1);

    // (A3) ON DATABASE ERROR
    req.onerror = (evt) => {
      alert("Indexed DB init error - " + evt.message);
      console.error(evt);
    };

    // (A4) UPGRADE NEEDED
    req.onupgradeneeded = (evt) => {
      // (A4-1) INIT UPGRADE
      lib.iDB = evt.target.result;
      lib.iDB.onerror = (evt) => {
        alert("Indexed DB upgrade error - " + evt.message);
        console.error(evt);
      };

      // (A4-2) VERSION 1
      if (evt.oldVersion < 1) {
        let store = lib.iDB.createObjectStore(lib.iName, {
          keyPath: "id",
          autoIncrement: true
        });
        store.createIndex("code", "code");
        store.createIndex("title", "title");
        store.createIndex("author", "author");
      }
    };

    // (A5) OPEN DATABASE OK
    req.onsuccess = (evt) => {
      // (A5-1) REGISTER IDB OBJECTS
      lib.iDB = evt.target.result;
      lib.iTX = () => {
        return lib.iDB
        .transaction(lib.iName, "readwrite")
        .objectStore(lib.iName);
      };

      // (A5-2) GET HTML ELEMENTS
      lib.hForm = document.getElementById("libFormWrap");
      lib.hID = document.getElementById("formID");
      lib.hCode = document.getElementById("formCode");
      lib.hTitle = document.getElementById("formTitle");
      lib.hAuthor = document.getElementById("formAuthor");
      lib.hLoc = document.getElementById("formLoc");
      lib.hList = document.getElementById("libList");

      // (A5-3) DRAW BOOKS LIST
      lib.draw();
    };
  },

  // (B) TOGGLE ADD/EDIT MEDIA FORM
  toggle : (id) => {
    // (B1) HIDE FORM
    if (id == false) {
      lib.hID.value = "";
      lib.hCode.value = "";
      lib.hTitle.value = "";
      lib.hAuthor.value = "";
      lib.hLoc.value = "";
      lib.hForm.classList.remove("show");
    }

    // (B2) SHOW FORM
    else {
      // (B2-1) "EDIT" MODE
      if (Number.isInteger(id)) {
        let req = lib.iTX().get(id);
        req.onsuccess = (evt) => {
          lib.hID.value = id;
          lib.hCode.value = req.result.code;
          lib.hTitle.value = req.result.title;
          lib.hAuthor.value = req.result.author;
          lib.hLoc.value = req.result.location;
        };
      }

      // (B2-2) SHOW FORM
      lib.hForm.classList.add("show");
    }
  },

  // (C) ADD A NEW BOOK
  add : () => {
    // (C1) DATA TO SAVE
    let data = {
      id : lib.hID.value,
      code : lib.hCode.value,
      title : lib.hTitle.value,
      author : lib.hAuthor.value,
      location : lib.hLoc.value
    };

    // (C2) SAVE OR UPDATE
    if (data.id == "") {
      delete data.id;
      lib.iTX().add(data);
    } else {
      data.id = parseInt(data.id);
      lib.iTX().put(data);
    }

    // (C3) DONE
    lib.toggle(false);
    lib.draw();
    return false;
  },

  // (D) DELETE ENTRY
  del : (id) => { if (confirm(`Delete ${id}?`)) {
    // (D1) DELETE BOOK
    lib.iTX().delete(id);

    // (D2) REDRAW LIST
    lib.draw();
  }},

  // (E) DRAW BOOKS LIST
  draw : () => {
    lib.hList.innerHTML = "";
    lib.iTX().getAll().onsuccess = (evt) => { for (let book of evt.target.result) {
      let row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<div class="binfo">
        <div>
          <i class="mi">numbers</i> ${book.id}
           : 
          pin number : ${book.code}
        </div>
        <div>
          <i class="mi">menu_book</i> :
          Book name : ${book.title}
        </div>
        <i class="mi">person_outline</i> :
        Author : ${book.author}
        <br>
        <i class="mi">room</i>:
        Location : ${book.location}
      </div>
      <input type="button" class="mi bh" value="delete" onclick="lib.del(${book.id})"/>
      <input type="button" class="mi bh" value="edit" onclick="lib.toggle(${book.id})"/>`;
      lib.hList.appendChild(row);
    }};
  }
};
window.addEventListener("DOMContentLoaded", lib.init);
