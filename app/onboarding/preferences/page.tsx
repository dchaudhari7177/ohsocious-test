"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  lookingFor: z.enum(["men", "women", "everyone"], {
    required_error: "Please select who you're interested in.",
  }),
  ageRange: z.array(z.number()).refine((value) => value.length === 2, {
    message: "Age range is required.",
  }),
  distance: z.number({
    required_error: "Please select a maximum distance.",
  }),
})

export default function PreferencesPage() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lookingFor: "everyone",
      ageRange: [18, 30],
      distance: 25,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    router.push("/onboarding/complete")
  }

  return (
    <div className="space-y-6">
      <Progress value={90} className="h-2 bg-gray-100" />

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Matching Preferences</h2>
        <p className="text-sm text-gray-500">Tell us who you'd like to meet</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="lookingFor"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>I'm interested in</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="men" />
                      </FormControl>
                      <FormLabel className="font-normal">Men</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="women" />
                      </FormControl>
                      <FormLabel className="font-normal">Women</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="everyone" />
                      </FormControl>
                      <FormLabel className="font-normal">Everyone</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ageRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Age Range: {field.value[0]} - {field.value[1]}
                </FormLabel>
                <FormControl>
                  <Slider
                    min={18}
                    max={50}
                    step={1}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="py-4"
                  />
                </FormControl>
                <FormDescription>Select the age range you're interested in</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Distance: {field.value} miles</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={100}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="py-4"
                  />
                </FormControl>
                <FormDescription>How far are you willing to travel for a match?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-2">
            <Button variant="outline" asChild>
              <Link href="/onboarding/interests">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
              <span className="flex items-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
