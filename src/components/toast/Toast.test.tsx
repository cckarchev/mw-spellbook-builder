import { act, render, screen } from '@testing-library/react';
import { Toast } from './Toast';
import { LONG_TOAST_DURATION_MS, TOAST_DURATION_MS, useToastStore } from './useToastStore';

const HALF_DURATION_MS = TOAST_DURATION_MS / 2;

beforeEach(() => {
  vi.useFakeTimers();
  useToastStore.getState().hide();
});

afterEach(() => {
  vi.useRealTimers();
});

const show = (message: string, durationMs?: number) => {
  act(() => {
    useToastStore.getState().show(message, durationMs);
  });
};

const wait = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe('Toast', () => {
  it('keeps an empty live region until there is a message', () => {
    render(<Toast />);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('shows the message, then hides it', () => {
    render(<Toast />);

    show('Link copied');

    expect(screen.getByRole('status')).toHaveTextContent('Link copied');

    wait(TOAST_DURATION_MS);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('gives a repeated message its full time again', () => {
    render(<Toast />);

    show('Link copied');
    wait(HALF_DURATION_MS);
    show('Link copied');
    wait(HALF_DURATION_MS);

    expect(screen.getByRole('status')).toHaveTextContent('Link copied');

    wait(HALF_DURATION_MS);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('keeps a long message up for the longer time', () => {
    render(<Toast />);

    show('Could not copy', LONG_TOAST_DURATION_MS);
    wait(TOAST_DURATION_MS);

    expect(screen.getByRole('status')).toHaveTextContent('Could not copy');

    wait(LONG_TOAST_DURATION_MS - TOAST_DURATION_MS);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
