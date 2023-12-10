import { describe, expect, test } from 'bun:test'
import { getConfig } from '../../src/utils/config/index'

describe(
  'ara::utils',
  () => {
    describe(
      'config',
      () => {
        test(
          'getConfig()',
          async () => {
            const result = await getConfig()

            console.log(result)

            expect(typeof result).toBe('object')
          },
        )
      },
    )
  },
)
