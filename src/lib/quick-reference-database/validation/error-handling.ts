import type {
  DosingProfile,
  ErrorContext,
  ErrorRecoveryOptions,
  QuickReferenceComplaintCategory,
  QuickReferenceMedication,
  ValidationResult,
} from '../types'

/**
 * Error Handling and Recovery Functions
 */

export class ValidationErrorHandler {
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: used by getInstance() as singleton
  private static instance: ValidationErrorHandler | undefined = undefined
  private errorLog: Array<{ context: ErrorContext; error: Error; message: string }> = []

  static getInstance(): ValidationErrorHandler {
    ValidationErrorHandler.instance ??= new ValidationErrorHandler()
    return ValidationErrorHandler.instance
  }

  /**
   * Handle validation errors with recovery
   */
  handleValidationError(
    error: Error | ValidationResult,
    context: ErrorContext,
    options?: ErrorRecoveryOptions,
  ): { success: boolean; message: string; recoveredData?: unknown } {
    // Destructure with individual defaults so partial objects don't override defaults
    const {
      fallbackToDefaults = true,
      skipInvalidItems = true,
      logErrors = true,
      showUserFriendlyMessages = true,
    } = options ?? {}

    let errorMessage = ''
    let userMessage = ''

    if (error instanceof Error) {
      errorMessage = error.message
      userMessage = this.createUserFriendlyMessage(error, context)
    } else {
      errorMessage = error.errors.join('; ')
      userMessage = this.createUserFriendlyValidationMessage(error, context)
    }

    // Log error if enabled
    if (logErrors) {
      this.logError(context, error instanceof Error ? error : new Error(errorMessage), errorMessage)
    }

    // Attempt recovery using the resolved option values
    const recoveryResult = this.attemptRecovery(error, context, {
      fallbackToDefaults,
      skipInvalidItems,
      logErrors,
      showUserFriendlyMessages,
    })

    return {
      success: recoveryResult.success,
      message: showUserFriendlyMessages ? userMessage : errorMessage,
      recoveredData: recoveryResult.data,
    }
  }

  /**
   * Create user-friendly error messages
   */
  private createUserFriendlyMessage(error: Error, context: ErrorContext): string {
    const operation = context.operation.toLowerCase().replaceAll('_', ' ')

    if (error.message.includes('JSON')) {
      return 'There was a problem reading the medication data file. Please check the file format and try again.'
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Unable to load medication data. Please check your connection and try again.'
    }

    if (error.message.includes('permission') || error.message.includes('access')) {
      return `Access denied while ${operation}. Please check your permissions.`
    }

    switch (context.operation) {
      case 'LOAD_MEDICATIONS':
        return 'Failed to load medications. Some medications may not be available.'
      case 'LOAD_CATEGORIES':
        return 'Failed to load complaint categories. Default categories will be used.'
      case 'CALCULATE_DOSE':
        return `Unable to calculate dose for ${context.medicationId || 'this medication'}. Please verify the medication data.`
      case 'VALIDATE_MEDICATION':
        return `Medication data validation failed for ${context.medicationId || 'unknown medication'}. Please review the medication information.`
      default:
        return `An error occurred while ${operation}. Please try again.`
    }
  }

  /**
   * Create user-friendly validation messages
   */
  private createUserFriendlyValidationMessage(result: ValidationResult, context: ErrorContext): string {
    if (result.errors.length === 0) {
      return 'Validation completed successfully.'
    }

    const medicationName = context.medicationId || 'medication'
    const errorCount = result.errors.length

    if (errorCount === 1) {
      const error = result.errors[0]
      if (error?.includes('required')) {
        return `Missing required information for ${medicationName}. Please complete all required fields.`
      }
      if (error?.includes('positive')) {
        return `Invalid dose amount for ${medicationName}. Dose must be greater than zero.`
      }
      if (error?.includes('age')) {
        return `Age restriction issue for ${medicationName}. Please check the age limits.`
      }
    }

    return `${medicationName} has ${errorCount} validation ${errorCount === 1 ? 'error' : 'errors'}. Please review and correct the medication data.`
  }

  /**
   * Attempt to recover from errors
   */
  private attemptRecovery(
    _error: Error | ValidationResult,
    context: ErrorContext,
    options: ErrorRecoveryOptions,
  ): { success: boolean; data?: unknown } {
    if (!options.fallbackToDefaults && !options.skipInvalidItems) {
      return { success: false }
    }

    switch (context.operation) {
      case 'LOAD_MEDICATIONS':
        if (options.fallbackToDefaults) {
          return {
            success: true,
            data: this.getDefaultMedications(),
          }
        }
        break

      case 'LOAD_CATEGORIES':
        if (options.fallbackToDefaults) {
          return {
            success: true,
            data: this.getDefaultCategories(),
          }
        }
        break

      case 'VALIDATE_MEDICATION':
        if (options.skipInvalidItems) {
          return {
            success: true,
            data: null, // Skip this medication
          }
        }
        break

      default:
        return { success: false }
    }

    return { success: false }
  }

  /**
   * Log errors for debugging
   */
  private logError(context: ErrorContext, error: Error, message: string): void {
    const logEntry = {
      context: {
        ...context,
        timestamp: new Date(),
      },
      error,
      message,
    }

    this.errorLog.push(logEntry)

    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): Array<{ context: ErrorContext; error: Error; message: string }> {
    return [...this.errorLog]
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Get default medications for fallback
   */
  private getDefaultMedications(): QuickReferenceMedication[] {
    const defaultDosingProfile: DosingProfile = {
      formula: 'weight',
      amount: 15,
      unit: 'mg/kg/dose',
      frequency: 'QID',
      maxDose: 1000,
      minAge: 1,
    }

    return [
      {
        id: 'paracetamol-default',
        name: 'Paracetamol',
        aliases: [],
        dosingProfiles: [defaultDosingProfile],
        concentration: {
          amount: 120,
          unit: 'mg/5ml',
          formulation: 'syrup',
        },
        complaintCategories: ['pain-fever'],
        enabled: true,
        notes: ['Default fallback medication'],
      },
    ]
  }

  /**
   * Get default categories for fallback
   */
  private getDefaultCategories(): QuickReferenceComplaintCategory[] {
    return [
      {
        id: 'all',
        name: 'all',
        displayName: 'All Medications',
        color: 'gray',
        enabled: true,
        sortOrder: 0,
      },
      {
        id: 'pain-fever',
        name: 'pain-fever',
        displayName: 'Pain & Fever',
        color: 'orange',
        enabled: true,
        sortOrder: 1,
      },
    ]
  }
}
