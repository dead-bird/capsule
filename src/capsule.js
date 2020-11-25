import { Client } from 'discord.js';
import dotenv from 'dotenv/config';
import core from './modules/core';

const bot = new Client();

bot.login(process.env.TOKEN).catch(e => core.log.error(e));

bot.on('error', e => core.log.error(e));
bot.on('warn', w => core.log.warn(w));
bot.on('ready', () => {
  core.log.info('ready');

  bot.guilds.cache.each(({ channels }) => {
    channels.cache.each(async ({ type, messages }) => {
      if (type !== 'text') {
        return;
      }

      try {
        const pins = await messages.fetchPinned();

        const date = core.date(new Date('2017-09-17T19:29:28.769Z'));

        // console.log(date);
        pins
          .filter(message => core.date(message.createdAt) === date)
          .each(message => {
            console.log(message.content);
          });
      } catch (e) {
        core.log.error(e);
      }
    });
  });
});
