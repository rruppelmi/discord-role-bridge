import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes
} from "discord.js";

// -------- path setup (esm safe) --------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------- config --------
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ missing env vars");
  process.exit(1);
}

// -------- data file --------
const DATA_PATH = path.join(__dirname, "links.json");
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({}, null, 2));
}

// -------- discord client --------
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// -------- slash command --------
const commands = [
  new SlashCommandBuilder()
    .setName("vehicle-access")
    .setDescription("link your discord to roblox")
    .addStringOption(opt =>
      opt
        .setName("roblox_username")
        .setDescription("your roblox username")
        .setRequired(true)
    )
    .toJSON()
];

// -------- register commands --------
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("⏳ registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ slash commands registered");
  } catch (err) {
    console.error("❌ command registration failed", err);
  }
})();

// -------- ready --------
client.once("clientReady", () => {
  console.log(`🤖 logged in as ${client.user.tag}`);
});

// -------- interaction --------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "vehicle-access") return;

  console.log("📥 interaction received from", interaction.user.id);

  const robloxName = interaction.options.getString("roblox_username");
  const discordId = interaction.user.id;

  const links = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  links[discordId] = robloxName;

  fs.writeFileSync(DATA_PATH, JSON.stringify(links, null, 2));

  console.log("🔗 updated links:", links);

  await interaction.reply({
    content: `✅ linked to roblox user **${robloxName}**`,
    ephemeral: true
  });
});

// -------- login --------
client.login(TOKEN);
