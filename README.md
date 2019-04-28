# prf-hotel-app
Availalbe on Heroku: https://prf-hotel-app.herokuapp.com

MongoDB is hosted by: https://cloud.mongodb.com

## In case of development:
- ```git clone https://github.com/csuvikv/prf-hotel-app```
- ```npm install```
- ```node index.js```

## If only the REST interface is needed:
Every returned JSON is in the following format:
```{status: "STATUS_CODE", reason: "REASONS", details: DETAILS}```
, where:
  - STATUS_CODE can be: ok/warning/error. In case of warning/error further information is returned (reason and details).
  - REASONS:
    - missing_parameters: missing parameters to run a query (warning)
    - database: database error (error)
    - duplicate_entry: duplicate key in the database (warning)
    - unauthorized: unauthorized acces (warning)
    - entity_not_found: the given entity cannot be found (warning)
  - DETAILS: a list or a JSON object, that helps understand the warning or error


- GET:
  - https://prf-hotel-app.herokuapp.com/testConnection: returns a JSON if the connection is ok
  - https://prf-hotel-app.herokuapp.com/users: lists users
    - you should be logged in with admin privileges: ```{"username": "admin", "password": "admin"}```
  - https://prf-hotel-app.herokuapp.com/hotels: lists hotels
  - https://prf-hotel-app.herokuapp.com/user: returns detailed information from a user
    - you should be logged in
    - the request body should contain at least the following parameters: username
  - https://prf-hotel-app.herokuapp.com/user: returns detailed information from a hotel
    - the request body should contain at least the following parameters: qname
  - https://prf-hotel-app.herokuapp.com/logged-in-user: returns detailed information of the logged in user
    - you should be logged in
- POST:
  - https://prf-hotel-app.herokuapp.com/register: registers a new user
    - the request body should contain at least the following parameters: username, passsword
  - https://prf-hotel-app.herokuapp.com/login: logs in a user
    - the request body should contain at least the following parameters: username, passsword
  - https://prf-hotel-app.herokuapp.com/logout: logs out the user
  - https://prf-hotel-app.herokuapp.com/new-hotel: creates a new hotel
    - the request body should contain at least the following parameters: qname
    - you should be logged in with admin privileges
  - https://prf-hotel-app.herokuapp.com/reservate: reserves a room in a hotel for a user
    - the request body should contain at least the following parameters: hotel (qname), user (username), room_number
    - you should be logged in
- PUT:
  - https://prf-hotel-app.herokuapp.com/invalidate-reservation: invalidates a reservation
    - the request body should contain at least the following parameters: hotel (qname), user (username), room_number
    - you should be logged in with admin privileges
  - https://prf-hotel-app.herokuapp.com/hotel: updates a hotel
    - the request body should contain at least the following parameters: qname
    - you should be logged in with admin privileges
  - https://prf-hotel-app.herokuapp.com/user: updates a user
    - the request body should contain at least the following parameters: username
    - you should be logged in
- DELETE:
  - https://prf-hotel-app.herokuapp.com/user: deletes a user
    - the request body should contain at least the following parameters: username
    - you should be logged in with admin privileges
  - https://prf-hotel-app.herokuapp.com/hotel: deletes a hotel
    - the request body should contain at least the following parameters: qname
    - you should be logged in with admin privileges
