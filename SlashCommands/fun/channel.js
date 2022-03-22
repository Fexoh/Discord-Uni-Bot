const { Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "channel",
    description: "Editiere deinen eigenen Channel",
    type: 'CHAT_INPUT',
    options: [
        {
            type: "SUB_COMMAND",
            name: "changename",
            description: "Den Namen deines Channels ändern",
            options: [
                {
                    name: "newname",
                    description: "Der neue Name deines Channels",
                    required: true,
                    type: "STRING"
                }
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "changeslots",
            description: "Die Anzahl an maximalen Migliedern ändern",
            options: [
                {
                    name: "newslots",
                    description: "Die Anzahl an Mitgliedern",
                    required: true,
                    type: "INTEGER"
                }
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "delete",
            description: "Deinen Channel löschen",
        },
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const subcommand = args[0];

        switch (subcommand) {
            case "changename":
                changeName(client, interaction, args)
                break;
            case "changeslots":
                changeSlots(client, interaction, args)
                break;
            case "delete":
                deleteChannel(client, interaction, args)
                break;
        }


    },
};

function changeName(client, interaction, args) {

    const guild = client.guilds.cache.get(interaction.guild.id);
    const member = guild.members.cache.get(interaction.member.user.id);
    const newname = args[1];

    client.con.query(`SELECT * FROM user WHERE id = `+member.id, (err, rows) => {
        if(err) throw err;

        if(rows.length === 0){
            client.con.query(`SELECT * FROM storage WHERE type = 'channel' AND name = 'OWN_CHANNEL_VOICE'`, (err, rows) => {
                if(err) throw err;
                client.con.query(`INSERT INTO user ('id') VALUES (${member.id})`);
                return interaction.followUp({content: `Du hast aktuell keinen eigenne Voicechannel. Gehe gerne in <#${rows[0].id}> und erstelle dir einen.`});
            })
        }

        if(rows[0].own_channel_voice === null){
            client.con.query(`SELECT * FROM storage WHERE type = 'channel' AND name = 'OWN_CHANNEL_VOICE'`, (err, rows) => {
                if(err) throw err;
                return interaction.followUp({content: `Du hast aktuell keinen eigenne Voicechannel. Gehe gerne in <#${rows[0].id}> und erstelle dir einen.`});
            })
        }
        client.guilds.fetch(client.config.guild).then(g => {
            const c = g.channels.resolve(rows[0].own_channel_voice);
            c.setName(newname);
            interaction.followUp({content: `Dein Channel heißt nun \`${newname}\``});
        })
    })

}

function changeSlots(client, interaction, args) {

    const guild = client.guilds.cache.get(interaction.guild.id);
    const member = guild.members.cache.get(interaction.member.user.id);
    const newSlots = args[1];

    client.con.query(`SELECT * FROM user WHERE id = ` + member.id, (err, rows) => {
        if (err) throw err;

        if (rows.length === 0) {
            client.con.query(`SELECT * FROM storage WHERE type = 'channel' AND name = 'OWN_CHANNEL_VOICE'`, (err, rows) => {
                if (err) throw err;
                client.con.query(`INSERT INTO user ('id') VALUES (${member.id})`);
                return interaction.followUp({content: `Du hast aktuell keinen eigene Voicechannel. Gehe gerne in <#${rows[0].id}> und erstelle dir einen.`});
            })
        }

        if (rows[0].own_channel_voice === null) {
            client.con.query(`SELECT * FROM storage WHERE type = 'channel' AND name = 'OWN_CHANNEL_VOICE'`, (err, rows) => {
                if (err) throw err;
                return interaction.followUp({content: `Du hast aktuell keinen eigene Voicechannel. Gehe gerne in <#${rows[0].id}> und erstelle dir einen.`});
            })
        }

        if(newSlots == undefined){
            return interaction.followUp({content: `Du musst deinem Channel mindestens \`1 Slot\` zuweisen.`});
        }

        if(newSlots < 1){
            return interaction.followUp({content: `Du musst deinem Channel mindestens \`1 Slot\` zuweisen.`});
        }

        if(newSlots > 25){
            return interaction.followUp({content: `Du kannst deinem Channel maximal \`25 Slots\` zuweisen.`});
        }

        client.guilds.fetch(client.config.guild).then(g => {
            const c = g.channels.resolve(rows[0].own_channel_voice);
            c.setUserLimit(newSlots);
            interaction.followUp({content: `Dein Channel hat nun \`${newSlots} Slots\``});
        })
    })

}

function deleteChannel(client, interaction, args) {
    client.con.query(`SELECT * FROM user WHERE id = ` + interaction.member.id, (err, rows) => {
        if (err) throw err;

        if (rows.length === 0) {
            return interaction.followUp({content: `Du hast aktuell keinen eigene Voicechannel.`});
        }

        if (rows[0].own_channel_voice === null) {
            return interaction.followUp({content: `Du hast aktuell keinen eigene Voicechannel.`});
        }

        client.guilds.fetch(client.config.guild).then(g => {
            const c = g.channels.resolve(rows[0].own_channel_voice);
            client.con.query(`UPDATE user SET own_channel_voice = null WHERE own_channel_voice = ${c.id}`)
            c.delete("Requested by User");
            interaction.followUp({content: `Dein Channel wurde gelöscht.`});
        })

    });
}