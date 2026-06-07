# project-express-server-week-4

## Project Goals

In this project, you will practice the following skills:

- Basic HTTP server methods
- Dealing with the main HTTP parts, including requests, responses, headers, and cookies
- Understanding HTTP routing
- Using query params to filter data
- JSON parsing
- Express basics
- Express basic auth
- Express middleware and error handling

## Project Description

This project will simulate a simple backend flow for an online store.

You can choose what type of online store you want to create, but the following are some ideas:

- A clothing store
- A shoe store
- A toy store
- A book store

## Project Requirements

### The user should be able to:

- Sign up / log in.
- Make requests to the server without having to re-authenticate if they have an unexpired auth token.
- See the list of products available in the store (this request does not require authentication).
- Add a new product to their own cart. Additionally, they can also remove items from their cart.
- See the list of all products in their cart.
- Check out and pay for the order with the money in their balance.
- See the current amount of money in their balance.

### Project Basic Rules:

- Each user should have a fixed amount of money in their account when they sign up.
- The user can only buy products that are available in stock (in other words, if a product is out of stock, it cannot be added to the cart).
- However, the user can see all products in the store regardless of their availability, as long as it's clear that they are not available in stock.
- The user can only pay for an order with the amount of money they have in their balance. A purchase attempt from a user who doesn't have enough money should fail and return an error message to the user.
- The user cannot add or modify their balance.
- If the user tries to make a request with an expired auth token, it should be rejected with an appropriate error message (not a general "unauthorized" error).
- The products are not created by any user; instead, they should be pre-defined by you.
- Sensitive information, such as DB credentials (in our case, the path to the JSON file that simulates the DB), should not be hardcoded. Instead, it should be stored in an environment variable file that is not checked into source control (such as .env).

### Self-Learning Mission:

You must encrypt the user's password when signing up (using bcryptjs). When logging in, you must compare the password that is sent to the server against the one stored in the database (the JSON file that simulates the DB).

### Project Technical Requirements:

The project must use the following technologies / libraries:

- Express.js
- Pure JavaScript (no TypeScript)
- Node.js
- bcryptjs (self-learning mission)
- Git

### Important Notes:

- The only way to interact with the server is through the terminal or some sort of API client such as Postman.
- You are allowed to build as many or as few routes as you want. However, the project will be graded significantly based on the quality of your routes and whether they are built correctly.
- Consider creating a clean folder structure and code structure for your project.
- In the same way, the better you manage your project code with Git, the better your project will be.
- With all of that said, the first thing you must verify is that the code works. That is the main factor.

### Project Submission:

- After completing the project, submit the link to your repository on GitHub.
