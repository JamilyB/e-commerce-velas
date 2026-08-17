export const formatCep = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  let formatted = digits;
  if (digits.length > 5) {
    formatted = `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  }
  return formatted.slice(0, 9);
};

export const formatCpf = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  let formatted = digits;
  if (digits.length > 9) {
    formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  } else if (digits.length > 6) {
    formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}`;
  } else if (digits.length > 3) {
    formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}`;
  }
  return formatted.slice(0, 14);
};

export const formatPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  let formatted = digits;
  if (digits.length > 10) {
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  } else if (digits.length > 6) {
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  } else if (digits.length > 2) {
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return formatted.slice(0, 15);
};

export const formatCardNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  const chunks = digits.match(/.{1,4}/g);
  return chunks ? chunks.join(' ').slice(0, 19) : '';
};

export const formatCardExpiry = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  let formatted = digits;
  if (digits.length > 2) {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return formatted.slice(0, 5);
};

export const formatCardCvv = (raw: string): string => {
  return raw.replace(/\D/g, '').slice(0, 4);
};
