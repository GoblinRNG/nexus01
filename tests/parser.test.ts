import { describe, it, expect } from 'vitest'
import { parseActionMessage } from '../src/logic/parser.ts'

describe('parseActionMessage', () => {
  it('1. "You get some logs." → op:add, outputItem:Logs, outputQty:1', () => {
    const result = parseActionMessage('You get some logs.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('add')
    expect(result!.outputItem).toBe('Logs')
    expect(result!.outputQty).toBe(1)
  })

  it('2. "You get some oak logs." → op:add, outputItem:Oak logs, outputQty:1', () => {
    const result = parseActionMessage('You get some oak logs.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('add')
    expect(result!.outputItem).toBe('Oak logs')
    expect(result!.outputQty).toBe(1)
  })

  it('3. "You swing your hatchet at the tree." → null', () => {
    const result = parseActionMessage('You swing your hatchet at the tree.')
    expect(result).toBeNull()
  })

  it('4. "The fire catches and the logs begin to burn." → op:remove, inputItem:Logs, inputQty:1', () => {
    const result = parseActionMessage('The fire catches and the logs begin to burn.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('remove')
    expect(result!.inputItem).toBe('Logs')
    expect(result!.inputQty).toBe(1)
  })

  it('5. "You add a log to the fire." → op:remove, inputItem:Logs, inputQty:1', () => {
    const result = parseActionMessage('You add a log to the fire.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('remove')
    expect(result!.inputItem).toBe('Logs')
    expect(result!.inputQty).toBe(1)
  })

  it('6. "You attempt to light the logs." → null', () => {
    const result = parseActionMessage('You attempt to light the logs.')
    expect(result).toBeNull()
  })

  it('7. "You fletch 15 arrow shafts." → op:transform, inputItem:Logs, inputQty:1, outputItem:Arrow shafts, outputQty:15', () => {
    const result = parseActionMessage('You fletch 15 arrow shafts.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('transform')
    expect(result!.inputItem).toBe('Logs')
    expect(result!.inputQty).toBe(1)
    expect(result!.outputItem).toBe('Arrow shafts')
    expect(result!.outputQty).toBe(15)
  })

  it('8. "You fletch 30 arrow shafts." → outputQty:30', () => {
    const result = parseActionMessage('You fletch 30 arrow shafts.')
    expect(result).not.toBeNull()
    expect(result!.outputQty).toBe(30)
  })

  it('9. "You successfully cook a raw trout." → op:transform, inputItem:Raw trout, inputQty:1, outputItem:Trout, outputQty:1', () => {
    const result = parseActionMessage('You successfully cook a raw trout.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('transform')
    expect(result!.inputItem).toBe('Raw trout')
    expect(result!.inputQty).toBe(1)
    expect(result!.outputItem).toBe('Trout')
    expect(result!.outputQty).toBe(1)
  })

  it('10. "You burn the raw trout." → op:transform, inputItem:Raw trout, inputQty:1, outputItem:Burnt food, outputQty:1', () => {
    const result = parseActionMessage('You burn the raw trout.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('transform')
    expect(result!.inputItem).toBe('Raw trout')
    expect(result!.inputQty).toBe(1)
    expect(result!.outputItem).toBe('Burnt food')
    expect(result!.outputQty).toBe(1)
  })

  it('11. "You catch a raw shark." → op:add, outputItem:Raw shark, outputQty:1', () => {
    const result = parseActionMessage('You catch a raw shark.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('add')
    expect(result!.outputItem).toBe('Raw shark')
    expect(result!.outputQty).toBe(1)
  })

  it('12. "You manage to mine some copper ore." → op:add, outputItem:Copper ore, outputQty:1', () => {
    const result = parseActionMessage('You manage to mine some copper ore.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('add')
    expect(result!.outputItem).toBe('Copper ore')
    expect(result!.outputQty).toBe(1)
  })

  it('13. "You bury the bones." → op:remove, inputItem:Bones, inputQty:1', () => {
    const result = parseActionMessage('You bury the bones.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('remove')
    expect(result!.inputItem).toBe('Bones')
    expect(result!.inputQty).toBe(1)
  })

  it('14. "You bury the dragon bones." → op:remove, inputItem:Dragon bones, inputQty:1', () => {
    const result = parseActionMessage('You bury the dragon bones.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('remove')
    expect(result!.inputItem).toBe('Dragon bones')
    expect(result!.inputQty).toBe(1)
  })

  it('15. "You scatter the ashes." → op:remove, inputItem:Ashes, inputQty:1', () => {
    const result = parseActionMessage('You scatter the ashes.')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('remove')
    expect(result!.inputItem).toBe('Ashes')
    expect(result!.inputQty).toBe(1)
  })

  it('16. "You picked up 12 x Cowhide" → op:add, outputItem:Cowhide, outputQty:12', () => {
    const result = parseActionMessage('You picked up 12 x Cowhide')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('add')
    expect(result!.outputItem).toBe('Cowhide')
    expect(result!.outputQty).toBe(12)
  })

  it('17. "You received 500 coins" → op:add, outputItem:Coins, outputQty:500', () => {
    const result = parseActionMessage('You received 500 coins')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('add')
    expect(result!.outputItem).toBe('Coins')
    expect(result!.outputQty).toBe(500)
  })

  it('18. "You sold 3 x Logs" → op:remove, inputItem:Logs, inputQty:3', () => {
    const result = parseActionMessage('You sold 3 x Logs')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('remove')
    expect(result!.inputItem).toBe('Logs')
    expect(result!.inputQty).toBe(3)
  })

  it('19. "You dropped 1 x Bones" → op:remove, inputItem:Bones, inputQty:1', () => {
    const result = parseActionMessage('You dropped 1 x Bones')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('remove')
    expect(result!.inputItem).toBe('Bones')
    expect(result!.inputQty).toBe(1)
  })

  it('20. "You used 1 x Prayer potion (4)" → op:remove, inputItem:Prayer potion (4), inputQty:1', () => {
    const result = parseActionMessage('You used 1 x Prayer potion (4)')
    expect(result).not.toBeNull()
    expect(result!.op).toBe('remove')
    expect(result!.inputItem).toBe('Prayer potion (4)')
    expect(result!.inputQty).toBe(1)
  })

  it('21. Unrecognized text → null', () => {
    const result = parseActionMessage('This message does not match any known pattern.')
    expect(result).toBeNull()
  })

  it('22. Confidence > 0 for all recognized patterns', () => {
    const messages = [
      'You get some logs.',
      'The fire catches and the logs begin to burn.',
      'You fletch 15 arrow shafts.',
      'You successfully cook a raw trout.',
      'You burn the raw trout.',
      'You catch a raw shark.',
      'You manage to mine some copper ore.',
      'You bury the bones.',
      'You scatter the ashes.',
      'You picked up 12 x Cowhide',
      'You received 500 coins',
      'You sold 3 x Logs',
    ]
    for (const msg of messages) {
      const result = parseActionMessage(msg)
      expect(result, `Expected non-null result for: "${msg}"`).not.toBeNull()
      expect(result!.confidence, `Expected confidence > 0 for: "${msg}"`).toBeGreaterThan(0)
    }
  })
})
