import { Command } from 'commander'

const program = new Command()

program
  .name('ara')
  .description('A multi-tool for bun based projects')
  .version(
    '0.0.1',
    '-v, --version',
    'Output the current version',
  )

program.parse(process.argv)
