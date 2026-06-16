import ReactMarkdown from "react-markdown";

export function CopilotMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed prose-p:my-3 prose-p:text-foreground/90 prose-p:leading-relaxed prose-headings:mb-3 prose-headings:mt-5 prose-headings:text-foreground prose-headings:font-medium prose-headings:tracking-tight prose-strong:text-parsel-gold prose-strong:font-semibold prose-a:text-primary prose-a:underline prose-a:decoration-primary/30 prose-a:underline-offset-2 hover:prose-a:text-primary/80 prose-ul:my-4 prose-ul:space-y-2 prose-ul:pl-5 prose-li:text-foreground/90 prose-li:leading-relaxed prose-li:marker:text-parsel-gold prose-ol:my-4 prose-ol:space-y-2 prose-ol:pl-5 prose-ol:marker:text-parsel-gold/80 prose-blockquote:border-primary/25 prose-blockquote:text-muted-foreground prose-blockquote:leading-relaxed prose-table:border prose-table:border-border/60 prose-th:border prose-th:border-border/60 prose-th:bg-parsel-elevated prose-th:px-3 prose-th:py-2 prose-th:font-medium prose-th:text-parsel-gold prose-td:border prose-td:border-border/60 prose-td:px-3 prose-td:py-2 prose-td:text-foreground/85 prose-hr:border-border/60">
      <ReactMarkdown
        components={{
          pre: ({ children }) => (
            <div className="my-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
              {children}
            </div>
          ),
          code: ({ children }) => (
            <span className="text-foreground/90">{children}</span>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-border/60">
              <table className="min-w-full text-left text-[14px]">{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
