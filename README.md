# Bamazon
Amazon-like storefront node application.

## Purpose

Bamazon is a commandline app that takes orders from customers while depleting stock from the store's inventory. The program also tracks product sales across the store's departments and provides a summary of the highest-grossing departments in the store.

## Getting Started

Before you can use this app you will need to setup a MySQL database. Once the database has been setup, you will need to store the host, port, user, password, and database details in a .env file.

Install the dependency npm packages: $npm install

To run the app, use one of the three js files:
* $ node bamazonCustomer.js
* $ node bamazonManager.js
* $ node bamazonSupervisor.js

## Views & Commands

* *Customer View* - The supervisor view presents the user with the following options:
  * **View Products for Sale**: Displays the ID, Name and Price of the products that are for sale.
  * **Purchase Item**: Allows a customer to purchase a product by entering the product ID and quantity.
  * **Help**: Allows a customer to view their placed orders, request refunds, payment methods & gift cards, and account settings.
  * **Exit**: Exits the program.

* *Manager View* - The manager view presents the user with the following options:
  * **View Products for Sale**: Displays the ID, Name, Price and inventory of the products that are for sale.
  * **View Low Inventory**: Allows the manager to view products that have an inventory count lower than 5.
  * **Add to Inventory**: Allows a manager to increase the stock of a product.
  * **Add New Product**: Allows a manager to add a new product to the store.
  * **Edit Product**: Allows a manager to change the name of a product, change the price of a product or remove a product from the store.
  * **Exit**: Exits the program.

* *Supervisor View* - The supervisor view presents the user with the following options:
  * **View Products Sales by Department**: Allows a supervisor to track product sales across the store's departments and provides a summary of the highest-grossing departments in the store.
  * **Create New Department**: Allows a supervisor to create a new department.
  * **Exit**: Exits the program.

## Demo

Click this link to view a recorded demo: 
[Demo](https://drive.google.com/file/d/1eZm-MYI1M3Yu2Huv123ReY6wuY3Skgua/view)

## Node Packages Used

* https://www.npmjs.com/package/dotenv
* https://www.npmjs.com/package/mysql
* https://www.npmjs.com/package/inquirer
* https://www.npmjs.com/package/cli-table

## Author

This project was written by 
[Jon White](https://jonathan-white.github.io/)
