import { ARAConfig, ARAConfigPath } from 'types'
import { configPath, paths } from '../../constants'
import * as JSONC from 'comment-json'
import * as TOML from 'toml-patch'

/**
 * Generates an array of full paths based on the provided configuration path object.
 *
 * @param configPath - The configuration path object containing locations, names, and extensions.
 * @returns An array of strings representing full paths generated from the combinations of locations, names, and extensions.
 */
function generateConfigPaths(configPath: ARAConfigPath): string[] {
  const result: string[] = []

  configPath.locations.forEach((location) => {
    configPath.names.forEach((name) => {
      configPath.extensions.forEach((extension) => {
        const _location = location === '.'
          ? ''
          : `${location}/`
        const fullPath = `${_location}${name}.${extension}`
        result.push(fullPath)
      })
    })
  })

  return result
}

/**
 * Retrieves and parses the configuration from specified paths asynchronously.
 *
 * @param customPath - A custom path to a configuration file.
 * @returns A promise that resolves to an ARAConfig object based on the configuration files found in the generated paths.
 */
export async function getConfig(customPath?: string): Promise<ARAConfig> {
  const configPaths = customPath
    ? [customPath]
    : generateConfigPaths(configPath)

  const configs: Array<ARAConfig | undefined> = await Promise.all(configPaths.map(async (path) => {
    const filepath = `${process.cwd()}/${path}`
    const file = Bun.file(filepath)

    if (await file.exists() && path.endsWith('.json')) {
      return file.json()
    }
    else if (await file.exists() && path.endsWith('.jsonc')) {
      return JSONC.parse(
        await file.text(),
        undefined,
        true,
      )
    }
    else if (await file.exists() && path.endsWith('.toml')) {
      return TOML.parse(await file.text())
    }
    else if (await file.exists()) {
      return file.json()
    }

    return undefined
  }))

  const config = configs.find(c => c !== undefined)

  return {
    clean: config
      ? config.clean
      : [],
    update: {
      exclude: config?.update?.exclude
        ? config.update.exclude
        : [],
      force: config?.update?.force
        ? config.update.force
        : false,
      install: config?.update?.install
        ? config.update.install
        : false,
      write: config?.update?.write
        ? config.update.write
        : false,
    },
  }
}

/**
 * Asynchronously generates a configuration file based on the specified destination and type.
 *
 * @param options - An object containing the configuration options.
 * @param options.dest - The destination for the generated configuration file ("root" or "workspace").
 * @param options.type - The type of the configuration file to be generated ("json", "jsonc", or "toml").
 * @returns A promise that resolves when the configuration file is successfully generated or rejects with an error message.
 */
export async function generateConfig({
  dest = 'root', type = 'jsonc',
}: {
  dest: 'root' | 'workspace'
  type: 'json' | 'jsonc' | 'toml'
}): Promise<void> {
  const config = await getConfig()

  const configPath
    = dest === 'root'
      ? `${paths.root}/ara.config.${type}`
      : `${paths.workspace}/ara.config.${type}`

  const serializers: Record<string, (data: unknown) => string | Promise<string>> = {
    json: data => JSON.stringify(
      data,
      null,
      4,
    ),
    jsonc: async () => {
      const result = Bun.file(`${paths.root}/ara.config.jsonc`)
      return await result.exists()
        ? JSONC.stringify(
          JSONC.parse(await result.text()),
          null,
          4,
        )
        : ''
    },
    toml: data => TOML.stringify(data),
  }

  const serializer = serializers[type]

  if (serializer) {
    const serializedData = await serializer(config)
    await Bun.write(
      configPath,
      serializedData,
    )
  }
  else {
    throw new Error(`Unsupported configuration type: ${type}`)
  }
}
