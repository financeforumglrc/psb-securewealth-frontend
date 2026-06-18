import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CreateAccountModal from './CreateAccountModal';
import { backendApi } from '../../lib/backendApi';
import { useWealthStore } from '../../store/wealthStore';

vi.mock('../../lib/backendApi', () => ({
  backendApi: {
    register: vi.fn(),
  },
}));

vi.mock('../../store/wealthStore', () => ({
  useWealthStore: Object.assign(
    () => ({}),
    { setState: vi.fn() }
  ),
}));

describe('CreateAccountModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form and creates an account', async () => {
    const onCreated = vi.fn();

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

    expect(screen.getByRole('heading', { name: /Open New Account/i })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Amit Kumar/i), { target: { value: 'Amit Kumar' } });
    fireEvent.change(screen.getByPlaceholderText(/amit@email.com/i), { target: { value: 'amit@email.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Min 8 chars/i), { target: { value: 'Password1' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Account Created!/i })).toBeInTheDocument();
    });

    expect(backendApi.register).toHaveBeenCalledWith({
      name: 'Amit Kumar',
      email: 'amit@email.com',
      password: 'Password1',
    });
    expect(useWealthStore.setState).toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalled();
  });

  it('shows validation errors for weak passwords', async () => {
    render(<CreateAccountModal open onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText(/Amit Kumar/i), { target: { value: 'Amit Kumar' } });
    fireEvent.change(screen.getByPlaceholderText(/amit@email.com/i), { target: { value: 'amit@email.com' } });
    // 8 chars, upper + lower, but no number
    fireEvent.change(screen.getByPlaceholderText(/Min 8 chars/i), { target: { value: 'Shortest' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText(/Password must contain uppercase, lowercase and a number/i)).toBeInTheDocument();
    expect(backendApi.register).not.toHaveBeenCalled();
  });

  it('shows an error when the email is already registered', async () => {
    vi.mocked(backendApi.register).mockResolvedValue({
      ok: false,
      status: 409,
      data: { success: false, error: 'User already exists' },
    } as any);

    render(<CreateAccountModal open onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText(/Amit Kumar/i), { target: { value: 'Amit Kumar' } });
    fireEvent.change(screen.getByPlaceholderText(/amit@email.com/i), { target: { value: 'amit@email.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Min 8 chars/i), { target: { value: 'Password1' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText(/User already exists/i)).toBeInTheDocument();
  });
});
