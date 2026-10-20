import { act, render, screen } from '@testing-library/react';
import { TOAST_DURATION_MS, Toast } from './Toast';
import { useToastStore } from './useToastStore';

const HALF_DURATION_MS = TOAST_DURATION_MS / 2;

beforeEach(() => {
  vi.useFakeTimers();
  useToastStore.getState().hide();
});

afterEach(() => {
  vi.useRealTimers();
});

const show = (message: string) => {
  act(() => {
    useToastStore.getState().show(message);
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
});
