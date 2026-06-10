# Express Store Solution

This is a practice Express.js backend for a small optical store. It uses JSON
files as a simple database and keeps the code in plain JavaScript with
`import` / `export`.

## Setup

Install dependencies:

```powershell
npm install
```

Create a local `.env` file. The file should not be committed to git.

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

The server runs at `http://localhost:3000` by default.

## Main Routes

Public routes:

- `GET /`
- `GET /health`
- `GET /products`
- `GET /products?inStock=true`
- `GET /products?maxPrice=50`
- `GET /products?search=glasses`
- `POST /auth/signup`
- `POST /auth/login`

Protected routes require this header:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

Protected routes:

- `GET /cart`
- `POST /cart/items`
- `DELETE /cart/items/:productId`
- `GET /account/balance`
- `GET /orders`
- `POST /orders/checkout`

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

Checkout:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/orders/checkout" `
  -Headers @{ Authorization = "Bearer $token" }
```

## Notes For Students

- Passwords are saved as bcrypt hashes, not plain text.
- The server creates a temporary auth token after signup and login.
- Products are public, but cart, balance, and orders need authentication.
- Stock is checked before adding to the cart and again during checkout.
- The user balance can only change when checkout succeeds.
