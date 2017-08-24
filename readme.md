# URL Fetcher

## Purpose
Allows user to queue up URL

### Installing Dependencies & Starting
From the root directory
```
npm install
npm start
```

### Usage
To queue urls:
```
POST http://localhost:3000/new
Include JSON object with URL - {"url":"http://www.google.com"}
```

To retrieve urls:
```
GET http://localhost:3000/retrieve/#
# - Ticket Number
```

To activate worker:
```
POST http://localhost:3000/test
```
