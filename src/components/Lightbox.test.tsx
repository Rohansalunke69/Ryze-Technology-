/**
 * Unit tests for Lightbox (task 9.4).
 *
 * Rendered inside a ReducedMotionProvider with a mocked matchMedia (the
 * Lightbox itself is not motion-gated, but the test harness mirrors the rest of
 * the suite). A small wrapper drives `index`/`open` through React state so
 * navigation via `onIndexChange` is observable end-to-end.
 *
 * Covered behaviors:
 *  - opens as a labeled role="dialog" with aria-modal (Requirements 33.1, 38.4);
 *  - Esc closes (Requirement 38.4);
 *  - next/prev wrap around via wrapIndex (Requirements 33.1, 33.2–33.4);
 *  - arrow keys navigate;
 *  - empty gallery / non-finite index is a no-op (Requirement 33.5);
 *  - focus moves into the dialog on open and is restored on close (Req 38.4).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import type { ImageAsset } from '@app-types';
import { Lightbox } from './Lightbox';

const IMAGES: ImageAsset[] = [
  { src: '/img/a.jpg', width: 1200, height: 800, alt: 'Alpha' },
  { src: '/img/b.jpg', width: 1200, height: 800, alt: 'Bravo' },
  { src: '/img/c.jpg', width: 1200, height: 800, alt: 'Charlie' },
];

afterEach(() => resetMatchMedia());
beforeEach(() => mockReducedMotion(false));

/** Controlled harness wiring index/open into state so navigation is observable. */
function Harness({
  images = IMAGES,
  startIndex = 0,
  onClose,
}: {
  images?: ImageAsset[];
  startIndex?: number;
  onClose?: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [open, setOpen] = useState(true);
  return (
    <ReducedMotionProvider>
      <Lightbox
        images={images}
        index={index}
        open={open}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        onIndexChange={setIndex}
      />
    </ReducedMotionProvider>
  );
}

describe('Lightbox', () => {
  it('opens as a labeled role="dialog" with aria-modal', () => {
    render(<Harness />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', expect.stringContaining('Image 1 of 3'));
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Alpha');
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close image viewer/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('advances to the next image and wraps past the last via wrapIndex', () => {
    render(<Harness startIndex={2} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', expect.stringContaining('Image 3 of 3'));
    fireEvent.click(screen.getByRole('button', { name: /next image/i }));
    // wrapIndex(3, 3) === 0
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', expect.stringContaining('Image 1 of 3'));
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Alpha');
  });

  it('goes to the previous image and wraps before the first via wrapIndex', () => {
    render(<Harness startIndex={0} />);
    fireEvent.click(screen.getByRole('button', { name: /previous image/i }));
    // wrapIndex(-1, 3) === 2
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', expect.stringContaining('Image 3 of 3'));
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Charlie');
  });

  it('navigates with the arrow keys', () => {
    render(<Harness startIndex={0} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', expect.stringContaining('Image 2 of 3'));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', expect.stringContaining('Image 1 of 3'));
  });

  it('is a no-op when the gallery is empty (Req 33.5)', () => {
    render(<Harness images={[]} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a no-op when the index is non-finite (Req 33.5)', () => {
    render(
      <ReducedMotionProvider>
        <Lightbox
          images={IMAGES}
          index={Number.NaN}
          open
          onClose={() => {}}
          onIndexChange={() => {}}
        />
      </ReducedMotionProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not render when open is false', () => {
    render(
      <ReducedMotionProvider>
        <Lightbox images={IMAGES} index={0} open={false} onClose={() => {}} onIndexChange={() => {}} />
      </ReducedMotionProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('moves focus into the dialog on open and restores it on close', async () => {
    function FocusHarness() {
      const [open, setOpen] = useState(false);
      const [index, setIndex] = useState(0);
      return (
        <ReducedMotionProvider>
          <button type="button" onClick={() => setOpen(true)}>
            trigger
          </button>
          <Lightbox
            images={IMAGES}
            index={index}
            open={open}
            onClose={() => setOpen(false)}
            onIndexChange={setIndex}
          />
        </ReducedMotionProvider>
      );
    }

    render(<FocusHarness />);
    const trigger = screen.getByRole('button', { name: 'trigger' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(dialog).toHaveFocus());

    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
