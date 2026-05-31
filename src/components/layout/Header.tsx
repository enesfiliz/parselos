"use client";

import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <p className="text-sm font-medium text-muted-foreground">Komuta Merkezi</p>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "size-9",
          },
        }}
      />
    </header>
  );
}
