import type { ComponentType } from "react";

import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  tone?: "orange" | "slate" | "emerald" | "red";
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  orange: "bg-primary/10 text-primary",
  slate: "bg-muted text-foreground",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
};

function StatCard({ label, value, icon: Icon, tone = "orange" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
