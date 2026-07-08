import { Link } from "react-router";
import { QrCode } from "lucide-react";

import { Button } from "../components/ui/button";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-orange-500">
        <QrCode className="size-7" />
      </div>
      <div>
        <h1 className="text-4xl font-semibold text-foreground">404</h1>
        <p className="mt-1 text-sm text-muted-foreground">This page couldn't be scanned into existence.</p>
      </div>
      <Button asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}

export default NotFound;
