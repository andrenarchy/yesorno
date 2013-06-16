# API

## Example JSON document
```javascript
{
  question: "kann man bei emma schon ein kaffeechen trinken?",
  value: true, // true oder false!
  value_text: "yes", // optional
  location: { // optional
    text: "Parkplatz, TU Berlin",
    lat: 13.105,
    lon: 52.03
  },
  ctime: "2013-05-11T14:31:06.947Z",
  mtime: "2013-05-14T15:11:25.113Z",
  timeout: 3600, // in seconds from mtime
  uid: "emma1337", // only this user can change this document
}
```
