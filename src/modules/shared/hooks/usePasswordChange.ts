import { useState } from 'react';

interface PasswordVisibility {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface UsePasswordChangeReturn {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPasswords: PasswordVisibility;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  togglePasswordVisibility: (field: keyof PasswordVisibility) => void;
  resetPasswords: () => void;
  validatePasswords: () => { valid: boolean; error?: string };
}

export function usePasswordChange(): UsePasswordChangeReturn {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<PasswordVisibility>({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const resetPasswords = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const validatePasswords = (): { valid: boolean; error?: string } => {
    if (newPassword !== confirmPassword) {
      return { valid: false, error: 'Las contraseñas no coinciden' };
    }

    if (newPassword.length < 6) {
      return { valid: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
    }

    return { valid: true };
  };

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    showPasswords,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    resetPasswords,
    validatePasswords,
  };
}
