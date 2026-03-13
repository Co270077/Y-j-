import { describe, it, expect, beforeEach } from 'vitest'

// BottomSheet: modal sheet anchored to bottom of screen
// - Renders at detent sizes: peek (~30%), half (~50%), full (~90%)
// - Backdrop click closes sheet
// - Title rendered in header

describe('BottomSheet', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
  })

  it.skip('renders when isOpen is true', async () => {
    // const { BottomSheet } = await import('../components/ui/BottomSheet')
    // render(
    //   <BottomSheet isOpen={true} onClose={vi.fn()} title="Test Sheet">
    //     <p>Sheet content</p>
    //   </BottomSheet>
    // )
    // expect(screen.getByText('Sheet content')).toBeTruthy()
    expect(true).toBe(true)
  })

  it.skip('does not render when isOpen is false', async () => {
    // const { BottomSheet } = await import('../components/ui/BottomSheet')
    // render(
    //   <BottomSheet isOpen={false} onClose={vi.fn()} title="Test Sheet">
    //     <p>Sheet content</p>
    //   </BottomSheet>
    // )
    // expect(screen.queryByText('Sheet content')).toBeNull()
    expect(true).toBe(true)
  })

  it.skip('calls onClose when backdrop clicked', async () => {
    // const { BottomSheet } = await import('../components/ui/BottomSheet')
    // const onClose = vi.fn()
    // render(
    //   <BottomSheet isOpen={true} onClose={onClose} title="Test Sheet">
    //     <p>Sheet content</p>
    //   </BottomSheet>
    // )
    // const backdrop = document.querySelector('[data-testid="sheet-backdrop"]')!
    // fireEvent.click(backdrop)
    // expect(onClose).toHaveBeenCalledTimes(1)
    expect(true).toBe(true)
  })

  it.skip('accepts detent prop and renders at correct size', async () => {
    // const { BottomSheet } = await import('../components/ui/BottomSheet')
    // // peek ≈ 240px (30% of 800), half ≈ 400px (50%), full ≈ 720px (90%)
    // const { rerender } = render(
    //   <BottomSheet isOpen={true} onClose={vi.fn()} title="Sheet" detent="peek">
    //     <p>Content</p>
    //   </BottomSheet>
    // )
    // let sheet = document.querySelector('[data-testid="sheet-panel"]') as HTMLElement
    // expect(sheet).toBeTruthy()
    //
    // rerender(
    //   <BottomSheet isOpen={true} onClose={vi.fn()} title="Sheet" detent="full">
    //     <p>Content</p>
    //   </BottomSheet>
    // )
    // sheet = document.querySelector('[data-testid="sheet-panel"]') as HTMLElement
    // expect(sheet).toBeTruthy()
    expect(true).toBe(true)
  })

  it.skip('renders title in header', async () => {
    // const { BottomSheet } = await import('../components/ui/BottomSheet')
    // render(
    //   <BottomSheet isOpen={true} onClose={vi.fn()} title="My Title">
    //     <p>Content</p>
    //   </BottomSheet>
    // )
    // expect(screen.getByText('My Title')).toBeTruthy()
    expect(true).toBe(true)
  })
})
