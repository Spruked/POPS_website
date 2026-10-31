import type { SmartDocumentEvent } from '../types';

interface Props {
  events: SmartDocumentEvent[];
}

export function DerivedTimeline({ events }: Props) {
  return (
    <div className="pops-timeline">
      {events.map((event) => (
        <div key={event.eventId}>
          <strong>{event.actionType}</strong>
          <span>{event.timestampUtc}</span>
          <p>{String(event.payload.summary || '')}</p>
          <span>Linked evidence: {(event.payload.evidenceIds as string[] || []).join(', ')}</span>
        </div>
      ))}
    </div>
  );
}
