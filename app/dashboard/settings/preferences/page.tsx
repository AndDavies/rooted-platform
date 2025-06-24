import type { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiSettings3Line } from "@remixicon/react";

export const metadata: Metadata = {
  title: "Preferences - Rooted Platform",
  description: "Configure wellness goals and personal preferences",
};

export default function PreferencesPage() {
  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger className="-ms-4" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  <RiSettings3Line size={22} aria-hidden="true" />
                  <span className="sr-only">Dashboard</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Preferences</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8">
        <div>
          <h1 className="text-2xl font-semibold">Wellness Preferences</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Customize your wellness goals, nutrition preferences, and recovery targets.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Recovery Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recovery Goals</CardTitle>
              <CardDescription>
                Set your target HRV and sleep preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hrv-target">Target HRV (ms)</Label>
                <Input 
                  id="hrv-target" 
                  type="number" 
                  placeholder="40" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleep-target">Sleep Target (hours)</Label>
                <Input 
                  id="sleep-target" 
                  type="number" 
                  step="0.5"
                  placeholder="8" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stress-tolerance">Stress Tolerance</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Mindfulness Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mindfulness Goals</CardTitle>
              <CardDescription>
                Configure your meditation and breathing practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meditation-target">Daily Meditation (minutes)</Label>
                <Input 
                  id="meditation-target" 
                  type="number" 
                  placeholder="20" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breathing-sessions">Breathing Sessions/Day</Label>
                <Input 
                  id="breathing-sessions" 
                  type="number" 
                  placeholder="3" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mindfulness-level">Experience Level</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nutrition Style</CardTitle>
              <CardDescription>
                Set your dietary preferences and goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diet-style">Dietary Style</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="plant-based">Plant-Based</SelectItem>
                    <SelectItem value="keto">Ketogenic</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="water-target">Daily Water (oz)</Label>
                <Input 
                  id="water-target" 
                  type="number" 
                  placeholder="64" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meal-timing">Meal Timing Focus</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular Meals</SelectItem>
                    <SelectItem value="intermittent">Intermittent Fasting</SelectItem>
                    <SelectItem value="intuitive">Intuitive Eating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button disabled>
            Save Preferences
          </Button>
          <Button variant="outline" disabled>
            Reset to Defaults
          </Button>
        </div>

        {/* Coming Soon Notice */}
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
          <p className="text-muted-foreground">
            Preference customization coming soon! These settings will personalize your AI coach recommendations.
          </p>
        </div>
      </div>
    </>
  );
} 