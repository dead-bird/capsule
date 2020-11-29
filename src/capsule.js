import { MessageEmbed, Client } from 'discord.js';
import dotenv from 'dotenv/config';
import core from './modules/core';

const bot = new Client();

bot.login(process.env.TOKEN).catch(e => core.log.error(e));

bot.on('error', e => core.log.error(e));
bot.on('warn', w => core.log.warn(w));
bot.on('ready', () => {
  core.log.info('ready');

  bot.guilds.cache.each(async ({ channels }) => {
    const archive = (await getArchive(channels)) || [];

    const me = await bot.users.fetch('ID');

    archive
      .flat()
      .sort((a, b) => a.year - b.year)
      .forEach(archive => {
        me.send(
          `***${archive.year} year${archive.year > 1 ? 's' : ''} ago:***`
        );

        archive.messages.forEach(message => {
          me.send(buildEmbed(message));
        });
      });
  });
});

/**
 * Get a full archive of pins from a Server
 * @param {GuildChannelManager} channels
 */
async function getArchive({ cache }) {
  return cache.reduce(async (pins, { type, messages }) => {
    let all = await pins;

    if (type === 'text') {
      const archive = (await getPins(messages)) || {};

      if (Object.entries(archive).length !== 0) {
        all.push(archive);
      }
    }

    return all;
  }, Promise.resolve([]));
}

/**
 * Get a full archive of pins, grouped by year
 * @param {MessageManager} messages
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

    return {};
  }
}

/**
 * Build a Discord Embed from a Message
 * @param {Message} message
 */
function buildEmbed({ url, content, author, channel, createdAt }) {
  // TODO grab attachment
  return new MessageEmbed({
    url,
    title: null,
    color: 7506394,
    timestamp: createdAt,
    footer: { text: `#${channel.name}` },
    description: `${content}\n\nPosted by <@${author.id}>`,
    author: {
      icon_url: author.displayAvatarURL(),
      name: 'View Message 👉',
      url,
    },
  });
}
