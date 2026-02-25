import Card from '../ui/Card'
import type { Protocol } from '../../db/types'

interface ProtocolCardProps {
  protocols: Protocol[]
  onNavigateToProtocols: () => void
}

export default function ProtocolCard({ protocols, onNavigateToProtocols }: ProtocolCardProps) {
  const activeProtocols = protocols.filter(p => p.isActive)
  const totalSupplements = activeProtocols.reduce((acc, p) => acc + p.supplements.length, 0)

  return (
    <Card onClick={onNavigateToProtocols}>
      <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">Protocols</p>
      {activeProtocols.length === 0 ? (
        <p className="text-xs text-text-muted">No active protocols</p>
      ) : (
        <div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-bold text-text-primary">{activeProtocols.length}</span>
            <span className="text-[10px] text-text-muted">active</span>
          </div>
          <div className="flex flex-col gap-1">
            {activeProtocols.slice(0, 2).map(p => (
              <div key={p.id} className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-cat-supplement shrink-0" />
                  <span className="text-[11px] text-text-secondary truncate">{p.name}</span>
                </div>
                <span className="text-[9px] text-text-muted shrink-0">{p.supplements.length} supp</span>
              </div>
            ))}
            {activeProtocols.length > 2 && (
              <span className="text-[10px] text-text-muted">+{activeProtocols.length - 2} more</span>
            )}
          </div>
          {totalSupplements > 0 && (
            <p className="text-[9px] text-text-muted/60 mt-1.5">{totalSupplements} total supplements</p>
          )}
        </div>
      )}
    </Card>
  )
}
