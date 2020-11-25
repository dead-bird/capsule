import chalk from 'chalk';

const $ = '⌛️ capsule:';

const log = {
  info: x => console.info(chalk.magenta(chalk.bold($), x)),
  warn: x => console.warn(chalk.yellow(chalk.bold($), x)),
  error: x => console.error(chalk.red(chalk.bold($), x)),
};

export default { log };
