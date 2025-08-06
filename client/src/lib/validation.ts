import { z } from "zod";

export const phoneValidation = z.string()
  .min(9, "Telefone deve ter pelo menos 9 dígitos")
  .regex(/^[0-9+\s()-]+$/, "Formato de telefone inválido");

export const clientValidationSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: phoneValidation,
});

export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 9) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return value;
};

export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(priceInCents / 100);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateLong = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateWhatsAppMessage = (clientName: string, serviceName: string, servicePrice: number, date: string, time: string): string => {
  const formattedPrice = formatPrice(servicePrice);
  const formattedDate = formatDate(date);
  
  return `Olá! Gostaria de confirmar o meu agendamento:

📅 *Cliente:* ${clientName}
💅 *Serviço:* ${serviceName}
💰 *Valor:* ${formattedPrice}
📆 *Data:* ${formattedDate}
🕐 *Hora:* ${time}

Aguardo confirmação. Obrigada!`;
};
