import { describe, expect, it } from 'vitest'
import {
  hasActiveFilters,
  parseProjectFilters,
  serialiseProjectFilters,
} from '@/features/projects/hooks/use-project-filters'

describe('project filters', () => {
  it('uses safe defaults when the URL is empty', () => {
    const filters = parseProjectFilters(new URLSearchParams())

    expect(filters).toMatchObject({
      search: '',
      status: 'all',
      priority: 'all',
      sector: 'all',
      ownerId: '',
      risk: 'all',
      archived: 'no',
      sortBy: 'updatedAt',
      sortDirection: 'desc',
      page: 1,
    })
  })

  it('parses a complete URL and ignores invalid values', () => {
    const filters = parseProjectFilters(
      new URLSearchParams(
        'q=erp&estado=completed&prioridad=critical&sector=technology&responsable=usr_0001&riesgo=alto&archivados=1&orden=name&dir=asc&pagina=3',
      ),
    )

    expect(filters).toMatchObject({
      search: 'erp',
      status: 'completed',
      priority: 'critical',
      sector: 'technology',
      ownerId: 'usr_0001',
      risk: 'alto',
      archived: 'include',
      sortBy: 'name',
      sortDirection: 'asc',
      page: 3,
    })

    const invalid = parseProjectFilters(
      new URLSearchParams('estado=lost&orden=unknown&pagina=-4'),
    )

    expect(invalid.status).toBe('all')
    expect(invalid.sortBy).toBe('updatedAt')
    expect(invalid.page).toBe(1)
  })

  it('round-trips through the URL without emitting defaults', () => {
    const filters = parseProjectFilters(new URLSearchParams())
    const params = serialiseProjectFilters(filters)

    expect(params.toString()).toBe('')
    expect(parseProjectFilters(params)).toEqual(filters)
  })

  it('round-trips the archived modes through the URL', () => {
    const only = parseProjectFilters(new URLSearchParams('archivados=solo'))

    expect(only.archived).toBe('only')
    expect(serialiseProjectFilters(only).get('archivados')).toBe('solo')

    const include = parseProjectFilters(new URLSearchParams('archivados=1'))

    expect(include.archived).toBe('include')
    expect(serialiseProjectFilters(include).get('archivados')).toBe('1')

    expect(
      serialiseProjectFilters(parseProjectFilters(new URLSearchParams())).has(
        'archivados',
      ),
    ).toBe(false)
  })

  it('detects active filters', () => {
    expect(hasActiveFilters(parseProjectFilters(new URLSearchParams()))).toBe(
      false,
    )
    expect(
      hasActiveFilters(
        parseProjectFilters(new URLSearchParams('estado=in_progress')),
      ),
    ).toBe(true)
  })
})
