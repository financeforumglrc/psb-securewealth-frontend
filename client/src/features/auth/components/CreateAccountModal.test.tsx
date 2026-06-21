import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CreateAccountModal from '@/features/auth/components/CreateAccountModal';
import { backendApi } from '@/shared/lib/backendApi';
import { useWealthStore } from '@/shared/store/wealthStore';

vi.mock('@/shared/lib/backendApi', () => ({
  backendApi: {
    register: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

vi.mock('@/shared/store/wealthStore', () => ({
  useWealthStore: Object.assign(
    () => ({}),
    { setState: vi.fn() }
  ),
}));

describe('CreateAccountModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/Amit Kumar/i), { target: { value: 'Amit Kumar' } });
    fireEvent.change(screen.getByPlaceholderText(/amit@email.com/i), { target: { value: 'amit@email.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Min 8 chars/i), { target: { value: 'Password1' } });
  };

  it('sends OTP after filling the form, then creates the account on verify', async () => {
    const onCreated = vi.fn();

    vi.mocked(backendApi.sendOtp).mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true, data: { recipient: 'am***@email.com' } },
    } as any);

    vi.mocked(backendApi.verifyOtp).mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true, data: { verified: true } },
    } as any);

    vi.mocked(backendApi.register).mockResolvedValue({
      ok: true,
      status: 201,
      data: {
        success: true,
        data: {
          user: { id: 'USR-123', email: 'amit@email.com', name: 'Amit Kumar' },
        },
      },
    } as any);

    render(<CreateAccountModal open onClose={() => {}} onCreated={onCreated} />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Verify your email/i })).toBeInTheDocument();
    });

    expect(backendApi.sendOtp).toHaveBeenCalledWith({ email: 'amit@email.com', purpose: 'registration' });

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(6);
    '123456'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify & Create Account/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Account Created!/i })).toBeInTheDocument();
    });

    expect(backendApi.verifyOtp).toHaveBeenCalledWith({ email: 'amit@email.com', otp: '123456', purpose: 'registration' });
    expect(backendApi.register).toHaveBeenCalledWith({ name: 'Amit Kumar', email: 'amit@email.com', password: 'Password1' });
    expect(useWealthStore.setState).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Go to Dashboard/i }));
    expect(onCreated).toHaveBeenCalled();
  });

  it('shows validation errors for weak passwords', async () => {
    render(<CreateAccountModal open onClose={() => {}} />);

    fillForm();
    // Override password to an 8-char value missing a number
    fireEvent.change(screen.getByPlaceholderText(/Min 8 chars/i), { target: { value: 'Shortest' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText(/Password must contain uppercase, lowercase and a number/i)).toBeInTheDocument();
    expect(backendApi.sendOtp).not.toHaveBeenCalled();
  });

  it('shows an error when OTP verification fails', async () => {
    vi.mocked(backendApi.sendOtp).mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true, data: { recipient: 'am***@email.com' } },
    } as any);

    vi.mocked(backendApi.verifyOtp).mockResolvedValue({
      ok: false,
      status: 400,
      data: { success: false, error: 'Invalid OTP' },
    } as any);

    render(<CreateAccountModal open onClose={() => {}} />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Verify your email/i })).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    '111111'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify & Create Account/i }));

    expect(await screen.findByText(/Invalid OTP/i)).toBeInTheDocument();
    expect(backendApi.register).not.toHaveBeenCalled();
  });

  it('shows an error when the email is already registered', async () => {
    vi.mocked(backendApi.sendOtp).mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true, data: { recipient: 'am***@email.com' } },
    } as any);

    vi.mocked(backendApi.verifyOtp).mockResolvedValue({
      ok: true,
      status: 200,
      data: { success: true, data: { verified: true } },
    } as any);

    vi.mocked(backendApi.register).mockResolvedValue({
      ok: false,
      status: 409,
      data: { success: false, error: 'User already exists' },
    } as any);

    render(<CreateAccountModal open onClose={() => {}} />);

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Verify your email/i })).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    '123456'.split('').forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify & Create Account/i }));

    expect(await screen.findByText(/User already exists/i)).toBeInTheDocument();
  });
});
