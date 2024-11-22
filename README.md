# GameHoster

This project is still in the development phase, we are looking for devlopers tp help us build it
so if you have some free time, consider assisting


Currently there is only development mode setup instructions, this is not a docker image, so you are required to setup you own database server preferrably mysql

Setup Process

Clone the project:
```
https://github.com/Zein010/GameHoster.git
```

## Server Side Setup
install node modules: 
``` ruby
npm i
```
Create .env file with the following contents:

```ruby
DATABASE_URL="[ConnectionString]"
JWT_SECRET="[JwtSecret]"
```

- Connection string: is the database connection string
- Jwt Secret: can be any string, make sure to make it long with characters, special characters and numbers

For database connection string examples check:
```
https://www.prisma.io/docs/orm/reference/connection-urls#format
```

run the following command to initialize prisma
```ruby
npx prisma migrate dev --name init
```
run the seed script

```ruby
npm run seed
```

## Client Side Setup
Go to client directory

install node modules: npm i

Create a .env file with the following content 
```ruby
VITE_API=[ServerIP|ServerHost:ServerPort]
VITE_PORT=[ClientPort]
VITE_HOST=[ClientHost]
```
- ServerIp | ServerHost: Is the ip of the server you are running the backend on
- ServerPort: Port of the backend project you are using
- Client Port: The port that the client will be running on
- Client Host: The Host that the client will be running on

