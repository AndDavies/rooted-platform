import { Leaf, Check } from "lucide-react"

export function AuthAside() {
  return (
    <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 text-white p-10">
      {/* Background texture & overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Optional subtle texture image; fallback to solid colour if image unavailable */}
        <img
          src="/leaf-texture.jpg"
          alt=""
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-neutral-900">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold tracking-tight">The ROOTED Way</h2>
            <p className="text-sm text-gray-300/80 font-normal">The future of hybrid AI-Human wellness coaching</p>
          </div>
        </div>

        <p className="text-lg font-light text-gray-300">
          A community space to cultivate wellness, leadership & connection.
        </p>

        <ul className="space-y-2 text-left text-gray-300/90 text-sm md:text-base">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 shrink-0 text-green-400" />
            Track your biometrics & progress
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 shrink-0 text-green-400" />
            Join live events & retreats
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 shrink-0 text-green-400" />
            Receive personalised insights
          </li>
        </ul>
      </div>
    </div>
  )
} 