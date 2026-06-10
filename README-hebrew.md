# פתרון Express Store

הפרויקט הזה הוא backend לתרגול עם Express.js עבור חנות אופטיקה קטנה. הוא
משתמש ב-JavaScript רגיל, ES Modules עם `import` ו-`export`, וקבצי JSON בתור
database פשוט.

קישור ל-repository: [yosefhaim707/project-express-server-week-4.git](https://github.com/yosefhaim707/project-express-server-week-4.git)

מטרת הפרויקט היא לתרגל:

- בניית routes עם Express
- קריאת request bodies, headers ו-query params
- החזרת JSON responses
- שימוש ב-middleware
- טיפול בשגיאות
- שמירה וקריאה של נתונים מקבצים
- הצפנת סיסמאות עם `bcryptjs`
- הגנה על routes בעזרת auth tokens

## איך מריצים את הפרויקט

התקינו את התלויות:

```powershell
npm install
```

צרו קובץ `.env` מקומי. הקובץ הזה צריך להישאר מקומי ולא להיכנס ל-git.

```env
PORT=3000
DB_BASE_PATH=./db
STARTING_BALANCE=500
TOKEN_EXPIRATION_MINUTES=60
```

הריצו את השרת:

```powershell
npm start
```

השרת ירוץ בכתובת:

```text
http://localhost:3000
```

## ארכיטקטורת הפרויקט

הפרויקט מחולק לתיקיות קטנות, כך שלכל חלק יש תפקיד ברור אחד.

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

## איך request עובר בתוך האפליקציה

זה ה-flow המרכזי של כמעט כל request:

1. `src/server.js` מפעיל את השרת.
2. `src/app.js` מקבל את ה-request.
3. `express.json()` קורא וממיר JSON request bodies.
4. `src/app.js` שולח את ה-request לקובץ ה-route המתאים.
5. אם ה-route מוגן, `requireAuth` בודק קודם את ה-token.
6. ה-route קורא או כותב נתונים דרך `dbReader.js`.
7. ה-route מחזיר JSON response למשתמש.
8. אם משהו נכשל, ה-error handler ב-`app.js` מחזיר error response.

דוגמה:

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

## מה כל קובץ מרכזי עושה

### `src/server.js`

זה קובץ הכניסה של האפליקציה.

הוא:

- טוען environment variables מתוך `.env`
- מייבא את אפליקציית Express מתוך `app.js`
- קורא את ה-port מתוך `process.env.PORT`
- מתחיל להאזין ל-requests

השרת מתחיל לפעול כשמריצים:

```powershell
npm start
```

### `src/app.js`

הקובץ הזה יוצר ומגדיר את אפליקציית Express.

הוא:

- מאפשר קריאת JSON request bodies בעזרת `express.json()`
- מגדיר routes ציבוריים פשוטים כמו `/` ו-`/health`
- מחבר את כל קבוצות ה-routes:
  - `/auth`
  - `/products`
  - `/cart`
  - `/account`
  - `/orders`
- מגן על routes פרטיים בעזרת `requireAuth`
- מטפל ב-routes שלא קיימים עם תגובת 404
- מטפל בשגיאות במקום מרכזי אחד

אפשר לחשוב על הקובץ הזה בתור מנהל התנועה המרכזי של ה-API.

### `src/dal/dbReader.js`

`dal` הוא קיצור של Data Access Layer.

הקובץ הזה אחראי על קריאה וכתיבה של קבצי ה-JSON שמשמשים בתור database. קבצי
ה-routes לא צריכים לדעת את הנתיבים המדויקים של הקבצים. במקום זה, הם קוראים
לפונקציות helper פשוטות.

הוא מייצא:

- `readUsers()`
- `saveUsers(users)`
- `readProducts()`
- `saveProducts(products)`
- `readOrders()`
- `saveOrders(orders)`

תיקיית ה-database מגיעה מתוך:

```text
DB_BASE_PATH=./db
```

זה אומר שהנתיב לא כתוב ישירות בתוך לוגיקת ה-routes.

### `src/middleware/authMiddleware.js`

הקובץ הזה מגן על routes שדורשים login.

הוא בודק את ה-`Authorization` header:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

ה-middleware:

1. קורא את ה-token מתוך ה-header.
2. מחפש משתמש עם אותו token.
3. בודק אם ה-token פג תוקף.
4. מוסיף את המשתמש אל `request.user`.
5. מוסיף את מערך המשתמשים המלא אל `request.users`.
6. מאפשר ל-request להמשיך הלאה.

אם ה-token חסר, לא תקין או פג תוקף, ה-request נדחה לפני שהוא מגיע ל-route
handler.

### `src/routes/authRoutes.js`

הקובץ הזה מטפל בהרשמה ובהתחברות.

`POST /auth/signup`:

- קורא את `name`, `email` ו-`password`
- בודק שה-email עדיין לא נמצא בשימוש
- מצפין את הסיסמה עם `bcryptjs`
- נותן למשתמש יתרת פתיחה
- יוצר auth token
- שומר את המשתמש בתוך `users.db.json`
- מחזיר למשתמש את ה-token

`POST /auth/login`:

- קורא את `email` ו-`password`
- מוצא את המשתמש לפי email
- משווה בין הסיסמה שנשלחה לבין ה-password hash ששמור
- יוצר auth token חדש
- שומר את המשתמש המעודכן
- מחזיר למשתמש את ה-token

ה-password hash נשמר ב-database, אבל הוא אף פעם לא מוחזר בתגובה של ה-API.

### `src/routes/productRoutes.js`

הקובץ הזה מטפל בצפייה ציבורית במוצרים.

`GET /products` מחזיר את כל המוצרים.

הוא גם תומך ב-query params:

```text
GET /products?inStock=true
GET /products?maxPrice=50
GET /products?search=glasses
```

כל product response כולל:

```json
{
  "id": 1,
  "name": "Gucci eyeglasses",
  "price": 20,
  "stock": 10,
  "inStock": true
}
```

ה-route הזה לא דורש login.

### `src/routes/cartRoutes.js`

הקובץ הזה מטפל בעגלה של המשתמש המחובר.

כל routes של העגלה דורשים auth token.

`GET /cart`:

- קורא את העגלה של המשתמש
- מוסיף שמות ומחירים של מוצרים
- מחשב total לכל item ואת ה-total של כל העגלה

`POST /cart/items`:

- קורא את `productId` ואת `quantity`
- בודק שהמוצר קיים
- בודק שיש מספיק מלאי מהמוצר
- מוסיף את הפריט לעגלה של המשתמש
- שומר את קובץ המשתמשים

`DELETE /cart/items/:productId`:

- מסיר את המוצר הזה מהעגלה של המשתמש
- שומר את קובץ המשתמשים

המלאי נבדק בזמן הוספה לעגלה, אבל המלאי יורד בפועל רק בזמן checkout.

### `src/routes/accountRoutes.js`

הקובץ הזה מטפל במידע של החשבון.

`GET /account/balance` מחזיר את היתרה הנוכחית של המשתמש המחובר.

אין route שמאפשר להוסיף כסף או לערוך את היתרה. היתרה משתנה רק כאשר checkout
מצליח.

### `src/routes/orderRoutes.js`

הקובץ הזה מטפל ב-checkout ובהיסטוריית הזמנות.

`GET /orders`:

- קורא את כל ההזמנות
- מחזיר רק את ההזמנות ששייכות למשתמש המחובר

`POST /orders/checkout`:

- דוחה עגלות ריקות
- בודק שכל המוצרים בעגלה עדיין קיימים
- בודק שיש מספיק מלאי
- מחשב את המחיר הכולל
- בודק שלמשתמש יש מספיק כסף ביתרה
- מוריד את מלאי המוצרים
- יוצר הזמנה חדשה
- מוריד כסף מהיתרה של המשתמש
- מרוקן את העגלה של המשתמש
- שומר מוצרים, הזמנות ומשתמשים

checkout הוא ה-route החשוב ביותר, כי הוא מעדכן את כל שלושת קבצי ה-database.

## קבצי Utility

### `src/utils/asyncHandler.js`

Express לא תופס אוטומטית כל שגיאה שמגיעה מתוך async route handlers. ה-helper
הזה עוטף async routes ושולח שגיאות אל ה-error handler המרכזי ב-`app.js`.

### `src/utils/httpError.js`

ה-helper הזה יוצר שגיאה עם status code.

דוגמה:

```js
throw createHttpError(400, "Email and password are required.");
```

ה-error handler המרכזי משתמש ב-status code כדי להחזיר את התגובה הנכונה.

### `src/utils/cartUtils.js`

הקובץ הזה מכיל helper functions שקשורות לעגלה:

- `roundMoney(amount)` שומר על ערכי כסף נקיים
- `findProductById(products, productId)` מוצא מוצר אחד
- `getCartDetails(cart, products)` בונה את תגובת העגלה המלאה עם totals

### `src/utils/dataParse.js`

הקובץ הזה עוטף JSON parsing ו-formatting:

- `parseJsonToObject(json)`
- `parseObjectToJson(object)`

`parseObjectToJson` משתמש ב-pretty JSON כדי שקבצי ה-database יישארו קריאים.

## קבצי Database

### `db/users.db.json`

שומר משתמשים.

לכל משתמש יש:

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

שומר מוצרים שהוגדרו מראש.

לכל מוצר יש:

- `id`
- `name`
- `price`
- `stock`

משתמשים לא יוצרים מוצרים. המוצרים מוגדרים כחלק מהפרויקט.

### `db/orders.db.json`

שומר הזמנות שהושלמו.

לכל הזמנה יש:

- `id`
- `userId`
- `items`
- `total`
- `createdAt`

## Routes מרכזיים ב-API

### Public Routes

ה-routes האלה לא דורשים token.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | מציג הודעת פתיחה קצרה של ה-API |
| `GET` | `/health` | בודק שהשרת רץ |
| `GET` | `/products` | מחזיר מוצרים |
| `POST` | `/auth/signup` | יוצר משתמש |
| `POST` | `/auth/login` | מחבר משתמש |

### Protected Routes

ה-routes האלה דורשים:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/cart` | מציג את העגלה של המשתמש |
| `POST` | `/cart/items` | מוסיף מוצר לעגלה |
| `DELETE` | `/cart/items/:productId` | מסיר מוצר מהעגלה |
| `GET` | `/account/balance` | מציג את היתרה של המשתמש |
| `GET` | `/orders` | מציג את ההזמנות של המשתמש |
| `POST` | `/orders/checkout` | משלם על העגלה ויוצר הזמנה |

## Flow מלא של משתמש

זאת הדרך הרגילה שבה משתמש עובד עם ה-API:

1. נרשמים עם `POST /auth/signup`.
2. מעתיקים את ה-token שחזר מהשרת.
3. רואים מוצרים עם `GET /products`.
4. מוסיפים מוצר עם `POST /cart/items`.
5. בודקים את העגלה עם `GET /cart`.
6. מבצעים checkout עם `POST /orders/checkout`.
7. בודקים את היתרה עם `GET /account/balance`.
8. רואים הזמנות עם `GET /orders`.

## דוגמאות PowerShell

יצירת משתמש חדש:

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

צפייה במוצרים:

```powershell
Invoke-RestMethod "http://localhost:3000/products"
```

הוספת מוצר לעגלה:

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

בדיקת העגלה:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/cart" `
  -Headers @{ Authorization = "Bearer $token" }
```

בדיקת היתרה:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/account/balance" `
  -Headers @{ Authorization = "Bearer $token" }
```

ביצוע checkout:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/orders/checkout" `
  -Headers @{ Authorization = "Bearer $token" }
```

צפייה בהזמנות:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/orders" `
  -Headers @{ Authorization = "Bearer $token" }
```

## בדיקה עם Postman או Thunder Client

אפשר לבדוק את ה-API גם בלי PowerShell.

1. הפעילו את השרת עם `npm start`.
2. צרו request עבור `POST http://localhost:3000/auth/signup`.
3. שימו את ה-signup JSON בתוך ה-request body.
4. שלחו את ה-request והעתיקו את ה-token שחזר.
5. עבור protected routes, הוסיפו את ה-header הזה:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

לאחר מכן בדקו:

- `GET http://localhost:3000/products`
- `POST http://localhost:3000/cart/items`
- `GET http://localhost:3000/cart`
- `POST http://localhost:3000/orders/checkout`
- `GET http://localhost:3000/orders`

## הערות לסטודנטים

- הפרויקט משתמש רק ב-`import` ו-`export`, לא ב-`require`.
- סיסמאות נשמרות בתור bcrypt hashes, לא כטקסט רגיל.
- ה-auth token הוא זמני ויכול לפוג תוקף.
- מוצרים הם ציבוריים, אבל עגלה, יתרה והזמנות דורשים authentication.
- המלאי נבדק לפני הוספה לעגלה וגם שוב בזמן checkout.
- מלאי של מוצר יורד רק אחרי ש-checkout מצליח.
- היתרה של המשתמש יכולה להשתנות רק כאשר checkout מצליח.
- רוב קבצי ה-routes עובדים באותו pattern: לבדוק input, לקרוא נתונים, לבדוק
  חוקים, לשמור נתונים אם צריך, ולהחזיר JSON.
