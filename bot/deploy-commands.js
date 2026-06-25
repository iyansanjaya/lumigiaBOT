/**
 * LumigiaBOT — Deployer Slash Command
 * Mendaftarkan semua slash command ke API Discord.
 * Jalankan: node deploy-commands.js
 */

import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = join(__dirname, 'src', 'commands');

async function deploy() {
  const commands = [];

  // Kumpulkan semua data command
  const categories = await readdir(COMMANDS_DIR, { withFileTypes: true });

  for (const category of categories) {
    if (!category.isDirectory()) continue;

    const categoryPath = join(COMMANDS_DIR, category.name);
    const files = await readdir(categoryPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.js')) continue;

      const command = await import(`file://${join(categoryPath, file.name)}`);

      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }

  // Deploy ke Discord
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  console.log(`Mendeploy ${commands.length} slash command...`);

  const data = await rest.put(
    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
    { body: commands },
  );

  console.log(`✅ Berhasil mendeploy ${data.length} command secara global.`);
}

deploy().catch(console.error);
