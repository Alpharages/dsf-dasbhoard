import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { authApi } from '@/api/authApi';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { toast } from 'react-hot-toast';

// Mock dependencies
vi.mock('@/api/authApi', () => ({
    authApi: {
        changePassword: vi.fn(),
    },
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock PasswordStrength to avoid loading issues and simplify testing
vi.mock('@/components/ui/password-strength', () => ({
    PasswordStrength: ({ onScoreChange, password }: any) => {
        // Simulate score calculation based on password length for testing
        const score = password.length >= 8 ? 4 : 0;
        onScoreChange(score);
        return <div data-testid="password-strength">Strength Score: {score}</div>;
    }
}));

describe('ChangePasswordForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<ChangePasswordForm />);

        expect(screen.getByLabelText('Current Password')).toBeDefined();
        expect(screen.getByLabelText('New Password')).toBeDefined();
        expect(screen.getByLabelText('Confirm New Password')).toBeDefined();
        expect(screen.getByRole('button', { name: /change password/i })).toBeDefined();
    });

    it('shows validation error for empty submission', async () => {
        render(<ChangePasswordForm />);

        fireEvent.click(screen.getByRole('button', { name: /change password/i }));

        await waitFor(() => {
            expect(screen.getByText(/current password is required/i)).toBeDefined();
        });
    });

    it('validates password mismatch', async () => {
        render(<ChangePasswordForm />);

        fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldpass' } });
        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newpass123' } });
        // Confirm password doesn't match
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'mismatch' } });

        fireEvent.click(screen.getByRole('button', { name: /change password/i }));

        await waitFor(() => {
            expect(screen.getByText(/passwords don't match/i)).toBeDefined();
        });
    });

    it('calls api on successful submission', async () => {
        render(<ChangePasswordForm />);

        // Fill valid data
        fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldpass' } });
        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewStrongPass1!' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'NewStrongPass1!' } });

        fireEvent.click(screen.getByRole('button', { name: /change password/i }));

        await waitFor(() => {
            expect(authApi.changePassword).toHaveBeenCalledWith({
                currentPassword: 'oldpass',
                newPassword: 'NewStrongPass1!',
                confirmPassword: 'NewStrongPass1!',
            });
            expect(toast.success).toHaveBeenCalledWith('Password changed successfully');
        });
    });

    it('handles api error', async () => {
        const errorMessage = 'Invalid current password';
        (authApi.changePassword as any).mockRejectedValue({
            response: { data: { message: errorMessage } }
        });

        render(<ChangePasswordForm />);

        fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'wrongpass' } });
        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewStrongPass1!' } });
        fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'NewStrongPass1!' } });

        fireEvent.click(screen.getByRole('button', { name: /change password/i }));

        await waitFor(() => {
            expect(authApi.changePassword).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith(errorMessage);
        });
    });
});
