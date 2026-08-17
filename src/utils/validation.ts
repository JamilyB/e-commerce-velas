import type { ShippingForm, PaymentForm } from '../types';

export const validateShipping = (form: ShippingForm): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  if (!form.email || !form.email.includes('@')) errors.email = 'E-mail inválido';
  if (!form.name.trim()) errors.name = 'Nome completo é obrigatório';
  if (form.cpf.replace(/\D/g, '').length < 11) errors.cpf = 'CPF incompleto (mínimo 11 dígitos)';
  if (form.phone.replace(/\D/g, '').length < 10) errors.phone = 'Telefone incompleto com DDD';
  if (form.cep.replace(/\D/g, '').length < 8) errors.cep = 'CEP incompleto';
  if (!form.street.trim()) errors.street = 'Rua é obrigatória';
  if (!form.number.trim()) errors.number = 'Número é obrigatório';
  if (!form.city.trim()) errors.city = 'Cidade é obrigatória';
  if (!form.state.trim()) errors.state = 'Estado é obrigatório';
  return errors;
};

export const validatePayment = (form: PaymentForm): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  if (form.method === 'card') {
    if (!form.cardName.trim()) errors.cardName = 'Nome do titular obrigatório';
    if (form.cardNumber.replace(/\D/g, '').length < 16) errors.cardNumber = 'Número de cartão incompleto (16 dígitos)';
    if (form.cardExpiry.replace(/\D/g, '').length < 4) errors.cardExpiry = 'Validade incorreta (MM/AA)';
    if (form.cardCvv.replace(/\D/g, '').length < 3) errors.cardCvv = 'CVV inválido';
  }
  return errors;
};
