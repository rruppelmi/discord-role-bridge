import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import { REST, Routes } from "discord.js";
import fs from "fs";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const app = express();
const PORT = process.env.PORT || 3000;

client.once("ready", () => {
  console.log(`bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

const commands = [
  {
    name: "vehicle-access",
    description: "link your roblox username for vehicle access",
    options: [
      {
        name: "roblox_username",
        description: "your roblox username",
        type: 3,
        required: true
      }
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

client.once("ready", async () => {
  try {
    console.log("registering slash command");

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("slash command registered");
  } catch (err) {
    console.error(err);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "vehicle-access") {
    const robloxUsername = interaction.options.getString("roblox_username");
    const discordId = interaction.user.id;

    const data = fs.readFileSync("links.json");
    const links = JSON.parse(data);

    links[discordId] = robloxUsername;

    fs.writeFileSync("links.json", JSON.stringify(links, null, 2));

    await interaction.reply({
      content: `✅ your roblox username **${robloxUsername}** has been linked to your discord account.`,
      ephemeral: true
    });
  }
});

app.get("/", (req, res) => {
  res.send("bot is online");
});

app.listen(PORT, () => {
  console.log("server running");
});
