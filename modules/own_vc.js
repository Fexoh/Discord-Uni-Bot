const moment = require("moment");

module.exports = (client) => {
    client.logger.load(`Starte Own-Channel-Modul ...`);

    client.guilds.fetch(client.config.guild).then(g => {
        g.channels.fetch().then(() => {
            setInterval(deleteChannel, 30000)
            client.logger.load(`Own-Channel-Modul wurde erfolgreich geladen!`);
        });
    })

    client.on(`voiceStateUpdate`, (oldClient, newClient) => {
        client.con.query(`SELECT * FROM storage WHERE type = 'channel' AND name = 'OWN_CHANNEL_VOICE'`, (err, rows) => {
            if (err) throw err;
            const channelid = rows[0].id;
            const guild = newClient.member.guild;
            if (channelid === newClient.channelId) {
                client.con.query(`SELECT * FROM user WHERE id = ${newClient.member.id}`, (err, rows) => {
                    if (err) throw err;
                    if (rows.length == 0) {
                        newClient.disconnect();
                        client.con.query(`INSERT INTO user (id) VALUES (${newClient.id})`)
                        newClient.member.send(`Du warst anscheinend noch nie so aktiv auf unserem Server, dass unser System dich noch nicht kenn. Nun bist Du uns bekannt. Bitte probiere es erneut.`)
                        return;
                    } else {
                        if (rows[0].own_channel_voice != null) {
                            newClient.disconnect();
                            newClient.member.send(`Du hast bereits einen eigenen Voicechannel!`)
                        } else {
                            client.con.query(`SELECT * FROM storage WHERE type = 'category' AND name = 'OWN_CHANNEL_VOICE'`, (err, rows) => {
                                if (err) throw err;
                                let category = guild.channels.cache.find(ct => ct.id == rows[0].id);
                                guild.channels.create(
                                    `${newClient.member.user.username}`,
                                    {
                                        type: 'GUILD_VOICE',
                                        topic: `Privater Channel von ${newClient.member.user.username}`,
                                        userLimit: 10,
                                        parent: category,
                                        reason: `Privater Channel von ${newClient.member.user.username}`
                                    }
                                ).then(c => {
                                    newClient.setChannel(c);
                                    client.con.query(`INSERT INTO own_vc (channel_id, user_id) VALUES (${c.id}, ${newClient.member.id})`)
                                    client.con.query(`UPDATE user SET own_channel_voice = ${c.id} WHERE id = ${newClient.member.id}`)
                                    newClient.member.send(`Dein Privater Voicechannel wurde eingerichtet!`);
                                })
                            })
                        }
                    }
                })
            }
        })
    })

    function deleteChannel() {
        const timestamp = `${moment().format("HH:mm").toString()}`;
        client.logger.debug(`Starte Löschung der temporären Voicechannel...`)
        client.con.query(`SELECT * FROM user`, (err, rows) => {
            if (err) throw err;
            client.guilds.fetch(client.config.guild).then(g => {
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i].own_channel_voice != null) {
                        const c = g.channels.resolve(rows[i].own_channel_voice);
                        if (c.members.size === 0) {
                            c.delete();
                            client.con.query(`UPDATE user SET own_channel_voice = null WHERE own_channel_voice = ${c.id}`)
                            client.logger.log(`Lösche Channel ${rows[i].own_channel_voice}`)
                        }
                    }
                }
            });
        })
    }
}