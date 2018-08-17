require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const bamazon = require("./bamazon");
const Table = require("cli-table");

const connection = mysql.createConnection(bamazon.db);

let orders = [];

const displayCustMenu = () => {
	// Start CLI
	console.log('\n-----CUSTOMER MENU-----');
	inquirer.prompt([
		{
			type: "list",
			name: "selection",
			message: "Choose an option:",
			choices: [
				"View Products for Sale",
				"Purchase Item",
				"Help",
				"Exit"]
		}
	]).then(option => {
		if (option.selection === "View Products for Sale"){
			viewProductsForSale();
		} else if (option.selection === "Purchase Item"){
			purchaseItem();
		} else if (option.selection === "Help"){
			help();
		} else if (option.selection === "Exit") {
			connection.end();
		}
	});
};

const viewProductsForSale = () => {
	// 2. Display all items that are for sale
	console.log('\n-------PRODUCTS FOR SALE-------\n');
	connection.query('SELECT id, product_name, price FROM products', function(err, results){
		if (err) throw err;

		// Setup table headers
		let table = new Table({
			head: ['ID','Product','Price'],
			style: {head: ['inverse']}
		});

		// Add results data to table
		for (let i = 0; i < results.length; i++) {
			table.push([
				bamazon.pad(results[i].id,2), 
				results[i].product_name, 
				'$' + results[i].price
			]);
		}

		// Display list of products in a table
		console.log(table.toString());

		// 3. Prompt user with two messages
		displayCustMenu();
	});
};

const purchaseItem = () => {
	console.log('\n-------PURCHASE PRODUCT-------\n');
	inquirer.prompt([
		{
			name: "id",
			message: "Enter the ID of the product you would like to buy",
			validate: function(value){
				return !isNaN(value);
			}
		},
		{
			name: "qty",
			message: "How many units would you like to buy?",
			validate: function(value){
				return !isNaN(value);
			}
		}
	]).then(product => {	
		// Check if we have enough product to meet the customer's demand
		connection.query(
			'SELECT * FROM products WHERE ?',
			{
				id: product.id
			},
			function(err,results){
			if (err) throw err;
			// Check if the item exists
			if(results.length > 0){
				// Check if item is in stock
				if(results[0].stock_quantity < product.qty){
					console.log('Insufficient quantity!');
					displayCustMenu();
				}else {
					const saleTotal = parseFloat(product.qty * results[0].price).toFixed(2);
					orders.push({product: results[0].product_name, qty: product.qty, cost: saleTotal});
					console.log(`Thank you for purchasing a(n) ${results[0].product_name}`);
					console.log(`The total cost of your purchase is $${saleTotal}`);
					updateProducts("buyProduct",
						parseInt(product.id),parseInt(product.qty),saleTotal);
				}
			}else {
				console.log('That product does not exist');
				displayCustMenu();
			}
		});
	});
};

const updateProducts = (action, item, amount, sales) => {
	if(action === "buyProduct"){
		connection.query(
			'UPDATE products SET stock_quantity = stock_quantity - ?, '+
			'product_sales = product_sales + ? WHERE ?',
			[
				amount.toFixed(2),
				sales,
				{
					id: item
				}
			],
			function(err){
				if (err) throw err;
				displayCustMenu();
			}
		);
	}
};

const help = () => {
	console.log('\n-------HELP-------\n');
	console.log('Hello. What can we help you with?');
	inquirer.prompt([
		{
			type: "list",
			name: "choice",
			message: "Hello. What can we help you with?",
			choices: ["Your Orders","Returns & Refunds","Payments & Gift Cards","Account Settings"]
		}
	]).then(answer => {
		if(answer.choice === "Your Orders"){
			console.log('You have the following pending orders...');
			// Setup table headers
			let table = new Table({
				head: ['Product','Qty','Cost'],
				style: {head: ['green']}
			});

			// Add orders data to table
			for (let i = 0; i < orders.length; i++) {
				table.push([
					orders[i].product, 
					orders[i].qty, 
					'$'+orders[i].cost
				]);
			}

			// Display list of products in a table
			console.log(table.toString());
		} else if (answer.choice === "Returns & Refunds"){
			console.log('All sales are final. No refunds!');
		} else if (answer.choice === "Payments & Gift Cards"){
			console.log("You have no saved payments or gift cards.");
		} else if (answer.choice === "Account Settings"){
			console.log('You have not signed in.');
		}
		displayCustMenu();
	});
};

// Start the app
connection.connect((err) => {
	if(err) throw err;

	console.log('\nWelcome to Bamazon!');
	viewProductsForSale();
});