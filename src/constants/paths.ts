import { ARAConfigPath } from 'types'

const root = process.cwd()
const workspace = `${root}/.ara`
const temp = `${workspace}/.temp`

export const paths = {
  root,
  workspace,
  temp,
}

export const configPath: ARAConfigPath = {
  locations: [
    root,
    workspace,
  ],
  names: ['ara.config'],
  extensions: [
    'json',
    'jsonc',
    'toml',
  ],
}
