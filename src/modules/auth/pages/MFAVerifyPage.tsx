import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { Button } from 'antd'
import { mfaSchema, type MFAForm } from '../schemas'
import { useMFAVerify } from '../hooks'

export function MFAVerifyPage() {
  const { mutate: verify, isPending } = useMFAVerify()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MFAForm>({ resolver: zodResolver(mfaSchema) })

  const [digits, setDigits] = useState(['', '', '', '', '', ''])

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    setValue('code', next.join(''))
    if (char && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setDigits(next)
    setValue('code', pasted)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <form onSubmit={handleSubmit((d) => verify(d))} noValidate className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 size-12 rounded-full bg-brand-100 flex items-center justify-center">
          <ShieldCheck className="size-6 text-brand-600" />
        </div>
        <h1 className="text-xl font-semibold text-neutral-800">Two-factor authentication</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="size-12 rounded-md border border-neutral-200 text-center text-xl font-mono font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {errors.code && (
        <p role="alert" className="text-center text-sm text-brand-600">
          {errors.code.message}
        </p>
      )}

      <Button type="primary" htmlType="submit" block size="large" loading={isPending}>
        Verify
      </Button>

      <p className="text-center text-sm text-neutral-400">
        Lost your device?{' '}
        <a href="#" className="text-brand-600 hover:underline">
          Use a backup code
        </a>
      </p>
    </form>
  )
}

