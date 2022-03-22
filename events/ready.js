const client = require("../index");

client.on("ready", () => {
    client.logger.ready(`${client.user.tag} is up and ready to go!`);
    //fetchMembers();
    //fetchAlleMessages();
});

function fetchAlleMessages() {
    client.con.query("SELECT * FROM storage WHERE name = 'MAIN' AND type = 'guild'", (err, rows) => {
        if(err) throw err;
        client.guilds.fetch(rows[0].id).then(guild => {
            guild.channels.cache.forEach(c => {
                client.logger.log(c.name);
                c.fetch().then(channel => {
                    if(channel.type == "TEXT_CHANNEL") {
                        channel.messages.cache.forEach(m => {
                            m.fetch();
                        })
                    }
                });

            })
        });
    })
}
function fetchMembers() {
    client.con.query("SELECT * FROM storage WHERE name = 'MAIN' AND type = 'guild'", (err, rows) => {
        if(err) throw err;
        client.guilds.fetch(rows[0].id).then(guild => {
            guild.members.fetch();
            setTimeout(function () {
                client.logger.log("Starting Database-Fix");
                guild.members.cache.forEach(m => {
                    fixMember(m);
                })
            }, 10000)
        });
    })
}

function fixMember(member) {
    const id = member.id;
    client.con.query("SELECT * FROM user WHERE id = "+id, (err, rows) => {
        if(err) throw err;
        if(rows.length == 0) {
            client.con.query("SELECT * FROM storage WHERE type = 'value' AND name = 'COINS_DEFAULT'", (err, rows2) => {
                client.con.query("INSERT INTO user (id, coins) VALUES ('"+id+"', '"+rows2[0].id+"')");
                return client.logger.debug("Added User "+member.user.username+" to Database");
            })
        } else if(rows[0].coins == null){
            client.con.query("SELECT * FROM storage WHERE type = 'value' AND name = 'COINS_DEFAULT'", (err, rows) => {
                if(err) throw err;
                client.con.query("UPDATE user SET coins = "+rows[0].id);
                client.logger.debug("Fixing User "+member.user.username+"'s Coins")
            })
        }
    });
}