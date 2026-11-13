import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Search,
  Ticket,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function FoundationShowcase() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [demoInput, setDemoInput] = React.useState("Tech Meetup 2027");

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="default" size="md">
            Design Tokens Showcase
          </Badge>
          <span className="text-xs font-medium text-charcoal-500">
            Evently Primitives & Tokens
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-charcoal-900 max-w-3xl leading-tight">
          Curated experiences, <br className="hidden sm:inline" />
          minimalist event discovery.
        </h1>
        <p className="text-base sm:text-lg text-charcoal-600 max-w-2xl leading-relaxed">
          The Evently foundational design system. Built with React 18, TypeScript,
          Vite, and Tailwind CSS, featuring warm surfaces, clean typography, and restrained coral accents.
        </p>
      </div>

      {/* Color Palette Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
          01. Evently Color Palette & Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-surface-border bg-white space-y-2 shadow-subtle">
            <div className="h-10 rounded-lg bg-coral-500 shadow-sm" />
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Coral Primary</p>
              <p className="text-[10px] text-charcoal-500">#FF5733 / 500</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-surface-border bg-white space-y-2 shadow-subtle">
            <div className="h-10 rounded-lg bg-coral-50 border border-coral-200" />
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Coral Tint</p>
              <p className="text-[10px] text-charcoal-500">#FFF5F2 / 50</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-surface-border bg-white space-y-2 shadow-subtle">
            <div className="h-10 rounded-lg bg-charcoal-900" />
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Charcoal Dark</p>
              <p className="text-[10px] text-charcoal-500">#121519 / 900</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-surface-border bg-white space-y-2 shadow-subtle">
            <div className="h-10 rounded-lg bg-charcoal-500" />
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Muted Slate</p>
              <p className="text-[10px] text-charcoal-500">#868E96 / 500</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-surface-border bg-white space-y-2 shadow-subtle">
            <div className="h-10 rounded-lg bg-surface border border-surface-border" />
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Warm Canvas</p>
              <p className="text-[10px] text-charcoal-500">#FAFAFA / Default</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-surface-border bg-white space-y-2 shadow-subtle">
            <div className="h-10 rounded-lg bg-white border border-surface-border" />
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Surface Card</p>
              <p className="text-[10px] text-charcoal-500">#FFFFFF / Card</p>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons & Badges */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
          02. Action Primitives & Status Badges
        </h2>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500">Button Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => toast.success("Primary CTA Clicked!")}
                >
                  Primary Action
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toast("Secondary Action Triggered")}
                >
                  Secondary
                </Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button isLoading variant="primary">
                  Saving
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-surface-border/60">
              <p className="text-xs font-medium text-charcoal-500">Badge & Category Tags</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">Tech</Badge>
                <Badge variant="neutral">Workshop</Badge>
                <Badge variant="success">Available (42 Seats)</Badge>
                <Badge variant="warning">Low Seats (3 Left)</Badge>
                <Badge variant="outline">Visakhapatnam</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Inputs & Form Controls */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
          03. Form Controls & Field Validation
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Search Events"
                placeholder="e.g. Developer Meetup..."
                leftIcon={<Search className="h-4 w-4" />}
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                helperText="Case-insensitive title search"
              />
              <Input
                label="City Filter"
                placeholder="e.g. Hyderabad"
                leftIcon={<MapPin className="h-4 w-4" />}
                defaultValue="Visakhapatnam"
              />
              <Input
                label="Validated Number"
                type="number"
                placeholder="Seats (1-5)"
                defaultValue="2"
                error="Demonstration validation: Seats must be 1 to 5"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            04. Card Architecture
          </h2>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Open Test Modal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-float hover:-translate-y-0.5 transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="default">Tech</Badge>
                <span className="text-xs font-bold text-coral-600 bg-coral-50 px-2 py-0.5 rounded-full">
                  Free
                </span>
              </div>
              <CardTitle>Global AI & Cloud Summit 2027</CardTitle>
              <CardDescription>
                Deep dive into intelligent agents and scalable distributed systems.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-charcoal-600">
                <Calendar className="h-3.5 w-3.5 text-coral-500" />
                <span>Sat, Jan 20, 2027 • 6:30 PM</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal-600">
                <MapPin className="h-3.5 w-3.5 text-coral-500" />
                <span>Convention Hall, Visakhapatnam</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-charcoal-600">
                <Users className="h-3.5 w-3.5 text-coral-500" />
                <span>Host: Deepak (Verified Organizer)</span>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-xs font-medium text-emerald-600">
                100 seats available
              </span>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                onClick={() => setIsModalOpen(true)}
              >
                Book Seat
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="py-2 flex justify-center">
                <LoadingSpinner size="md" label="Loading live inventory..." />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>

          <Card className="flex flex-col justify-center">
            <CardContent className="p-6">
              <EmptyState
                icon={<Ticket className="h-6 w-6 text-coral-500" />}
                title="No active bookings"
                description="When you reserve seats for upcoming events, your tickets will appear here."
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Accessible Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Evently Dialog Component"
        description="Testing backdrop blur, keyboard ESC dismissal, and focus containment."
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-coral-50 border border-coral-200/60 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-coral-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-charcoal-700 leading-relaxed">
              <strong className="font-semibold text-charcoal-900 block mb-0.5">
                Design System Foundation Verified
              </strong>
              All design system primitives remain available.
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Dismiss
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                toast.success("Confirmed!");
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
