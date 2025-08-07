import { z } from "zod";

export const phoneValidation = z.string()
  .min(10, "Telefone deve incluir código do país")
  .max(25, "Telefone muito longo")
  .refine((phone) => {
    // Portugal: +351 9XX XXX XXX
    if (phone.startsWith('+351')) {
      return /^\+351\s9\d{2}\s\d{3}\s\d{3}$/.test(phone);
    }
    // Brasil: +55 (XX) 9XXXX-XXXX
    if (phone.startsWith('+55')) {
      return /^\+55\s\(\d{2}\)\s9\d{4}-\d{4}$/.test(phone);
    }
    // EUA: +1 (XXX) XXX-XXXX
    if (phone.startsWith('+1')) {
      return /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/.test(phone);
    }
    // Outros países: formato básico
    return /^\+\d{1,4}\s[\d\s-()]{6,15}$/.test(phone);
  }, "Formato de telefone inválido para o país selecionado");

export const clientValidationSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: phoneValidation,
});

export const formatPhone = (value: string): string => {
  // Extract only digits from the input
  const numbers = value.replace(/\D/g, '');
  
  // If starts with 351, remove it (country code will be prefixed)
  const cleanNumbers = numbers.startsWith('351') ? numbers.slice(3) : numbers;
  
  // Format as 9XX XXX XXX
  if (cleanNumbers.length <= 9) {
    let formatted = cleanNumbers;
    if (cleanNumbers.length >= 3) {
      formatted = cleanNumbers.slice(0, 3);
      if (cleanNumbers.length >= 6) {
        formatted += ' ' + cleanNumbers.slice(3, 6);
        if (cleanNumbers.length >= 9) {
          formatted += ' ' + cleanNumbers.slice(6, 9);
        } else if (cleanNumbers.length > 6) {
          formatted += ' ' + cleanNumbers.slice(6);
        }
      } else if (cleanNumbers.length > 3) {
        formatted += ' ' + cleanNumbers.slice(3);
      }
    }
    return '+351 ' + formatted;
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
