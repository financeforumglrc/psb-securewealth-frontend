import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OTPSimulation from './OTPSimulation';

const mockSendOtp = vi.fn();
const mockVerifyOtp = vi.fn();
const mockSetLockdownActive = vi.fn();
const mockTriggerDuressLockdown = vi.fn();

vi.mock('../../lib/backendApi', () => ({
  backendApi: {
    sendOtp: (...args: any[]) => mockSendOtp(...args),
    verifyOtp: (...args: any[]) => mockVerifyOtp(...args),
  },
}));

vi.mock('../../services/fingerprintService', () => ({
  getStoredVisitorId: () => 'test-device-id',
}));

vi.mock('../../services/duressService', () => ({
  isDuressPin: (code: string) => code === '000000',
  triggerDuressLockdown: () => mockTriggerDuressLockdown(),
}));

vi.mock('../../store/wealthStore', () => ({
  useWealthStore: (selector: (s: any) => any) => selector({ setLockdownActive: mockSetLockdownActive }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    state: { userEmail: 'test@example.com', userId: 'user-123' },
    dispatch: vi.fn(),
  }),
}));

describe('OTPSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockSendOtp.mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true, data: { recipient: 'te*******@example.com' } },
    });
    mockVerifyOtp.mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('auto-sends OTP on mount and renders inputs', async () => {
    const { container } = render(<OTPSimulation actionType="test" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    await waitFor(() => expect(mockSendOtp).toHaveBeenCalledTimes(1));
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(6);
  });

  it('calls onConfirm immediately when skip is true', async () => {
    const onConfirm = vi.fn();
    render(<OTPSimulation actionType="test" onConfirm={onConfirm} onCancel={vi.fn()} skip />);
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(mockSendOtp).not.toHaveBeenCalled();
  });

  it('verifies a valid 6-digit OTP and triggers onConfirm', async () => {
    const onConfirm = vi.fn();
    const { container } = render(<OTPSimulation actionType="test" onConfirm={onConfirm} onCancel={vi.fn()} />);
    await waitFor(() => expect(mockSendOtp).toHaveBeenCalledTimes(1));

    const inputs = container.querySelectorAll('input[type="password"]');
    for (const input of inputs) {
      await userEvent.type(input, '1');
    }

    const verifyBtn = screen.getByRole('button', { name: /verify/i });
    await userEvent.click(verifyBtn);

    await waitFor(() => expect(mockVerifyOtp).toHaveBeenCalledWith(expect.objectContaining({ otp: '111111' })));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
  });

  it('shows an error for invalid OTP and clears inputs', async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { success: false, error: 'Invalid OTP' },
    });

    const { container } = render(<OTPSimulation actionType="test" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    await waitFor(() => expect(mockSendOtp).toHaveBeenCalledTimes(1));

    const inputs = container.querySelectorAll('input[type="password"]');
    for (let i = 0; i < 6; i++) {
      await userEvent.type(inputs[i], String(i + 1));
    }

    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await waitFor(() => expect(screen.getByText(/Invalid OTP/i)).toBeInTheDocument());

    expect(inputs[0]).toHaveValue('');
  });

  it('triggers duress lockdown for the duress PIN', async () => {
    const { container } = render(<OTPSimulation actionType="test" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    await waitFor(() => expect(mockSendOtp).toHaveBeenCalledTimes(1));

    const inputs = container.querySelectorAll('input[type="password"]');
    for (const input of inputs) {
      await userEvent.type(input, '0');
    }

    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await waitFor(() => expect(mockTriggerDuressLockdown).toHaveBeenCalled());
  });
});
