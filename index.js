const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// =======================
// BASIC CONFIG
// =======================
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const LINKS_FILE = path.join(__dirname, "links.json");

// =======================
// LOAD / SAVE LINKS
// =======================
function loadLinks() {
  if (!fs.existsSync(LINKS_FILE)) return {};
  return JSON.parse(fs.readFileSync(LINKS_FILE, "utf8"));
}

function saveLinks(data) {
  fs.writeFileSync(LINKS_FILE, JSON.stringify(data, null, 2));
}

// =======================
// CLIENT SETUP
// =======================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// =======================
// SLASH COMMAND DEFINITION
// =======================
const vehicleCommand = new SlashCommandBuilder()
  .setName("vehicle-access")
  .setDescription("link your roblox username")
  .addStringOption(option =>
    option
      .setName("username")
      .setDescription("your roblox username")
      .setRequired(true)
  );

// =======================
// REGISTER COMMAND
// =======================
client.once("clientReady", async () => {
  console.log(`bot logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: [vehicleCommand.toJSON()] }
    );
    console.log("slash command registered");
  } catch (error) {
    console.error("failed to register slash command:", error);
  }
});

// =======================
// COMMAND HANDLER
// =======================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "vehicle-access") return;

  console.log("interaction received from", interaction.user.id);

  const robloxUsername = interaction.options.getString("username");

  const links = loadLinks();
  links[interaction.user.id] = robloxUsername;
  saveLinks(links);

  console.log("current links:", links);

  await interaction.reply({
    content: `✅ linked roblox username **${robloxUsername}**`,
    ephemeral: true
  });
});

// =======================
// LOGIN
// =======================
client.login(TOKEN);
