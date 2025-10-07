import { z } from 'zod';

// Ethereum address validation
export const ethereumAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format');

// Bitcoin address validation (simplified)
export const bitcoinAddressSchema = z.string()
  .regex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, 'Invalid Bitcoin address format');

// Solana address validation (simplified)
export const solanaAddressSchema = z.string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format');

// Generic blockchain address (accepts any non-empty string for flexibility)
export const blockchainAddressSchema = z.string()
  .min(1, 'Address is required')
  .max(100, 'Address is too long');

// Session token request validation
export const sessionTokenRequestSchema = z.object({
  addresses: z.array(
    z.object({
      address: blockchainAddressSchema,
      blockchains: z.array(
        z.string().min(1, 'Blockchain name is required')
      ).min(1, 'At least one blockchain is required'),
    })
  ).min(1, 'At least one address is required')
    .max(10, 'Maximum 10 addresses allowed'),
  assets: z.array(
    z.string().min(1, 'Asset code is required')
  ).optional(),
});

// Amount validation
export const amountSchema = z.string()
  .regex(/^\d+(\.\d{1,18})?$/, 'Invalid amount format')
  .refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Amount must be a positive number')
  .refine((val) => {
    const num = parseFloat(val);
    return num < 1000000;
  }, 'Amount is too large');

// Asset code validation
export const assetCodeSchema = z.string()
  .regex(/^[A-Z]{2,10}$/, 'Invalid asset code format')
  .refine((val) => val.length >= 2 && val.length <= 10, 'Asset code must be 2-10 characters');

// Network ID validation
export const networkIdSchema = z.string()
  .min(1, 'Network ID is required')
  .regex(/^[a-z0-9-]+$/, 'Invalid network ID format');
