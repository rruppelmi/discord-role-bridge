import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import express from "express";
import fs from "fs";

// ---------- basic setup ----------
const app = express();
const PORT = process.env.PORT || 3000;

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

// ---------- discord client ----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ---------- ensure links.json exists ----------
if (!fs.existsSync("links.json")) {
  fs.writeFileSync("links.json", "{}");
}

// ---------- slash command definition ----------
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

// ---------- register slash command ----------
const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

client.once("ready", async () => {
  console.log(`bot logged in as ${client.user.tag}`);
  console.log("registering slash command");

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: commands }
    );

    console.log("slash command registered");
  } catch (err) {
    console.error("command registration failed:", err);
  }
});

// ---------- handle command ----------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "vehicle-access") {
    const robloxUsername = interaction.options.getString("roblox_username");
    const discordId = interaction.user.id;

    console.log("interaction received from", discordId);

    const data = fs.readFileSync("links.json", "utf8");
    const links = JSON.parse(data);

    links[discordId] = robloxUsername;

    fs.writeFileSync("links.json", JSON.stringify(links, null, 2));

    console.log("current links:", links);

    await interaction.reply({
      content: `✅ your roblox username **${robloxUsername}** has been linked.`,
      ephemeral: true
    });
  }
});

// ---------- login ----------
client.login(DISCORD_TOKEN);

// ---------- web server (railway health check) ----------
app.get("/", (req, res) => {
  res.send("bot is online");
});

app.listen(PORT, () => {
  console.log("server running");
});
