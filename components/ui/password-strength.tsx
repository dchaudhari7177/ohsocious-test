"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = [
    {
      text: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      text: "Contains a number",
      met: /\d/.test(password),
    },
    {
      text: "Contains a special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
    {
      text: "Contains uppercase & lowercase",
      met: /(?=.*[a-z])(?=.*[A-Z])/.test(password),
    },
  ]

  const strengthScore = requirements.filter(req => req.met).length
  const strengthPercentage = (strengthScore / requirements.length) * 100

  const getStrengthColor = () => {
    if (strengthPercentage <= 25) return "bg-red-500"
    if (strengthPercentage <= 50) return "bg-orange-500"
    if (strengthPercentage <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strengthPercentage <= 25) return "Weak"
    if (strengthPercentage <= 50) return "Fair"
    if (strengthPercentage <= 75) return "Good"
    return "Strong"
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Password strength:</span>
          <span className={`font-medium ${
            strengthPercentage <= 25 ? "text-red-500" :
            strengthPercentage <= 50 ? "text-orange-500" :
            strengthPercentage <= 75 ? "text-yellow-500" :
            "text-green-500"
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getStrengthColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${strengthPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 text-xs"
          >
            {req.met ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-gray-300" />
            )}
            <span className={req.met ? "text-gray-700" : "text-gray-400"}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 