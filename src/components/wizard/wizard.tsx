import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface WizardStep {
  title: string
  description?: string
  content: React.ReactNode
  validate?: () => Promise<boolean> | boolean
}

interface WizardProps {
  steps: WizardStep[]
  onComplete: () => void
  onCancel: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export function Wizard({
  steps,
  onComplete,
  onCancel,
  submitLabel = 'Confirmar',
  isSubmitting = false,
}: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = async () => {
    const step = steps[currentStep]
    if (step.validate) {
      const isValid = await step.validate()
      if (!isValid) return
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Stepper indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'mt-1 hidden text-xs sm:block',
                  index === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-px w-8 sm:w-16',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-1 text-lg font-semibold">{steps[currentStep].title}</h3>
          {steps[currentStep].description && (
            <p className="mb-4 text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          )}
          {steps[currentStep].content}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={currentStep === 0 ? onCancel : handleBack}>
          {currentStep === 0 ? 'Cancelar' : 'Voltar'}
        </Button>
        <Button onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isLastStep ? submitLabel : 'Próximo'}
        </Button>
      </div>
    </div>
  )
}
