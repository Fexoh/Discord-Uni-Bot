const { Client, CommandInteraction } = require("discord.js");

module.exports = {
    name: "würfel",
    description: "Würfel den Würfel & Gewinne Coins",
    type: 'CHAT_INPUT',
    options: [
        {
            type: "SUB_COMMAND",
            name: "regeln",
            description: "Die Regeln vom Spiel \"Würfeln\"",
        },
        {
            type: "SUB_COMMAND",
            name: "play",
            description: "Spiele das Spiel \"Würfeln\"",
            options: [
                {
                    name: "coins",
                    description: "Die Anzahl an Coins, die du setzen möchtest",
                    required: true,
                    type: "INTEGER"
                }
            ],
        }
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
            case "regeln":
                sendRules(client, interaction, args)
                break;
            case "play":
                play(client, interaction, args)
                break;
        }
    },
};

function sendRules(client, interaction, args) {

}

function play(client, interaction, args) {

}
