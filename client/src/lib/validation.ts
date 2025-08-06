import { z } from "zod";

export const cpfValidation = z.string()
  .min(11, "CPF deve ter 11 dígitos")
  .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido")
  .transform(cpf => cpf.replace(/\D/g, ''));

export const clientValidationSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: cpfValidation,
  phone: z.string().optional(),
});

export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
};

export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(priceInCents / 100);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
