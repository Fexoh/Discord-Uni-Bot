const { Client, Collection } = require("discord.js");
const mysql = require("mysql")
const sqlconf = require("./protectedconfigs/database.json")
const tokenconf = require("./protectedconfigs/token.json")

const client = new Client({
    intents: 32767,
});
module.exports = client;

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./config.json");
client.logger = require("./modules/logger");

// Initializing the project
require("./handler")(client);

client.con = mysql.createConnection({
    host: sqlconf.host,
    user: sqlconf.user,
    password: sqlconf.password,
    database: sqlconf.database
});
client.con.connect(res => {
    if(res != null){
        console.log(res);
        process.kill(0);
    } else {
        client.login(tokenconf.token);
    }
});

