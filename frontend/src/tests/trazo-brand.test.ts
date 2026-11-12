/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

function readTokens(selector: ':root' | '.dark'): Map<string, string> {
  const css = readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8')
  const blockStart = css.indexOf(`${selector} {`)

  if (blockStart === -1) {
    throw new Error(`No se encontró el bloque ${selector} en tokens.css`)
  }

  const openingBrace = css.indexOf('{', blockStart)
  let depth = 0
  let closingBrace = openingBrace

  for (let index = openingBrace; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}') {
      depth -= 1
      if (depth === 0) {
        closingBrace = index
        break
      }
    }
  }

  const block = css.slice(openingBrace + 1, closingBrace)
  const variables = new Map<string, string>()

  for (const match of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    variables.set(match[1] ?? '', match[2]?.trim() ?? '')
  }

  return variables
}

function resolveToken(
  variables: Map<string, string>,
  name: string,
  depth = 0,
): string {
  const value = variables.get(name)
  if (value === undefined) throw new Error(`Token no encontrado: --${name}`)
  if (depth > 10) throw new Error(`Referencia circular en --${name}`)

  const reference = /^var\(--([\w-]+)\)$/.exec(value)
  if (!reference) return value

  return resolveToken(variables, reference[1] ?? '', depth + 1)
}

function luminance(hex: string): number {
  const [red = 0, green = 0, blue = 0] = [1, 3, 5].map((index) => {
    const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(first: string, second: string): number {
  const light = Math.max(luminance(first), luminance(second))
  const dark = Math.min(luminance(first), luminance(second))
  return (light + 0.05) / (dark + 0.05)
}

describe('Trazo token contrast — light', () => {
  const tokens = readTokens(':root')

  const pairs: Array<[string, string, string]> = [
    ['Texto principal sobre marfil', 'text-primary', 'background'],
    ['Texto secundario sobre marfil', 'text-secondary', 'background'],
    ['Blanco sobre botón primario', 'primary-foreground', 'primary'],
    [
      'Terracota accesible sobre superficie',
      'brand-terracotta-hover',
      'surface',
    ],
    ['Éxito sobre fondo suave', 'success', 'success-soft'],
    ['Advertencia sobre fondo suave', 'warning', 'warning-soft'],
    ['Error sobre fondo suave', 'danger', 'danger-soft'],
    ['Info sobre fondo suave', 'info', 'info-soft'],
    ['Texto de sidebar sobre grafito', 'sidebar-foreground', 'sidebar'],
    ['Marfil sobre grafito', 'brand-ivory', 'brand-graphite'],
  ]

  for (const [label, foreground, background] of pairs) {
    it(`${label} cumple AA (4.5:1)`, () => {
      const ratio = contrast(
        resolveToken(tokens, foreground),
        resolveToken(tokens, background),
      )

      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('Trazo token contrast — dark', () => {
  const tokens = readTokens('.dark')

  const pairs: Array<[string, string, string]> = [
    ['Texto principal sobre fondo nocturno', 'text-primary', 'background'],
    ['Texto principal sobre tarjeta nocturna', 'text-primary', 'surface'],
    ['Texto secundario sobre fondo nocturno', 'text-secondary', 'background'],
    ['Texto secundario sobre tarjeta nocturna', 'text-secondary', 'surface'],
    ['Primario sobre su texto', 'primary-foreground', 'primary'],
    ['Terracota luminosa sobre tarjeta', 'brand-terracotta', 'surface'],
    ['Terracota clara sobre tarjeta', 'brand-terracotta-hover', 'surface'],
    ['Éxito sobre fondo suave', 'success', 'success-soft'],
    ['Advertencia sobre fondo suave', 'warning', 'warning-soft'],
    ['Error sobre fondo suave', 'danger', 'danger-soft'],
    ['Info sobre fondo suave', 'info', 'info-soft'],
    [
      'Texto de sidebar sobre sidebar nocturna',
      'sidebar-foreground',
      'sidebar',
    ],
    ['Marfil sobre sidebar nocturna', 'brand-ivory', 'sidebar'],
  ]

  for (const [label, foreground, background] of pairs) {
    it(`${label} cumple AA (4.5:1)`, () => {
      const ratio = contrast(
        resolveToken(tokens, foreground),
        resolveToken(tokens, background),
      )

      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })
  }
})

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const absolute = path.join(directory, entry)
    const stats = statSync(absolute)

    if (stats.isDirectory()) return collectSourceFiles(absolute)
    return /\.(tsx?|css|svg)$/.test(entry) ? [absolute] : []
  })
}

describe('Trazo brand guard', () => {
  it('keeps the previous product name out of the frontend source', () => {
    const files = [
      ...collectSourceFiles(path.join(ROOT, 'src')),
      path.join(ROOT, 'index.html'),
    ]
    expect(files.length).toBeGreaterThan(20)

    const oldBrand = ['Proy', 'Track'].join('').toLowerCase()
    const offenders = files.filter((file) =>
      readFileSync(file, 'utf8').toLowerCase().includes(oldBrand),
    )

    expect(offenders).toEqual([])
  })
})
