import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.login(DISCORD_TOKEN);

app.get("/", (req, res) => {
  res.send("bot is online");
});

app.listen(PORT, () => {
  console.log("server running");
});

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
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
