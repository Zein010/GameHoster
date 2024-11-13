
import { Client, Collection, Events, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
const SendMessage = async (req, res) => {

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    });

    // Log in to Discord with your client's token
    client.login(token);

    client.commands = new Collection();
    client.commands.set("ping", {
        data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping the server'),
        async execute(interaction) {
            // interaction.user is the object representing the User who ran the command
            // interaction.member is the GuildMember object, which represents the user in the specific guild
            await interaction.reply(`Pong`);
        },
    })
}

const DiscordController = { SendMessage };
export default DiscordController