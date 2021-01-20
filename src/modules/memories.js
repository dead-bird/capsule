import { MessageEmbed } from 'discord.js';
import setup from './setup';
import core from './core';

/**
 * The main memory function that gets/sends Pins
 * @param {Discord.Client} bot
 */
export default function run(bot) {
  bot.guilds.cache.each(async guild => {
    // Try and get the target, or try and create it
    const channel = core.findTargetChannel(guild) || (await setup(guild));

    // If we don;t have a channel at this point, the bot doesn't have full access :feelsbadman:
    if (!channel) {
      return;
    }

    const archive = await getArchive(guild.channels);

    archive.forEach(({ messages, year }) => {
      // Send a date stamp
      channel.send(`**📌  ${year} year${year > 1 ? 's' : ''} ago:**`);

      // Loop through messages in this year and send a fancy Embed
      messages.forEach(msg => channel.send(buildEmbed(msg)));
    });
  });
}

/**
 * Get a full archive of pins from a Server
 * @param {Discord.GuildChannelManager} channels
 */
async function getArchive({ cache }) {
  // Grab pins from TextChannels
  const archive = await cache.reduce(async (pins, { type, messages }) => {
    // As this is async/await, we're returning a Promise each time.
    // Let's await it before continuing
    let all = await pins;

    if (type === 'text') {
      const archive = (await getPins(messages)) || {};

      if (Object.entries(archive).length !== 0) {
        all.push(archive);
      }
    }

    return all;
  }, Promise.resolve([]));

  if (archive && archive.length) {
    // Flatten the archive and sort it by Year
    return archive.flat().sort((a, b) => a.year - b.year);
  }

  return [];
}

/**
 * Get a full archive of pins, grouped by year
 * @param {Discord.MessageManager} messages
 */
async function getPins(messages) {
  const compare = core.date(new Date());

  try {
    const pins = await messages.fetchPinned();

    return pins.reduce((pins, pin) => {
      if (core.date(pin.createdAt) === compare) {
        const year = new Date().getFullYear() - pin.createdAt.getFullYear();

        let current = pins.find(p => p.year === year);

        if (!current) {
          current = { year, messages: [] };

          pins.push(current);
        }

        current.messages.push(pin);
      }

      return pins;
    }, []);
  } catch (e) {
    core.log.error(e);

    return [];
  }
}

/**
 * Build a Discord Embed from a Message
 * @param {Discord.Message} message
 */
function buildEmbed({ attachments, url, content, author, channel, createdAt }) {
  const { attachment } = attachments.first() || {};

  return new MessageEmbed({
    url,
    color: '#2ecc71',
    timestamp: createdAt,
    image: { url: attachment },
    footer: { text: `#${channel.name}` },
    description: `${content}\nPosted by <@${author.id}>\n\n[🔍 View Message](${url})`,
    author: {
      icon_url: author.displayAvatarURL(),
      name: author.username,
    },
  });
}
