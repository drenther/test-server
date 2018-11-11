# basic express server with auth system

- basic signup and login system (name, email, password)
- naive double cookie submit for CSRF protection
- httpOnly auth cookie for basic XSS protection
- one public GET route and one private GET route

## setup

create a .env file in the root directory with following key value pair

```env
PORT
MONGO_URL
JWT_SECRET
JWT_ISSUER
JWT_AUDIENCE
```

install dependencies

```shell
npm install
```

run dev server

```shell
npm run dev
```
