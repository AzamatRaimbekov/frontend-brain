/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Plugin } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PAGES_DIR = path.resolve(__dirname, '../../src/pages')
const GLOBAL_TYPES_FILE = path.resolve(
  __dirname,
  '../../src/@types/params-all.d.ts',
)

// Функция для рекурсивного поиска динамических параметров в []-папках
function extractDynamicParams(dir: string = PAGES_DIR): string[] {
  if (!fs.existsSync(dir)) return []

  const dynamicParams: string[] = []

  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
          dynamicParams.push(entry.name.slice(1, -1))
        }
        traverse(fullPath) // Рекурсивно заходим внутрь
      }
    }
  }

  traverse(dir)
  return dynamicParams
}

// Функция обновления файла с типами, если данные изменились
function updateGlobalTypes() {
  const params = extractDynamicParams()
  const typeContent =
    params.length > 0 ? params.map((p) => `'${p}'`).join(' | ') : 'never'

  const globalTypeDefinition = `declare global {
  type AllPageParams = ${typeContent}
}

export {}\n`

  // Создаем директорию если её нет
  const dir = path.dirname(GLOBAL_TYPES_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Проверяем, изменилось ли содержимое файла
  if (fs.existsSync(GLOBAL_TYPES_FILE)) {
    const existingContent = fs.readFileSync(GLOBAL_TYPES_FILE, 'utf-8')
    if (existingContent === globalTypeDefinition) {
      return // Файл уже актуален, не перезаписываем
    }
  }

  // Записываем обновленный файл
  fs.writeFileSync(GLOBAL_TYPES_FILE, globalTypeDefinition, 'utf-8')
}

// Простая реализация дебаунса
let debounceTimer: NodeJS.Timeout | null = null
function debouncedUpdate() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    updateGlobalTypes()
    console.log(
      '[vite-plugin-dynamic-types] Types updated, restarting server...',
    )
  }, 300) // 300ms задержка
}

export function dynamicTypesPlugin(): Plugin {
  return {
    name: 'vite-plugin-dynamic-types',
    configureServer(server) {
      server.watcher.add(PAGES_DIR)
      server.watcher.on('all', (event, filePath) => {
        if (filePath.startsWith(PAGES_DIR)) {
          debouncedUpdate()
          server.restart()
        }
      })
    },
    buildStart() {
      updateGlobalTypes()
    },
  }
}
