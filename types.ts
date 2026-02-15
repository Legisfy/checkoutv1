
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto';
export type PersonType = 'individual' | 'legal';

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  personType: PersonType;
  document: string; // CPF or CNPJ
  postalCode: string;
  address: string;
  number: string;
  city: string;
  state: string;
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
  cardName?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}
