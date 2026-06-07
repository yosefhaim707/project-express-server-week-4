# project-express-server-week-4

## Project Goals

This project will practice the following skills:

- basic HTTP server methods
- dealing with the main HTTP parts including, rquest and response, headers and cookies
- understanding HTTP routing
- using query params in order to filter data
- JSON parsing
- express basics
- express basic auth
- express middlewares and error handling

## Project Description

This project will simulate a simple backend flow of an online store.

You can choose what type of an online store you want to create, but the following are some ideas:

- a clothing store
- a shoe store
- a toy store
- a book store

## Project Requirements

### The user should be able to:

- sign up / login.
- if the user has an unexpired auth token, they can make requests to the server without having to re-authenticate.
- see the list of products available in the store (this request does not require authentication)
- add a new product to his own cart. additionally, he can also remove items from his cart.
- see the list of all products in his cart
- checkout and pay for the order with the money in his balance
- see the current amount of money in his balance

### Project basic rules:

- each user when signs up should have fixed amount of money in their account.
- the user can only buy products that are available in stock (in other words, if a product is out of stock, it cannot be added to the cart).
- however, the user can see all products in the store regardless of their availability, as long as it's clear that they are not available in stock.
- the user can only pay for an order with the amount of money he has in his balance. a purchase attempt from a user that doesn't have enough money should fail and return an error message to the user.
- the user cannot add or modify their balance.
- if the user tries to make a request with an expired auth token, it should be rejected with an appropriate error message (not a general "unauthorized" error).
- the products are not created by any user, instead they should be pre-defined by you.
- sensetive information such as DB credentials (in our case, the path of the JSON file that simulates the DB) should not be hardcoded. instead, they should be stored in an environment variable file that is not checked into source control (such as .env).

### Self-learning mission:

you must encrypt the user password when signing up (using bcryptjs). when logging in, you must compare the password that is sent to the server against the one stored in the database (JSON file that simulates the DB)

### Project technical requirements:

the project must use the following technologies / libraries:
- express js
- pure javascript (no ts)
- node.js
- bcriptJS (self-learning mission)
- git

### Important Notes:

- the only way to interact with the server is through the terminal or some sort of API client such as Postman.
- you are allowed to build as many or as little amount of routes as you want. however, the project will be graded significantly based on the quality of your routes, and if their are built right.
- cosider creating a cleant folder and code structure for your project.
- in the same way, the best you manage your project code with git, the better.
- with all of that said, the first thing you must verify, is that the code works. that is the main factor.

### Project Submission:

- after completing the project, submit the link of your repository on github.
