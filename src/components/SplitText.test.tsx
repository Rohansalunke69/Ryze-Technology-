/**
 * Unit tests for SplitText (task 9.2).
 *
 * Verifies the accessibility + integrity contract:
 *  - the wrapper exposes the original string as a single accessible name via
 *    `aria-label` (Requirement 25.2);
 *  - every decorative fragment span is `aria-hidden` (Requirement 25.2);
 *  - the concatenation of the rendered span text reconstructs the original
 *    text exactly (no loss/duplication) for word and char splits;
 *  - under reduced motion the text renders in its final visible state with no
 *    hidden/opacity-0 fragments, while preserving the accessible structure
 *    (Requirement 37.2).
 *
 * SplitText reads the motion preference via `useReducedMotion`, so renders are
 * wrapped in a `ReducedMotionProvider` with mocked `matchMedia`, and
 * `IntersectionObserver` is stubbed because jsdom does not implement it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { SplitText } from './SplitText';

/** Minimal IntersectionObserver stub — never reports intersection. */
class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
});

function renderSplit(ui: React.ReactNode) {
  return render(<ReducedMotionProvider>{ui}</ReducedMotionProvider>);
}

/** Find the SplitText wrapper element by its accessible name. */
function getWrapper(container: HTMLElement, label: string): HTMLElement {
  const wrapper = container.querySelector(`[aria-label="${label}"]`);
  if (wrapper === null) {
    throw new Error(`No SplitText wrapper with aria-label="${label}"`);
  }
  return wrapper as HTMLElement;
}

function fragmentSpans(wrapper: HTMLElement): HTMLSpanElement[] {
  return Array.from(wrapper.querySelectorAll('span'));
}

describe('SplitText', () => {
  it('exposes the original text via aria-label on the wrapper', () => {
    mockReducedMotion(false);
    const { container } = renderSplit(<SplitText text="Hello world" />);

    const wrapper = getWrapper(container, 'Hello world');
    expect(wrapper).toHaveAttribute('aria-label', 'Hello world');
  });

  it('marks every fragment span aria-hidden', () => {
    mockReducedMotion(false);
    const { container } = renderSplit(<SplitText text="Hello world" />);

    const spans = fragmentSpans(getWrapper(container, 'Hello world'));
    expect(spans.length).toBeGreaterThan(0);
    for (const span of spans) {
      expect(span).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('reconstructs the original text from word-split spans', () => {
    mockReducedMotion(false);
    const text = 'Crafting elegant digital experiences';
    const { container } = renderSplit(<SplitText text={text} by="word" />);

    const spans = fragmentSpans(getWrapper(container, text));
    const reconstructed = spans.map((span) => span.textContent ?? '').join('');
    expect(reconstructed).toBe(text);
  });

  it('reconstructs the original text from char-split spans', () => {
    mockReducedMotion(false);
    const text = 'Ryze AI';
    const { container } = renderSplit(<SplitText text={text} by="char" />);

    const spans = fragmentSpans(getWrapper(container, text));
    const reconstructed = spans.map((span) => span.textContent ?? '').join('');
    expect(reconstructed).toBe(text);
  });

  it('renders in the final visible state under reduced motion', () => {
    mockReducedMotion(true);
    const text = 'Reduced motion headline';
    const { container } = renderSplit(<SplitText text={text} by="word" />);

    const wrapper = getWrapper(container, text);
    // Accessible structure is preserved.
    expect(wrapper).toHaveAttribute('aria-label', text);

    const spans = fragmentSpans(wrapper);
    // Text is still fully reconstructable...
    const reconstructed = spans.map((span) => span.textContent ?? '').join('');
    expect(reconstructed).toBe(text);

    // ...and no fragment is left hidden (opacity 0) or offset.
    for (const span of spans) {
      expect(span.style.opacity).not.toBe('0');
      expect(span.style.transform).toBe('');
      expect(span.style.transition).toBe('');
    }
  });
});
