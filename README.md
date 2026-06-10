# Express Store Solution

This project is a practice Express.js backend for a small optical store. It uses
plain JavaScript, ES Modules with `import` and `export`, and JSON files as a
simple database.

Repository: [yosefhaim707/project-express-server-week-4.git](https://github.com/yosefhaim707/project-express-server-week-4.git)

The goal of the project is to practice:

- Building routes with Express
- Reading request bodies, headers, and query params
- Returning JSON responses
- Using middleware
- Handling errors
- Saving and reading data from files
- Hashing passwords with `bcryptjs`
- Protecting routes with auth tokens

## How To Run

Install dependencies:

```powershell
npm install
```

Create a local `.env` file. This file should stay local and should not be
committed to git.

```env
PORT=3000
DB_BASE_PATH=./db
STARTING_BALANCE=500
TOKEN_EXPIRATION_MINUTES=60
```

Start the server:

```powershell
npm start
```

The server runs at:

```text
http://localhost:3000
```

## Project Architecture

The project is split into small folders so each part has one clear job.

```text
project-express-server-week-4/
  db/
    users.db.json
    products.db.json
    orders.db.json
  src/
    app.js
    server.js
    dal/
      dbReader.js
    middleware/
      authMiddleware.js
    routes/
      accountRoutes.js
      authRoutes.js
      cartRoutes.js
      orderRoutes.js
      productRoutes.js
    utils/
      asyncHandler.js
      cartUtils.js
      dataParse.js
      httpError.js
  .env.example
  package.json
  README.md
  students-instructions.md
```

## How A Request Moves Through The App

This is the main flow for almost every request:

1. `src/server.js` starts the server.
2. `src/app.js` receives the request.
3. `express.json()` parses JSON request bodies.
4. `src/app.js` sends the request to the correct route file.
5. If the route is protected, `requireAuth` checks the token first.
6. The route reads or writes data through `dbReader.js`.
7. The route sends a JSON response back to the user.
8. If something fails, the error handler in `app.js` sends an error response.

Example:

```text
POST /cart/items
  -> app.js
  -> requireAuth middleware
  -> cartRoutes.js
  -> dbReader.js reads users/products
  -> cartRoutes.js updates the user's cart
  -> dbReader.js saves users
  -> response is sent back as JSON
```

## What Each Main File Does

### `src/server.js`

This is the entry point of the app.

It:

- Loads environment variables from `.env`
- Imports the Express app from `app.js`
- Reads the port from `process.env.PORT`
- Starts listening for requests

The server starts when you run:

```powershell
npm start
```

### `src/app.js`

This file creates and configures the Express app.

It:

- Enables JSON request bodies with `express.json()`
- Defines simple public routes like `/` and `/health`
- Connects all route groups:
  - `/auth`
  - `/products`
  - `/cart`
  - `/account`
  - `/orders`
- Protects private routes with `requireAuth`
- Handles unknown routes with a 404 response
- Handles errors in one central place

This file is the main traffic controller of the API.

### `src/dal/dbReader.js`

`dal` means Data Access Layer.

This file is responsible for reading and writing the JSON database files. The
route files do not need to know the exact file paths. They call simple helper
functions instead.

It exports:

- `readUsers()`
- `saveUsers(users)`
- `readProducts()`
- `saveProducts(products)`
- `readOrders()`
- `saveOrders(orders)`

The database folder comes from:

```text
DB_BASE_PATH=./db
```

That means the path is not hardcoded inside the route logic.

### `src/middleware/authMiddleware.js`

This file protects routes that require login.

It checks the `Authorization` header:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

The middleware:

1. Reads the token from the header.
2. Looks for a user with that token.
3. Checks if the token expired.
4. Adds the user to `request.user`.
5. Adds the full users array to `request.users`.
6. Allows the request to continue.

If the token is missing, invalid, or expired, the request is rejected before it
gets to the route handler.

### `src/routes/authRoutes.js`

This file handles signup and login.

`POST /auth/signup`:

- Reads `name`, `email`, and `password`
- Checks that the email is not already used
- Hashes the password with `bcryptjs`
- Gives the user a starting balance
- Creates an auth token
- Saves the user in `users.db.json`
- Returns the token to the user

`POST /auth/login`:

- Reads `email` and `password`
- Finds the user by email
- Compares the password with the saved password hash
- Creates a fresh auth token
- Saves the updated user
- Returns the token to the user

The password hash is saved in the database, but it is never returned in the API
response.

### `src/routes/productRoutes.js`

This file handles public product browsing.

`GET /products` returns all products.

It also supports query params:

```text
GET /products?inStock=true
GET /products?maxPrice=50
GET /products?search=glasses
```

Each product response includes:

```json
{
  "id": 1,
  "name": "Gucci eyeglasses",
  "price": 20,
  "stock": 10,
  "inStock": true
}
```

This route does not require login.

### `src/routes/cartRoutes.js`

This file handles the logged-in user's cart.

All cart routes require an auth token.

`GET /cart`:

- Reads the user's cart
- Adds product names and prices
- Calculates item totals and cart total

`POST /cart/items`:

- Reads `productId` and `quantity`
- Checks that the product exists
- Checks that the product has enough stock
- Adds the item to the user's cart
- Saves the users file

`DELETE /cart/items/:productId`:

- Removes that product from the user's cart
- Saves the users file

Stock is checked when adding to the cart, but stock is only reduced during
checkout.

### `src/routes/accountRoutes.js`

This file handles account information.

`GET /account/balance` returns the logged-in user's current balance.

There is no route to add money or edit the balance. The balance only changes
when checkout succeeds.

### `src/routes/orderRoutes.js`

This file handles checkout and order history.

`GET /orders`:

- Reads all orders
- Returns only the orders that belong to the logged-in user

`POST /orders/checkout`:

- Rejects empty carts
- Checks that all cart products still exist
- Checks that there is enough stock
- Calculates the total price
- Checks that the user has enough balance
- Reduces product stock
- Creates a new order
- Deducts money from the user's balance
- Clears the user's cart
- Saves products, orders, and users

Checkout is the most important route because it updates all three database
files.

## Utility Files

### `src/utils/asyncHandler.js`

Express does not automatically catch every error from async route handlers.
This helper wraps async routes and sends errors to the central error handler in
`app.js`.

### `src/utils/httpError.js`

This helper creates an error with a status code.

Example:

```js
throw createHttpError(400, "Email and password are required.");
```

The central error handler uses the status code to send the correct response.

### `src/utils/cartUtils.js`

This file holds cart-related helper functions:

- `roundMoney(amount)` keeps money values clean
- `findProductById(products, productId)` finds one product
- `getCartDetails(cart, products)` builds the full cart response with totals

### `src/utils/dataParse.js`

This file wraps JSON parsing and formatting:

- `parseJsonToObject(json)`
- `parseObjectToJson(object)`

`parseObjectToJson` uses pretty JSON so the database files stay readable.

## Database Files

### `db/users.db.json`

Stores users.

Each user has:

- `id`
- `name`
- `email`
- `passwordHash`
- `balance`
- `cart`
- `authToken`
- `authTokenExpiresAt`
- `createdAt`

### `db/products.db.json`

Stores predefined products.

Each product has:

- `id`
- `name`
- `price`
- `stock`

Users do not create products. The products are defined by the project.

### `db/orders.db.json`

Stores completed orders.

Each order has:

- `id`
- `userId`
- `items`
- `total`
- `createdAt`

## Main API Routes

### Public Routes

These routes do not require a token.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Shows a small API welcome message |
| `GET` | `/health` | Checks that the server is running |
| `GET` | `/products` | Returns products |
| `POST` | `/auth/signup` | Creates a user |
| `POST` | `/auth/login` | Logs in a user |

### Protected Routes

These routes require:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/cart` | Shows the user's cart |
| `POST` | `/cart/items` | Adds a product to the cart |
| `DELETE` | `/cart/items/:productId` | Removes a product from the cart |
| `GET` | `/account/balance` | Shows the user's balance |
| `GET` | `/orders` | Shows the user's orders |
| `POST` | `/orders/checkout` | Pays for the cart and creates an order |

## Full User Flow

This is the normal way a user uses the API:

1. Sign up with `POST /auth/signup`.
2. Copy the returned token.
3. View products with `GET /products`.
4. Add a product with `POST /cart/items`.
5. Check the cart with `GET /cart`.
6. Checkout with `POST /orders/checkout`.
7. Check the balance with `GET /account/balance`.
8. See orders with `GET /orders`.

## PowerShell Examples

Create a new user:

```powershell
$signupBody = @{
  name = "Test Student"
  email = "student@example.com"
  password = "secret123"
} | ConvertTo-Json

$signupResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/auth/signup" `
  -ContentType "application/json" `
  -Body $signupBody

$token = $signupResponse.token
```

View products:

```powershell
Invoke-RestMethod "http://localhost:3000/products"
```

Add a product to the cart:

```powershell
$cartBody = @{
  productId = 1
  quantity = 2
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/cart/items" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $cartBody
```

Check the cart:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/cart" `
  -Headers @{ Authorization = "Bearer $token" }
```

Check the balance:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/account/balance" `
  -Headers @{ Authorization = "Bearer $token" }
```

Checkout:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/orders/checkout" `
  -Headers @{ Authorization = "Bearer $token" }
```

View orders:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/orders" `
  -Headers @{ Authorization = "Bearer $token" }
```

## Testing With Postman Or Thunder Client

You can also test the API without PowerShell.

1. Start the server with `npm start`.
2. Create a request for `POST http://localhost:3000/auth/signup`.
3. Put the signup JSON in the request body.
4. Send the request and copy the returned token.
5. For protected routes, add this header:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

Then test:

- `GET http://localhost:3000/products`
- `POST http://localhost:3000/cart/items`
- `GET http://localhost:3000/cart`
- `POST http://localhost:3000/orders/checkout`
- `GET http://localhost:3000/orders`

## Notes For Students

- The project uses only `import` and `export`, not `require`.
- Passwords are saved as bcrypt hashes, not plain text.
- The auth token is temporary and can expire.
- Products are public, but cart, balance, and orders need authentication.
- Stock is checked before adding to the cart and again during checkout.
- Product stock is reduced only after checkout succeeds.
- The user balance can only change when checkout succeeds.
- Most route files follow the same pattern: validate input, read data, check
  rules, save data if needed, and return JSON.
