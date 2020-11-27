import { Client } from 'discord.js';
import dotenv from 'dotenv/config';
import core from './modules/core';

const bot = new Client();

bot.login(process.env.TOKEN).catch(e => core.log.error(e));

bot.on('error', e => core.log.error(e));
bot.on('warn', w => core.log.warn(w));
bot.on('ready', () => {
  core.log.info('ready');

  const date = new Date('2017-09-17T19:29:28.769Z');
  const compare = core.date(date);

  bot.guilds.cache.each(async ({ channels }) => {
    const x = await channels.cache.reduce(
      async (allPromise, { type, messages }) => {
        let all = await allPromise;

        if (type === 'text') {
          try {
            const pins = await messages.fetchPinned();

            const archive = pins.filter(
              ({ createdAt }) => core.date(createdAt) === compare
            );

            if (archive.array().length) {
              all.push(...archive);
            }

            // const year = new Date().getFullYear() - message.createdAt.getFullYear();
            // `${year} year${year > 1 ? 's' : ''} ago, today`,
          } catch (e) {
            core.log.error(e);
          }
        }

        return all;
      },
      Promise.resolve([])
    );

    console.log(x.length);

    // x.forEach(a => {
    //   console.log(a);
    // });
  });
});
