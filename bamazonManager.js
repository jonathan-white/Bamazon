require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const bamazon = require("./bamazon");
const Table = require("cli-table");

var connection = mysql.createConnection(bamazon.db);

function displayMgrMenu(){
	// Start CLI
	console.log('\n-----BAMAZON MANAGER MENU-----');
	inquirer.prompt([
		{
			type: "list",
			name: "selection",
			message: "Choose an option:",
			choices: [
				"View Products for Sale",
				"View Low Inventory",
				"Add to Inventory",
				"Add New Product",
				"Edit Product",
				"Exit"]
		}
	]).then(option => {
		if (option.selection === "View Products for Sale"){
			viewProductsForSale();
		} else if (option.selection === "View Low Inventory"){
			viewLowInventory();
		} else if (option.selection === "Add to Inventory"){
			addToInventory();
		} else if (option.selection === "Add New Product"){
			addNewProduct();
		} else if (option.selection === "Edit Product"){
			editProduct();
		} else if (option.selection === "Exit") {
			connection.end();
		}
	});
};

function viewProductsForSale() {
	console.log('\n-------PRODUCTS FOR SALE-------\n');
	connection.query(
		"SELECT * FROM products",
		function(err,results){
			if(err) throw err;

			if(results.length > 0){
				// Setup table headers
				var table = new Table({
					head: ['ID','Product','Price','Quantity'],
					style: {head: ['inverse']}
				});

				// Add results data to table
				for (var i = 0; i < results.length; i++) {
					table.push([
						bamazon.pad(results[i].id,2), 
						results[i].product_name, 
						'$' + results[i].price,
						results[i].stock_quantity
					]);
				}

				// Display list of products in a table
				console.log(table.toString());	
			} else {
				console.log('There are no products currently for sale. Please add a new product.');
			}
			displayMgrMenu();
		}
	);
};

function viewLowInventory(){
	console.log('\n-------PRODUCTS LOW ON INVENTORY-------\n');
	connection.query(
		"SELECT * FROM products WHERE stock_quantity < 5",
		function(err,results){
			if(err) throw err;

			if(results.length > 0){
				// Setup table headers
				var table = new Table({
					head: ['ID','Product','Price','Quantity'],
					style: {head: ['red']}
				});

				// Add results data to table
				for (var i = 0; i < results.length; i++) {
					table.push([
						bamazon.pad(results[i].id,2), 
						results[i].product_name, 
						'$' + results[i].price,
						results[i].stock_quantity
					]);
				}

				// Display list of products in a table
				console.log(table.toString());	
			} else {
				console.log('All products are sufficiently stocked!');
			}
			displayMgrMenu();
		}
	);
};

function addToInventory(){
	// Query the DB for a list of current products
	console.log('\n-------ADD TO INVENTORY-------\n');
	connection.query(
		"SELECT * FROM products",
		function(err,results){
			if(err) throw err;

			// Create and populate an array with the names of the current products
			var listOfItems = [];
			for (var i = 0; i < results.length; i++) {
				listOfItems.push(results[i].id+'. '+results[i].product_name);
			}

			// Ask the user which product they want to restock then update the DB accordingly
			inquirer.prompt([
				{
					type: "list",
					name: "item",
					message: "Which item do you want to restock?",
					choices: listOfItems
				},
				{
					name: "qty",
					message: "How much stock do you want to add?",
					validate: function(value){
						return !isNaN(value);
					}
				}
			]).then(inventory => {
				var itemID = inventory.item.substring(0,inventory.item.indexOf('.'));
				dbCommand.updateStock(itemID,inventory.qty);
			});

		}
	);
};

function addNewProduct(){
	console.log('\n-------ADD NEW PRODUCT-------\n');
	connection.query('SELECT * FROM departments',function(err,results){
		var listOfDepartments = [];
		for (var i = 0; i < results.length; i++) {
			listOfDepartments.push(results[i].department_id+'. '+results[i].department_name);
		}
		// Gather details about the new product and update the DB accordingly
		inquirer.prompt([
			{
				name: "name",
				message: "What is the name of the product?"
			},
			{
				type: "list",
				name: "department",
				message: "Which department should this product belong to?",
				choices: listOfDepartments
			},
			{
				name: "price",
				message: "What is the selling price for this product?",
				validate: function(value){
					return !isNaN(value);
				}
			},
			{
				name: "qty",
				message: "What is the starting inventory(stock) for this product?",
				validate: function(value){
					return !isNaN(value);
				}
			}
		]).then(product => {
			var deptID = product.department.substring(0,product.department.indexOf('.'));

			var newItem = {
				product_name: product.name,
				department_id: deptID,
				price: parseFloat(product.price).toFixed(2),
				stock_quantity: parseInt(product.qty)
			};
			dbCommand.createProduct(newItem);
		});
		
	});

};

function editProduct(){
	console.log('\n-------EDIT PRODUCT-------\n');
	connection.query(
		"SELECT * FROM products",
		function(err,results){
			if(err) throw err;

			// Create and populate an array with the names of the current products
			var listOfItems = [];
			for (var i = 0; i < results.length; i++) {
				listOfItems.push(results[i].id+'. '+results[i].product_name);
			}

			inquirer.prompt([
				{
					type: "list",
					name: "item",
					message: "Which item do you want to edit?",
					choices: listOfItems
				},
				{
					type: "list",
					name: "action",
					message: "What action do you want to perform?",
					choices: ["Change Name","Change Price", "Remove Product"]
				}
			]).then(inventory => {
				const itemID = inventory.item.substring(0,inventory.item.indexOf('.'));
				if(inventory.action === "Change Name"){
					inquirer.prompt([
						{
							name: "value",
							message: "Enter a new name:"
						}
					]).then(answer =>{
						const product = {
							id: parseInt(itemID),
							property: inventory.action,
							value: answer.value
						}
						dbCommand.updateProduct(product);
					});
				} else if (inventory.action === "Change Price"){
					inquirer.prompt([
						{
							name: "value",
							message: "Enter a new price:",
							validate: function(value){
								return !isNaN(value);
							}
						}
					]).then(answer =>{
						const product = {
							id: parseInt(itemID),
							property: inventory.action,
							value: answer.value
						}
						dbCommand.updateProduct(product);
					});	
				} else if (inventory.action === "Remove Product"){
					dbCommand.deleteProduct(itemID);
				}
			});
		}
	);
};

var dbCommand = {
	createProduct: function(item){
		connection.query(
			"INSERT INTO products SET ?",item,function(err,results){
				console.log("'" + item.product_name + "' has been added successfully!");
				displayMgrMenu();
			}
		);
	},
	updateStock: function(itemID,amount){
		itemID = parseInt(itemID);
		amount = parseInt(amount);
		connection.query(
			"SELECT id, product_name, stock_quantity FROM products WHERE id = ?",
			[itemID],
			function(err,results){
				if(err) throw err;
				// 
				var itemQty = parseInt(results[0].stock_quantity);
				itemQty += parseInt(amount);
				connection.query(
					"UPDATE products SET ? WHERE ?",
					[
						{
							stock_quantity: itemQty
						},
						{
							id: itemID
						}
					],
					function(err){
						if(err) throw err;
						console.log("The stock of product '"+ results[0].product_name +
							"' has increased by "+ amount +" units");
						displayMgrMenu();
					}
				);	
			}
		);
	},
	updateProduct: function(item){
		var options = [];
		switch(item.property){
			case "Change Name":
				options = [{product_name: item.value}, {id: item.id}];
				break;
			case "Change Price":
				options = [{price: item.value}, {id: item.id}];
				break;
		}
		connection.query("UPDATE products SET ? WHERE ?",options,function(err,results){
			if(err) throw err;
			// 
			console.log('Product# '+ item.id +' has been updated.');
			displayMgrMenu();
		});
	},
	deleteProduct: function(itemID){
		connection.query("DELETE FROM products WHERE id=?",[itemID],function(err,results){
			if(err) throw err;
			console.log('Product# '+ itemID +' has been removed.');
			displayMgrMenu();
		});
	}
};

// Start the app
connection.connect(function(err){
	if(err) throw err;

	displayMgrMenu();
});