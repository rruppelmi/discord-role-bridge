import { Client, GatewayIntentBits } from "discord.js";
import express from "express";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const app = express();
const PORT = process.env.PORT || 3000;

client.once("ready", () => {
  console.log(`bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

app.get("/", (req, res) => {
  res.send("bot is online");
});

app.listen(PORT, () => {
  console.log("server running");
});
