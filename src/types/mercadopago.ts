// Tipos para MercadoPago Payment Brick

export interface PaymentInitialization {
  amount: number
  preferenceId?: string
}

export interface PaymentCustomization {
  paymentMethods: {
    ticket: "all" | string[]
    creditCard: "all" | string[]
    prepaidCard: "all" | string[]
    debitCard: "all" | string[]
    mercadoPago: "all" | string[]
  }
}

export interface PaymentFormData {
  selectedPaymentMethod: string
  formData: any
}

export interface PaymentCallbacks {
  onSubmit: (data: PaymentFormData) => Promise<void>
  onReady: () => Promise<void>
  onError: (error: any) => Promise<void>
}

// Tipos para la preferencia de MercadoPago
export interface PreferenceItem {
  id: string
  title: string
  quantity: number
  currency_id: string
  unit_price: number
}

export interface PayerInfo {
  name: string
  email: string
  phone: {
    area_code: string
    number: string
  }
  address: {
    street_name: string
    street_number: string
    zip_code: string
  }
}

export interface PreferenceRequest {
  items: PreferenceItem[]
  payer: PayerInfo
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: string
  external_reference: string
}
