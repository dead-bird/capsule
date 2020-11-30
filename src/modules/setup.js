import core from './core';

/**
 * Create a #memories channel when we join a server
 * @param {Discord.Guild} guild
 */
export default async function run(guild) {
  return guild.me.hasPermission('ADMINISTRATOR')
    ? fullSetup(guild)
    : setupWithoutAdmin(guild);
}

/**
 * Setup our channel
 * @param {Discord.Guild} guild
 */
async function fullSetup(guild) {
  // Try and grab #memories
  let channel = core.findTargetChannel(guild.channels);

  // Create #memories channel & deny everyone access (admins will override this)
  if (!channel) {
    channel = await guild.channels.create(core.targetChannel, {
      topic: 'A channel for your past pins ',
      permissionOverwrites: [{ id: guild.id, deny: ['VIEW_CHANNEL'] }],
    });
  }

  channel.send(`Hello 👋🏻 I'll be posting memories here`);

  return channel;
}

/**
 * Ask an admin to setup our channel
 * @param {Discord.Guild} guild
 */
function setupWithoutAdmin(guild) {
  // If we don't have perms to create #memories, try and find a #general channel
  const channel = guild.channels.cache.find(
    c => c.type === 'text' && c.permissionsFor(guild.me).has('SEND_MESSAGES')
  );

  if (channel) {
    // Message #general and ask for a channel
    channel.send(
      `To get memories, please create a #${core.targetChannel} text channel and give me admin access 🙏`
    );
  } else {
    // Message the owner and ask for a channel
    guild.owner.send(
      `To get memories, please create a #${core.targetChannel} text channel in your ${guild.name} server and give me admin access 🙏`
    );
  }

  return null;
}
