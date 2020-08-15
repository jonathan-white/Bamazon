require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const bamazon = require("./bamazon");
const Table = require("cli-table3");

var connection = mysql.createConnection(bamazon.db);

function displaySupervisorMenu(){
	// Start CLI
	console.log('\n-------BAMAZON SUPERVISOR MENU-------');
	inquirer.prompt([
		{
			type: "list",
			name: "selection",
			message: "Choose an option:",
			choices: [
				"View Products Sales by Department",
				"Create New Department",
				"Exit"]
		}
	]).then(option => {
		if (option.selection === "View Products Sales by Department"){
			viewDeptSales();
		} else if (option.selection === "Create New Department"){
			createDept();
		} else if (option.selection === "Exit") {
			connection.end();
		}
	});
};

function viewDeptSales(){
	connection.query(
		'SELECT d.department_id, d.department_name, over_head_costs, '+ 
		'SUM(IFNULL(product_sales,0)) AS sales, '+
		'(SUM(IFNULL(product_sales,0)) - over_head_costs) AS total_profit '+
		'FROM departments d LEFT JOIN products p ON d.department_id = p.department_id '+
		'GROUP BY d.department_id, d.department_name, over_head_costs',
		function(err,results){
		if (err) throw err;

		// Console table
		var table = new Table({
			head: ['department_id','department_name','over_head_costs',
				'product_sales','total_profit'],
			style: {head: ['green']}
		});

		for (var i = 0; i < results.length; i++) {
			table.push([
				bamazon.pad(results[i].department_id,2), 
				results[i].department_name, 
				parseFloat(results[i].over_head_costs).toFixed(2),
				parseFloat(results[i].sales).toFixed(2),
				parseFloat(results[i].total_profit).toFixed(2)
			]);
		}

		console.log(table.toString());
		displaySupervisorMenu();
	});
};

function createDept(){
	console.log('\n-------ADD NEW DEPARTMENT-------\n');
	inquirer.prompt([
		{
			name: "name",
			message: "What is the name of the new department?"
		},
		{
			name: "overhead",
			message: "What are the overhead costs?"
		}
	]).then(dept => {
		connection.query(
			"INSERT INTO departments SET ?",
			{
				department_name: dept.name,
				over_head_costs: dept.overhead
			},
			function(err,results){
				console.log("The '" + dept.name + "' department has been added successfully!");
				displaySupervisorMenu();
			}
		);
	});
};

// Start the app
connection.connect(function(err){
	if(err) throw err;

	displaySupervisorMenu();
});