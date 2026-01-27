import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// command registration
import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

const commands = [
  {
    name: "vehicle-access",
    description: "Link your Roblox username to Discord for vehicle access",
    options: [
      {
        name: "roblox_username",
        type: 3, // string
        description: "Your Roblox username",
        required: true
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering /vehicle-access command...");

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: commands }
    );

    console.log("Successfully registered command.");
  } catch (error) {
    console.error(error);
  }
})();

// links storage file
const LINKS_FILE = "links.json";
if (!fs.existsSync(LINKS_FILE)) fs.writeFileSync(LINKS_FILE, "{}");

// handle the command
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "vehicle-access") {
    const robloxUsername = interaction.options.getString("roblox_username");
    const discordId = interaction.user.id;

    const data = fs.readFileSync(LINKS_FILE);
    const links = JSON.parse(data);

    links[discordId] = robloxUsername;

    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));

    await interaction.reply({
      content: `✅ Your Roblox account \`${robloxUsername}\` is now linked!`,
      ephemeral: true
    });
  }
});

client.login(DISCORD_TOKEN);

app.get("/", (req, res) => {
  res.send("bot is online");
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

app.listen(PORT, () => {
  console.log("server running");
});
