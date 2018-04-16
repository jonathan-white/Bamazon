module.exports = {
	db: {
	  host: process.env.DATABASE_HOST,
	  port: parseInt(process.env.DATABASE_PORT),
	  user: process.env.DATABASE_USER,
	  password: process.env.DATABASE_PASSWORD,
	  database: process.env.DATABASE_NAME
	},
	pad: function(num, size){
		var str = num+"";
		while (str.length < size) str = "0" + str;
		return str;
	}
}