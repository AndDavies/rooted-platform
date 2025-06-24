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
import { RiSettings3Line, RiDownload2Line, RiDeleteBin6Line, RiShieldCheckLine } from "@remixicon/react";

export const metadata: Metadata = {
  title: "Account Settings - Rooted Platform",
  description: "Manage your account information, timezone, and data preferences",
};

export default function AccountPage() {
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
                <BreadcrumbPage>Account</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-6 py-6 lg:py-8">
        <div>
          <h1 className="text-2xl font-semibold">Account Settings</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Manage your personal information, timezone settings, and data preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  placeholder="John Doe" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="john@example.com" 
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america/new_york">Eastern Time (ET)</SelectItem>
                    <SelectItem value="america/chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="america/denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="america/los_angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth-year">Birth Year (for age-based insights)</Label>
                <Input 
                  id="birth-year" 
                  type="number"
                  placeholder="1990" 
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RiShieldCheckLine size={20} />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your data sharing and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention Period</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="analytics">Share Analytics for Research</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, anonymized data only</SelectItem>
                    <SelectItem value="no">No, keep my data private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" disabled>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
            <CardDescription>
              Export, backup, or delete your wellness data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                <RiDownload2Line size={16} />
                Export All Data
              </Button>
              <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                <RiDownload2Line size={16} />
                Download Biometric Data
              </Button>
              <Button variant="destructive" size="sm" disabled className="flex items-center gap-2">
                <RiDeleteBin6Line size={16} />
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Data exports include all your wellness metrics, insights, and settings. 
              Account deletion is permanent and cannot be undone.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button disabled>
            Save Changes
          </Button>
          <Button variant="outline" disabled>
            Cancel
          </Button>
        </div>

        {/* Coming Soon Notice */}
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
          <p className="text-muted-foreground">
            Account management features coming soon! You&apos;ll be able to update your profile, 
            manage data retention, and export your wellness data.
          </p>
        </div>
      </div>
    </>
  );
} 