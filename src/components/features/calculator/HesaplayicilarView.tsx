"use client";

import { FinansForm } from "@/components/features/calculator/FinansForm";
import { ImarForm } from "@/components/features/calculator/ImarForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HesaplayicilarView() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-12">
      <header className="space-y-2">
        <h1 className="font-outfit text-3xl font-semibold tracking-tight text-foreground">
          Emlak & İmar Hesaplama
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          İmar potansiyelini ve satış finansmanını anlık olarak modelleyin.
        </p>
      </header>

      <Tabs defaultValue="imar" className="gap-10">
        <TabsList variant="line" className="h-auto w-full justify-start gap-6 border-b border-border/60 pb-0">
          <TabsTrigger value="imar" className="px-0 pb-3 text-sm">
            İmar Sihirbazı
          </TabsTrigger>
          <TabsTrigger value="finans" className="px-0 pb-3 text-sm">
            Finans Motoru
          </TabsTrigger>
        </TabsList>

        <TabsContent value="imar" className="pt-4">
          <ImarForm />
        </TabsContent>

        <TabsContent value="finans" className="pt-4">
          <FinansForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
