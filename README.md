# prf-hotel-app
Availalbe on Heroku: https://prf-hotel-app.herokuapp.com

## In case of development:
- ```git clone https://github.com/csuvikv/prf-hotel-app```
- ```npm install```
- ```node index.js```

## If only the REST interface is needed:
- GET:
  - https://prf-hotel-app.herokuapp.com/testConnection: returns a JSON if the connection is ok
  - https://prf-hotel-app.herokuapp.com/: returns a string, which value depends on authentication
  - https://prf-hotel-app.herokuapp.com/users: lists users
- POST:
  - https://prf-hotel-app.herokuapp.com/register: registers a new user
    - the request body should contain the password and username
  - https://prf-hotel-app.herokuapp.com/login: logs in a user
    - the request body should contain the password and username
  - https://prf-hotel-app.herokuapp.com/logout: logs out the user
  
    
