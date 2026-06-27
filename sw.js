"use strict";
// Service worker for Lukify's Punkte – caches only the static app shell.
// It never touches localStorage; all app data stays in localStorage as before.
//
// Strategie:
// - HTML/Navigation: network-first (online immer die frische Seite, offline aus dem Cache).
//   So kommen Updates ohne haengenden Cache an.
// - Restliche Shell-Dateien (Icons, Manifest): cache-first mit Netz-Fallback.
// Bei Aenderungen an der App die Versionsnummer erhoehen (lukify-vN), damit alte Caches
// aufgeraeumt und die neuen Dateien geladen werden.
var CACHE = "lukify-v3";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isHTML(req) {
  return req.mode === "navigate" ||
    (req.headers.get("accept") || "").indexOf("text/html") !== -1;
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  if (isHTML(req)) {
    // Network-first fuer die App-Seite: online frisch, offline aus dem Cache.
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put("./index.html", copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match("./index.html"); });
      })
    );
    return;
  }

  // Cache-first fuer statische Dateien (Icons, Manifest) mit Netz-Fallback.
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
