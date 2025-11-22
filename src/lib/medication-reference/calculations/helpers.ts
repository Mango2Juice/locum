import type { DosingProfile } from '../types'

/**
 * Extract the unit type from DosingProfile for type-safe unit conversions
 */
type DosingUnit = DosingProfile['unit']

/**
 * Convert an amount described in a dosing profile unit into mg.
 * Returns the equivalent mg value for the provided amount (not per kg unless unit is /kg).
 */
export function convertAmountToMg(amount: number, unit: DosingUnit, mgPerMl: number): number {
  // Handle mg-based units
  if (unit === 'mg/dose' || unit === 'mg/day') return amount

  // Handle mcg-based units (convert to mg)
  if (unit === 'mcg/dose' || unit === 'mcg/day') return amount / 1000

  // Handle mL-based units (convert using concentration)
  if ((unit === 'mL/dose' || unit === 'mL/day') && mgPerMl > 0) return amount * mgPerMl

  // Per-kg units should not reach this function (they're handled in computeDoseFromProfile)
  return 0
}

export function findWeightTier(profile: DosingProfile, weight: number) {
  return profile.weightTiers?.find((t) => weight >= t.minWeight && (t.maxWeight === undefined || weight <= t.maxWeight))
}

/**
 * Compute the raw calculatedDose (in mg) for a given dosing profile.
 * Returns { calculatedDose } on success or { error } for fatal issues (e.g., no matching tier).
 */
export function computeDoseFromProfile(
  profile: DosingProfile,
  weight: number,
  mgPerMl: number,
): { calculatedDose?: number; error?: string } {
  switch (profile.formula) {
    case 'weight': {
      let amountPerKg = 0
      if (profile.unit === 'mg/kg/dose' || profile.unit === 'mg/kg/day') {
        amountPerKg = profile.amount
      } else if (profile.unit === 'mcg/kg/dose' || profile.unit === 'mcg/kg/day') {
        amountPerKg = profile.amount / 1000
      } else if ((profile.unit === 'mL/kg/dose' || profile.unit === 'mL/kg/day') && mgPerMl > 0) {
        amountPerKg = profile.amount * mgPerMl
      }
      return { calculatedDose: amountPerKg * weight }
    }

    case 'fixed':
    case 'age': {
      const base = convertAmountToMg(profile.amount, profile.unit, mgPerMl)

      // Handle alternative dosing for weight thresholds in fixed-dose profiles
      if (profile.weightThreshold && profile.alternativeAmount && weight >= profile.weightThreshold) {
        if (profile.unit === 'mL/dose' || profile.unit === 'mL/day') {
          return { calculatedDose: profile.alternativeAmount * mgPerMl }
        }
        return { calculatedDose: profile.alternativeAmount }
      }

      return { calculatedDose: base }
    }

    case 'weight-tiered': {
      const tier = findWeightTier(profile, weight)
      if (!tier) return { error: `No matching weight tier found for weight ${weight}kg.` }

      if (profile.unit === 'mg/dose' || profile.unit === 'mg/day') return { calculatedDose: tier.amount }
      if (profile.unit === 'mcg/dose' || profile.unit === 'mcg/day') return { calculatedDose: tier.amount / 1000 }
      if ((profile.unit === 'mL/dose' || profile.unit === 'mL/day') && mgPerMl > 0)
        return { calculatedDose: tier.amount * mgPerMl }

      return { calculatedDose: 0 }
    }

    default:
      return { error: `Unsupported dosing formula: ${String(profile.formula)}.` }
  }
}
