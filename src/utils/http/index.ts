import { handleError } from '..'

/**
 * Asynchronously fetches and downloads a file from the specified URL to the specified path.
 *
 * @param url - The URL of the file to be downloaded.
 * @param path - The path where the downloaded file will be saved.
 * @returns A promise that resolves to an object containing information about the downloaded file (path, size, type) or a string in case of an error.
 */
export async function fetchDownload(
  url: string,
  path: string,
): Promise<
  | {
    path: string
    size: number
    type: string
  }
  | string
    > {
  try {
    const response = await fetch(url) as Response

    if (!response.ok) throw new Error(`Failed to download file from ${url}`)

    const blob = await response.blob()

    await Bun.write(
      path,
      blob,
    )

    const file = Bun.file(path)

    return {
      path: file.name ?? path,
      size: file.size,
      type: file.type,
    }
  }
  catch (error: unknown) {
    return handleError(error)
  }
}
