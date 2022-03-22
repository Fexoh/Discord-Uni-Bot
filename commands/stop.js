const { Message, Client } = require("discord.js");

module.exports = {
    name: "stop",
    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        client.con.query("SELECT * FROM storage WHERE type = 'role' AND name = 'BOT_ADMIN'", (err, rows) => {
            if(err) {
                return message.channel.send("Ein Fehler ist aufgetreten. Bitte versuche es später erneut!");
            } else {
                if(message.member.roles.cache.has(rows[0].id)){
                    message.channel.send("Shutting down.").then(m => {
                        message.channel.send(":boom:").then(m => {
                            message.delete().then(m => {
                                client.destroy()
                                client.logger.client("Bot shut down");
                                process.exit();
                            })
                        })
                    })
                } else {
                    message.channel.send("No Perms, du kanacke")
                }
            }
        })
    },
};
