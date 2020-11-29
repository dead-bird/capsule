import memories from './modules/memories';
import { scheduleJob } from 'node-schedule';
import { Client } from 'discord.js';
import setup from './modules/setup';
import dotenv from 'dotenv/config';
import core from './modules/core';

const bot = new Client();

bot.login(process.env.TOKEN).catch(e => core.log.error(e));

bot.on('guildCreate', guild => setup(guild));
bot.on('error', e => core.log.error(e));
bot.on('warn', w => core.log.warn(w));
bot.on('ready', () => {
  core.log.info('ready');

  // https://crontab.guru/#0_9_*_*_*
  // scheduleJob('0 9 * * *', () => memories(bot));

  memories(bot);
});
