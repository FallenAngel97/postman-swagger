# Postman Swagger module

This package spins up express server, which converts all your postman collections in the swagger documentation
Run in terminal following:

```bash
npx @decodeapps/postman-swagger -d ./directory-with-postman-collections
```

### Configuration options:

```bash
-p # port, which server listens to. Also reads from process.env.PORT environment variable
-d # path to the directory, where located postman collections
```
