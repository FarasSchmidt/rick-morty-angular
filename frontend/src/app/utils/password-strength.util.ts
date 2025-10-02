export function getPasswordStrength(password: string): { label: string; color: string } {
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecials = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [hasLetters, hasNumbers, hasSpecials].filter(Boolean).length;

  if (password.length < 6) return { label: 'Débil', color: '#a11c55' };
  if (score === 1) return { label: 'Débil', color: 'orange' };
  if (score === 2) return { label: 'Moderada', color: '#FF8C00' };
  return { label: 'Fuerte', color: 'green' };
}
