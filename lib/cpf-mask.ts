/** Mantém só dígitos (máx. 11 para CPF). */
export function cpfDigitsOnly(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

/** Formata 11 dígitos como 000.000.000-00 (prefixo parcial enquanto digita). */
export function formatCpfMask(digits: string): string {
  const d = cpfDigitsOnly(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Aplica máscara ao valor vindo do input (colar, digitar). */
export function maskCpfInput(raw: string): string {
  return formatCpfMask(cpfDigitsOnly(raw));
}
