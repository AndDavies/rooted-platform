import { Check } from "lucide-react"

export function AuthAside() {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-green via-herbal-olive to-emerald-green text-white p-10">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-charcoal-ash">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold">The ROOTED Way</span>
              <p className="text-sm text-misty-sage/80 font-normal">The future of hybrid AI-Human wellness coaching</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-light text-misty-sage">
                Transform your wellness journey with AI-powered insights
              </h2>
              <ul className="space-y-2 text-left text-misty-sage/90 text-sm md:text-base">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-herbal-olive" />
                  Personalized recovery recommendations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-herbal-olive" />
                  Real-time biometric analysis
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-herbal-olive" />
                  Community-driven wellness support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 