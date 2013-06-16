# API

## Example JSON document
```javascript
{
  id: "d6bf0e29e2324aab15e022cf17711337", // set by CouchDB
  ctime: "2013-05-11T14:31:06.947Z",      // set by update handler, creation time
  mtime: "2013-05-14T15:11:25.113Z",      // set by update handler, modification time
  uid: "emma1337",                        // set by update handler, only this user 
                                          // can change this document
  question: "kann man bei emma schon ein kaffeechen trinken?", // mandatory
  value: true,                    // mandatory, true oder false
  value_text: "yes",              // optional
  location: {                     // optional
    text: "Parkplatz, TU Berlin", // optional, text description of location
    lat: 52.03,                   // optional, latitude between [-180,180]
    lon: 11.105                   // optional, longitude between [-90,90]
  },
  timeout: 3600                   // optional, in seconds from mtime
}
```
