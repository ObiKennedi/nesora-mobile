// lib/paystack.ts — Resilient Paystack Client for Mobile Wallet Top-ups and Subscriptions
import { api } from '@/lib/api'

// Shared Paystack Secret Key for fallback REST API initialization
const PAYSTACK_SECRET = 'sk_test_e19f791b36b9822ac2cdf77cfaf9a959537e6d71'

export type PaystackInitResult = {
  success: boolean
  authorizationUrl?: string
  reference?: string
  accessCode?: string
  error?: string
}

export type PaystackVerifyResult = {
  success: boolean
  isPaidMember?: boolean
  balance?: number
  error?: string
}

/**
 * Initialize a wallet top-up payment via Paystack
 */
export async function initializeWalletTopUp(
  amountNaira: number,
  userEmail?: string,
  userId?: string
): Promise<PaystackInitResult> {
  try {
    // 1. Try Backend API endpoint first
    const res = await api.post('/wallet/initialize', { amount: amountNaira })
    if (res.data?.authorizationUrl) {
      return {
        success: true,
        authorizationUrl: res.data.authorizationUrl,
        reference: res.data.reference,
        accessCode: res.data.accessCode,
      }
    }
  } catch (err: any) {
    const is404 = err?.response?.status === 404 || err?.message?.includes('Cannot POST')
    if (!is404) {
      return {
        success: false,
        error: err?.response?.data?.message || err?.message || 'Failed to start payment.',
      }
    }
  }

  // 2. Fallback direct Paystack API initialization if backend is deploying/updating
  try {
    const email = userEmail || 'user@nesora.org'
    const reference = `nesora_topup_${Date.now()}_${Math.floor(Math.random() * 100000)}`

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amountNaira * 100), // kobo
        reference,
        metadata: {
          userId,
          type: 'wallet_topup',
        },
      }),
    })

    const data = await response.json()
    if (!data.status) {
      return { success: false, error: data.message || 'Payment initialization failed.' }
    }

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    }
  } catch (fallbackErr: any) {
    return {
      success: false,
      error: fallbackErr?.message || 'Could not connect to payment gateway.',
    }
  }
}

/**
 * Verify a wallet top-up payment and credit the balance
 */
export async function verifyWalletTopUp(
  reference: string,
  amountNaira?: number
): Promise<PaystackVerifyResult> {
  try {
    // 1. Try backend verify route first
    const res = await api.post('/wallet/verify', { reference })
    if (res.data?.success) {
      return {
        success: true,
        balance: res.data.balance,
      }
    }
  } catch (err: any) {
    const is404 = err?.response?.status === 404 || err?.message?.includes('Cannot POST')
    if (!is404) {
      return {
        success: false,
        error: err?.response?.data?.message || err?.message || 'Verification failed.',
      }
    }
  }

  // 2. Fallback: verify with Paystack and credit via backend credit endpoint
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })
    const data = await response.json()

    if (!data.status || data.data.status !== 'success') {
      return { success: false, error: 'Payment not confirmed by Paystack.' }
    }

    const amountKobo = data.data.amount || (amountNaira ? amountNaira * 100 : 0)

    // Credit wallet using the existing backend credit endpoint
    const creditRes = await api.post('/wallet/credit', {
      amountKobo,
      reference,
    })

    return {
      success: true,
      balance: creditRes.data?.newBalance || creditRes.data?.balance,
    }
  } catch (creditErr: any) {
    return {
      success: false,
      error: creditErr?.response?.data?.message || creditErr?.message || 'Could not credit wallet balance.',
    }
  }
}

/**
 * Initialize NESORA Plus Membership Subscription (₦5,000 / month)
 */
export async function initializeMembershipSubscription(
  userEmail?: string,
  userId?: string
): Promise<PaystackInitResult> {
  try {
    // 1. Try Backend API
    const res = await api.post('/subscription/membership/initialize')
    if (res.data?.authorizationUrl) {
      return {
        success: true,
        authorizationUrl: res.data.authorizationUrl,
        reference: res.data.reference,
        accessCode: res.data.accessCode,
      }
    }
  } catch (err: any) {
    const is404 = err?.response?.status === 404 || err?.message?.includes('Cannot POST')
    if (!is404) {
      return {
        success: false,
        error: err?.response?.data?.message || err?.message || 'Failed to initialize subscription.',
      }
    }
  }

  // 2. Fallback direct Paystack API
  try {
    const email = userEmail || 'user@nesora.org'
    const reference = `nesora_plus_${Date.now()}_${Math.floor(Math.random() * 100000)}`

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: 500000, // ₦5,000 in kobo
        reference,
        metadata: {
          userId,
          type: 'membership_subscription',
          planName: 'NESORA Plus (₦5,000/mo)',
        },
      }),
    })

    const data = await response.json()
    if (!data.status) {
      return { success: false, error: data.message || 'Subscription initialization failed.' }
    }

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    }
  } catch (fallbackErr: any) {
    return {
      success: false,
      error: fallbackErr?.message || 'Could not connect to payment gateway.',
    }
  }
}

/**
 * Verify NESORA Plus Membership Subscription
 */
export async function verifyMembershipSubscription(
  reference: string
): Promise<PaystackVerifyResult> {
  try {
    // 1. Try Backend API
    const res = await api.post('/subscription/membership/verify', { reference })
    if (res.data?.isPaidMember || res.data?.success) {
      return {
        success: true,
        isPaidMember: true,
      }
    }
  } catch (err: any) {
    const is404 = err?.response?.status === 404 || err?.message?.includes('Cannot POST')
    if (!is404) {
      return {
        success: false,
        error: err?.response?.data?.message || err?.message || 'Verification failed.',
      }
    }
  }

  // 2. Fallback Paystack verification
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    })
    const data = await response.json()

    if (!data.status || data.data.status !== 'success') {
      return { success: false, error: 'Payment not confirmed by Paystack.' }
    }

    return {
      success: true,
      isPaidMember: true,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Verification failed.',
    }
  }
}
