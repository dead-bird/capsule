import { MessageEmbed } from 'discord.js';
import core from './core';

/**
 * The main memory function that gets/sends Pins
 * @param {Discord.Client} bot
 */
export default function run(bot) {
  bot.guilds.cache.each(async ({ channels }) => {
    // console.log(channels.cache.find(({ name }) => name === core.targetChannel));

    // return;

    const me = await bot.users.fetch('ID');
    const archive = await getArchive(channels);

    archive.forEach(({ messages, year }) => {
      // Send a date stamp
      me.send(`**📌  ${year} year${year > 1 ? 's' : ''} ago:**`);

      // Loop through messages in this year and send a fancy Embed
      messages.forEach(message => {
        me.send(buildEmbed(message));
      });
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
    let all = await pins;

    if (type === 'text') {
      const archive = (await getPins(messages)) || {};

      if (Object.entries(archive).length !== 0) {
        all.push(archive);
      }
    }

    return all;
  }, Promise.resolve([]));

  // Flatten the archive and sort it by Year
  return (archive || []).flat().sort((a, b) => a.year - b.year);
}

/**
 * Get a full archive of pins, grouped by year
 * @param {Discord.MessageManager} messages
 */
async function getPins(messages) {
  const date = new Date('2017-09-17T19:29:28.769Z');
  const compare = core.date(date);

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
    title: null,
    color: '#2ecc71',
    timestamp: createdAt,
    image: { url: attachment },
    footer: { text: `#${channel.name}` },
    description: `${content}\n\nPosted by <@${author.id}>`,
    author: {
      icon_url: author.displayAvatarURL(),
      name: 'View Message  👉',
      url,
    },
  });
}
