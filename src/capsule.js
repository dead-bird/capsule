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

            const archive = pins.reduce((pins, pin) => {
              if (core.date(pin.createdAt) === compare) {
                const year =
                  new Date().getFullYear() - pin.createdAt.getFullYear();

                let current = pins.find(p => p.year === year);

                if (!current) {
                  current = { year, messages: [] };

                  pins.push(current);
                }

                current.messages.push(pin);
              }

              return pins;
            }, []);

            if (Object.entries(archive).length !== 0) {
              all.push(archive);
            }

            // `${year} year${year > 1 ? 's' : ''} ago, today`,
          } catch (e) {
            core.log.error(e);
          }
        }

        return all;
      },
      Promise.resolve([])
    );

    console.log(x.flat().sort((a, b) => a.year - b.year));
  });
});
