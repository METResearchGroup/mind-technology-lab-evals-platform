'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getMethodInfo } from '@/lib/evaluation-methods';

interface MethodBadgeWithTooltipProps {
  method: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function MethodBadgeWithTooltip({
  method,
  variant = 'outline',
  className = '',
}: MethodBadgeWithTooltipProps) {
  const methodInfo = getMethodInfo(method);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={`cursor-help ${className}`}>
            {methodInfo.displayName}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-md p-4" side="top">
          <div className="space-y-3">
            {/* Header */}
            <div>
              <p className="font-semibold text-sm">{methodInfo.displayName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {methodInfo.description}
              </p>
            </div>

            {/* Configuration (if any) */}
            {methodInfo.defaultConfig && Object.keys(methodInfo.defaultConfig).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Default Settings:</p>
                <div className="text-xs text-muted-foreground font-mono ml-2 space-y-0.5">
                  {Object.entries(methodInfo.defaultConfig).map(([key, val]) => (
                    <div key={key}>
                      • {key}: {String(val)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examples - Pass */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-600">✓ Passes:</p>
              <div className="ml-2 space-y-0.5">
                {methodInfo.examples.pass.map((ex, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-mono text-muted-foreground">{ex.input}</span>
                    <br />
                    <span className="text-muted-foreground text-[10px]">→ {ex.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples - Fail */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-600">✗ Fails:</p>
              <div className="ml-2 space-y-0.5">
                {methodInfo.examples.fail.map((ex, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-mono text-muted-foreground">{ex.input}</span>
                    <br />
                    <span className="text-muted-foreground text-[10px]">→ {ex.reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* When to Use */}
            <div className="pt-2 border-t space-y-1">
              <p className="text-xs">
                <span className="font-medium">Use when:</span> {methodInfo.useWhen}
              </p>
              {methodInfo.dontUseWhen && (
                <p className="text-xs text-orange-600">
                  <span className="font-medium">Don&apos;t use when:</span> {methodInfo.dontUseWhen}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
              <span>💰 {methodInfo.cost}</span>
              <span>⚡ {methodInfo.latency}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
