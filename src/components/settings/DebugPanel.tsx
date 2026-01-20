"use client";

import { useState, useEffect } from "react";
import { Bug, Trash2, Download, Eye, EyeOff } from "lucide-react";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  sessionId?: string;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export default function DebugPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');

  useEffect(() => {
    setLogs(logger.getRecentLogs(50));
  }, []);

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const downloadLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warn': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'debug': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden">
      <div className="px-8 py-6 border-b border-border/40 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Bug size={20} />
          </div>
          <h2 className="font-black text-xl tracking-tight italic">Panel de Debug</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filtrar por nivel:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as LogLevel | 'all')}
                className="px-3 py-1 bg-muted/50 border border-border rounded-lg text-sm"
              >
                <option value="all">Todos</option>
                <option value="error">Errores</option>
                <option value="warn">Advertencias</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadLogs}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
              >
                <Download size={16} />
                Descargar
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                Limpiar
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay logs disponibles
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/30 rounded-lg border border-border/40 text-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border",
                        getLevelColor(log.level)
                      )}>
                        {log.level}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-foreground font-medium mb-1">{log.message}</p>
                  {log.data && (
                    <details className="mt-2">
                      <summary className="text-muted-foreground cursor-pointer text-xs hover:text-foreground">
                        Ver datos adicionales
                      </summary>
                      <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto border border-border/40">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t border-border/40">
            Mostrando {filteredLogs.length} de {logs.length} logs • Session ID: {logs[0]?.sessionId || 'N/A'}
          </div>
        </div>
      )}
    </div>
  );
}