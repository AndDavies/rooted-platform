import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiArrowUpLine, RiArrowDownLine } from "@remixicon/react"

interface StatCardProps {
  title: string
  value: string | number
  trend?: number
  icon?: React.ComponentType<{ className?: string }>
}

function StatCard({ title, value, trend, icon: Icon }: StatCardProps) {
  const isPositive = trend && trend > 0
  const trendColor = isPositive ? "text-emerald-green" : "text-dark-pastel-red"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground">
            {isPositive ? (
              <RiArrowUpLine className="h-3 w-3 mr-1" />
            ) : (
              <RiArrowDownLine className="h-3 w-3 mr-1" />
            )}
            <span className={trendColor}>
              {Math.abs(trend)}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function StatsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value="$45,231.89"
        trend={20.1}
      />
      <StatCard
        title="Subscriptions"
        value="+2350"
        trend={180.1}
      />
      <StatCard
        title="Sales"
        value="+12,234"
        trend={-19}
      />
      <StatCard
        title="Active Now"
        value="+573"
        trend={201}
      />
    </div>
  )
}
