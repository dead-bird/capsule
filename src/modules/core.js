import chalk from 'chalk';

const $ = '⌛️ capsule:';

const log = {
  info: x => console.info(chalk.magenta(chalk.bold($), x)),
  warn: x => console.warn(chalk.yellow(chalk.bold($), x)),
  error: x => console.error(chalk.red(chalk.bold($), x)),
};

/**
 * Grab a day-month from a Date for yearless comparisons.
 * @param {date} d a JavaScript Date
 */
const date = d => `${d.getDate()}-${d.getMonth() + 1}`;

const targetChannel = 'memories';

/**
 * Find our #memories channel
 * @param {Discord.GuildChannelManager} channels
 */
const findTargetChannel = ({ cache }) => {
  return cache.find(({ name }) => name === targetChannel);
};

export default { findTargetChannel, targetChannel, date, log };
