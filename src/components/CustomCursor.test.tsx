/**
 * Unit tests for CustomCursor (task 10.1).
 *
 * Rendered inside a ReducedMotionProvider with a mocked `matchMedia` so both
 * the motion preference and the pointer fineness are controlled per test.
 *
 * Covered behaviors:
 *  - WHERE the pointer is fine AND motion is allowed, the cursor mounts and
 *    hides the native cursor (Requirement 22.1);
 *  - IF the pointer is coarse (touch-only) OR Reduced_Motion is active, the
 *    cursor renders null and the native cursor is left intact
 *    (Requirements 22.5, 37.3);
 *  - the cursor reflects `[data-cursor]` state on pointer move (Req 22.2/22.4);
 *  - unmounting restores the native cursor (Requirement 22.5).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockMatchMedia, resetMatchMedia } from '@/test/matchMedia';
import { CustomCursor } from './CustomCursor';

/**
 * Install a matchMedia mock for a specific combination of reduced-motion and
 * pointer fineness, then render CustomCursor inside the provider.
 */
function renderCursor(opts: { reducedMotion: boolean; finePointer: boolean }) {
  mockMatchMedia({
    '(prefers-reduced-motion: reduce)': opts.reducedMotion,
    '(pointer: fine)': opts.finePointer,
  });
  return render(
    <ReducedMotionProvider>
      <CustomCursor />
    </ReducedMotionProvider>,
  );
}

afterEach(() => {
  resetMatchMedia();
  document.body.style.cursor = '';
});

describe('CustomCursor (fine pointer + motion allowed)', () => {
  it('mounts the custom cursor element and hides the native cursor', () => {
    renderCursor({ reducedMotion: false, finePointer: true });

    expect(screen.getByTestId('custom-cursor')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cursor-dot')).toBeInTheDocument();
    expect(screen.getByTestId('custom-cursor-ring')).toBeInTheDocument();
    // Native cursor hidden while active (Req 22.1).
    expect(document.body.style.cursor).toBe('none');
  });

  it('presents the link state over [data-cursor="link"] (Req 22.2)', () => {
    renderCursor({ reducedMotion: false, finePointer: true });

    const link = document.createElement('a');
    link.setAttribute('data-cursor', 'link');
    document.body.appendChild(link);

    // Dispatch on the element so it bubbles to the window listener with
    // event.target === link (jsdom ignores `target` in the init object).
    fireEvent.pointerMove(link, { clientX: 10, clientY: 10 });

    expect(screen.getByTestId('custom-cursor')).toHaveAttribute(
      'data-cursor-state',
      'link',
    );
    document.body.removeChild(link);
  });

  it('presents the labeled view state over [data-cursor="view"] (Req 22.4)', () => {
    renderCursor({ reducedMotion: false, finePointer: true });

    const media = document.createElement('div');
    media.setAttribute('data-cursor', 'view');
    document.body.appendChild(media);

    fireEvent.pointerMove(media, { clientX: 20, clientY: 20 });

    expect(screen.getByTestId('custom-cursor')).toHaveAttribute(
      'data-cursor-state',
      'view',
    );
    expect(screen.getByTestId('custom-cursor-ring')).toHaveTextContent('VIEW');
    document.body.removeChild(media);
  });

  it('restores the native cursor on unmount (Req 22.5)', () => {
    const { unmount } = renderCursor({ reducedMotion: false, finePointer: true });
    expect(document.body.style.cursor).toBe('none');
    unmount();
    expect(document.body.style.cursor).not.toBe('none');
  });
});

describe('CustomCursor (reduced motion or coarse pointer → null)', () => {
  it('renders null when Reduced_Motion is active (Req 22.5 / 37.3)', () => {
    const { container } = renderCursor({ reducedMotion: true, finePointer: true });
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('custom-cursor')).toBeNull();
    // Native cursor untouched.
    expect(document.body.style.cursor).not.toBe('none');
  });

  it('renders null on a touch-only (coarse pointer) device (Req 22.5)', () => {
    const { container } = renderCursor({ reducedMotion: false, finePointer: false });
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('custom-cursor')).toBeNull();
    expect(document.body.style.cursor).not.toBe('none');
  });

  it('renders null when both coarse pointer and reduced motion (Req 22.5)', () => {
    const { container } = renderCursor({ reducedMotion: true, finePointer: false });
    expect(container).toBeEmptyDOMElement();
  });
});
