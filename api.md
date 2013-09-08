# REST/CRUD API

The following documentation uses the ```APIURL``` for the actual installation. The
default installation's ```APIURL``` is ```http://yesorno.it/```

## yesorno documents
### Example JSON document
```javascript
{
  "_id": "istemmaschonda",                   // set by CouchDB
  "type": "yesorno,
  "ctime": "2013-05-11T14:31:06.947Z",       // set by update handler, creation time
  "mtime": "2013-05-14T15:11:25.113Z",       // set by update handler, modification time
  "user": "emma1337",                        // set by update handler, only this user
                                             // can change this document
  "question": "Kann man bei Emma schon ein Kaffeechen trinken?", // mandatory
  "answer": true,                    // mandatory, true oder false
  "answer_true": "Hell yeah!",       // mandatory
  "answer_false": "Damn, no!",       // mandatory
  "location": {                      // optional
    "text": "Parkplatz, TU Berlin",  // optional, text description of location
    "lat": 52.03,                    // optional, latitude between [-180,180]
    "lon": 11.105                    // optional, longitude between [-90,90]
  },
  "timeout": 3600                    // optional, in seconds from mtime
}
```

### Create
Issue a `PUT` request to `_yesorno/ID`. curl example:
```
curl -X POST APIURL/_yesorno/istemmaschonda -d '{
  "type": "yesorno",
  ...
}
```

### Read
Issue a `GET` request to `_yesorno/ID`. curl example:
```
curl -X GET APIURL/_yesorno/istemmaschonda
```
The document's JSON is returned.

### Update
Same as create except that the `_rev` property has to be included. curl
example:
```
curl -X PUT APIURL/_yesorno/istemmaschonda -d {
  "_id": "istemmaschonda",
  "_rev": "5-ad3463b0a4270dfcbcc71867c7615e6",
  "type": "yesorno",
  ...
}
```

### Delete
Issue a `DELETE` request to `_yesorno/ID?rev=REV`. curl example:
```
curl -X DELETE APIURL/_yesorno/istemmaschonda?rev=5-ad346
```
