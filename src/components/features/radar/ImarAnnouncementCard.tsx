"use client";

import {
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  ExternalLink,
  Eye,
} from "lucide-react";

import {
  IMAR_CATEGORY_LABELS,
  IMAR_TRUST_LABELS,
  IMAR_TRUST_STYLES,
  formatImarRelativeTime,
  isValidSourceUrl,
  parseRegionParts,
} from "@/components/features/radar/imar-radar-ui-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ImarRadarItem } from "@/lib/radar/imar-radar-types";
import { cn } from "@/lib/utils";

type ImarAnnouncementCardProps = {
  item: ImarRadarItem;
  onOpenDetail: (item: ImarRadarItem) => void;
  onToggleTrack: (item: ImarRadarItem) => void;
  onCreateTask: (item: ImarRadarItem) => void;
};

export function ImarAnnouncementCard({
  item,
  onOpenDetail,
  onToggleTrack,
  onCreateTask,
}: ImarAnnouncementCardProps) {
  const { district, city } = parseRegionParts(item.region);
  const sourceHref = isValidSourceUrl(item.sourceUrl) ? item.sourceUrl : null;

  return (
    <Card className="parsel-surface border-border/60 shadow-parsel-sm transition-colors hover:border-primary/15">
      <CardHeader className="gap-3 border-b border-border/50 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-normal text-[10px]">
                {IMAR_CATEGORY_LABELS[item.category]}
              </Badge>
              <Badge
                className={cn(
                  "font-normal text-[10px]",
                  IMAR_TRUST_STYLES[item.trustStatus],
                )}
              >
                {IMAR_TRUST_LABELS[item.trustStatus]}
              </Badge>
              {item.isTracked ? (
                <Badge className="border-primary/20 bg-primary/10 font-normal text-[10px] text-primary">
                  Takipte
                </Badge>
              ) : null}
            </div>
            <CardTitle className="text-base font-semibold leading-snug tracking-tight">
              {item.title}
            </CardTitle>
            <CardDescription className="text-xs">
              {district}, {city} · {item.source}
            </CardDescription>
          </div>
          {item.isNew ? (
            <Badge className="shrink-0 border-primary/25 bg-primary/10 text-primary">
              Yeni
            </Badge>
          ) : null}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Son güncelleme: {formatImarRelativeTime(item.publishedAt)}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
          {item.summary}
        </p>

        {item.matchedKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {item.matchedKeywords.map((keyword) => (
              <Badge key={keyword} variant="outline" className="font-normal text-[10px]">
                {keyword}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {sourceHref ? (
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-parsel-elevated px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <ExternalLink className="size-3.5" strokeWidth={1.75} />
              Kaynağa git
            </a>
          ) : (
            <span className="inline-flex h-9 items-center rounded-lg border border-dashed border-border/60 px-3 text-xs text-muted-foreground">
              Kaynak eklenmedi
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onToggleTrack(item)}
          >
            {item.isTracked ? (
              <BookmarkCheck className="size-3.5" />
            ) : (
              <Bookmark className="size-3.5" />
            )}
            {item.isTracked ? "Takipte" : "Takibe al"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onOpenDetail(item)}
          >
            <Eye className="size-3.5" />
            Detay
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => onCreateTask(item)}
          >
            <CalendarPlus className="size-3.5" />
            Görev oluştur
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
