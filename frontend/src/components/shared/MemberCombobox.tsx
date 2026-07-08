import { useState } from "react";
import { Check, ChevronsUpDown, Users } from "lucide-react";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "../../lib/utils";
import type { User } from "../../types";

interface MemberComboboxProps {
  members: User[];
  value: string;
  onChange: (id: string) => void;
}

function MemberCombobox({ members, value, onChange }: MemberComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = members.find((m) => String(m.id) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Users className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {selected ? `${selected.full_name} (${selected.email})` : "Select a member to check out for"}
            </span>
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search members…" />
          <CommandList>
            <CommandEmpty>No member found.</CommandEmpty>
            <CommandGroup>
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  value={`${member.full_name} ${member.email}`}
                  onSelect={() => {
                    onChange(String(member.id));
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", String(member.id) === value ? "opacity-100" : "opacity-0")} />
                  <span className="flex flex-col">
                    <span>{member.full_name}</span>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default MemberCombobox;
