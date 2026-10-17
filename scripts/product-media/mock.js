// Demo Tauri bridge for POPS website media. Fictional sample case only; no real records.
(() => {
  const PLATFORM = window.__POPS_DEMO_PLATFORM__ || 'windows';
  const MOBILE = PLATFORM === 'android' || PLATFORM === 'ios';
  const pad = (n) => String(n).padStart(2, '0');
  const day = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const iso = (offset, h = 17, m = 0) => `${day(offset)}T${pad(h)}:${pad(m)}:00Z`;
  const now = new Date().toISOString();
  const hex = (seed) => { let h = 2166136261 >>> 0, out = ''; for (let i = 0; out.length < 64; i++) { h ^= seed.charCodeAt(i % seed.length) + i; h = Math.imul(h, 16777619) >>> 0; out += h.toString(16).padStart(8, '0'); } return out.slice(0, 64); };

  const EV = [
    { id: 'ev1', caseId: 'primary', type: 'photo', title: 'Exchange at Civic Center library – waited 40 min', description: 'Arrived 4:55 PM for the scheduled 5:00 PM exchange. Other parent did not arrive; waited until 5:40 PM.', date: day(-2), filePath: '/vault/evidence_originals/ev1/IMG_2041.jpg', sha256: hex('ev1'), tags: ['camera-capture', 'location-attached', 'exchange'], fileName: 'IMG_2041.jpg', fileSize: 2483112, fileType: 'image/jpeg', trustGlyphRisk: 'low', sourceDescription: `Captured with the device camera in POPS (${PLATFORM}). Original preserved unaltered and sealed with SHA-256 at import.`, createdAt: iso(-2, 23, 2), importedAt: iso(-2, 23, 2) },
    { id: 'ev2', caseId: 'primary', type: 'document', title: 'School attendance report – fall term', description: 'Official attendance record from the school office.', date: day(-6), filePath: '/vault/evidence_originals/ev2/attendance.pdf', sha256: hex('ev2'), tags: ['school'], fileName: 'attendance.pdf', fileSize: 184220, fileType: 'application/pdf', trustGlyphRisk: 'low', createdAt: iso(-6, 16) },
    { id: 'ev3', caseId: 'primary', type: 'message', title: 'Text thread – weekend schedule change request', description: 'Exported message thread about the weekend schedule.', date: day(-8), filePath: '/vault/communication_exports/ev3/thread.txt', sha256: hex('ev3'), tags: ['communication'], fileName: 'thread.txt', fileSize: 12044, fileType: 'text/plain', trustGlyphRisk: 'low', createdAt: iso(-8, 20) },
    { id: 'ev4', caseId: 'primary', type: 'photo', title: 'Pediatric appointment – after-visit summary', description: 'After-visit summary photographed at the clinic.', date: day(-14), filePath: '/vault/evidence_originals/ev4/IMG_1988.jpg', sha256: hex('ev4'), tags: ['camera-capture', 'medical'], fileName: 'IMG_1988.jpg', fileSize: 1983001, fileType: 'image/jpeg', trustGlyphRisk: 'low', createdAt: iso(-14, 18) },
    { id: 'ev5', caseId: 'primary', type: 'document', title: 'Parenting plan – signed order (PDF)', description: 'Certified copy of the current parenting plan.', date: day(-60), filePath: '/vault/evidence_originals/ev5/parenting_plan.pdf', sha256: hex('ev5'), tags: ['court-order'], fileName: 'parenting_plan.pdf', fileSize: 402113, fileType: 'application/pdf', trustGlyphRisk: 'low', createdAt: iso(-60, 15) },
  ];
  const META = { ev1: { evidence_id: 'ev1', document_id: 'ev1', file_path: EV[0].filePath, file_hash: EV[0].sha256, exif_json: JSON.stringify({ accuracy_m: 8.2, captured_at: iso(-2, 23, 2) }), gps_lat: 39.7372, gps_lon: -104.9893, device_identity: `POPS ${PLATFORM}`, timestamp_utc: iso(-2, 23, 2) } };
  const EVENTS = [
    { id: 'e1', caseId: 'primary', type: 'visit', title: 'Denied exchange – Civic Center library', date: day(-2), description: 'Scheduled 5:00 PM exchange did not happen. Photo + location sealed.', relatedEvidenceIds: ['ev1'], createdAt: now },
    { id: 'e2', caseId: 'primary', type: 'communication', title: 'Schedule change request (text)', date: day(-8), description: 'Request to move weekend; reply sent the same day.', relatedEvidenceIds: ['ev3'], createdAt: now },
    { id: 'e3', caseId: 'primary', type: 'medical', title: 'Pediatric appointment attended', date: day(-14), description: 'Attended with child; summary photographed.', relatedEvidenceIds: ['ev4'], createdAt: now },
    { id: 'e4', caseId: 'primary', type: 'school', title: 'Parent–teacher conference', date: day(5), description: 'Room 114, 3:30 PM.', relatedEvidenceIds: ['ev2'], createdAt: now },
    { id: 'e5', caseId: 'primary', type: 'visit', title: 'Weekend parenting time', date: day(3), description: 'Pickup 5:00 PM Friday at the library.', relatedEvidenceIds: [], createdAt: now },
  ];
  const ORDERS = [
    { id: 'o1', caseId: 'primary', title: 'Parenting Plan & Time-Sharing Order', orderDate: day(-60), effectiveDate: day(-58), judgeName: 'Hon. R. Alvarez', courtName: 'District Court, Family Division', docketNumber: '2026-DR-01482', terms: 'Alternating weekends, Friday 5:00 PM exchange at the Civic Center library. 15-minute grace period.', violations: [], createdAt: now },
    { id: 'o2', caseId: 'primary', title: 'Temporary Child Support Order', orderDate: day(-45), effectiveDate: day(-40), judgeName: 'Hon. R. Alvarez', courtName: 'District Court, Family Division', docketNumber: '2026-DR-01482', terms: 'Monthly support due on the 1st through the state disbursement unit.', violations: [], createdAt: now },
  ];
  const VIOLATIONS = [
    { id: 'v1', caseId: 'primary', orderId: 'o1', date: day(-2), description: 'Scheduled exchange did not occur; no notice given. Waited 40 minutes at the exchange location.', evidenceIds: ['ev1'], severity: 'major', status: 'reported', createdAt: now },
  ];
  const visit = (id, offset, status, notes) => ({ id, glyphTraceId: `glyph:parenting_time_event:${id}`, recordType: 'parenting_time_event', caseId: 'default', title: `${status} parenting time - ${day(offset)}`, status, verificationState: status === 'Completed' ? 'Verified' : status === 'Denied' ? 'Disputed' : 'Needs Document', sourceProvenance: 'User entered', date: day(offset), linkedRecordIds: ['o1'], payload: { id, date: day(offset), startTime: '17:00', endTime: '19:00', location: 'Civic Center library', otherParty: 'Other parent', status: status.toLowerCase(), notes, attemptedContact: status === 'Denied' ? 'Texted at 5:10 PM and 5:25 PM, no reply' : '', orderReference: 'o1' }, vaultPath: '', createdAt: now, updatedAt: now, archived: false });
  const OPS = { parenting_time_event: [visit('p1', -16, 'Completed', 'On time, smooth exchange.'), visit('p2', -9, 'Completed', 'On time.'), visit('p3', -2, 'Denied', 'Exchange did not happen. Photo sealed in vault.'), visit('p4', 3, 'Scheduled', 'Friday pickup.'), visit('p5', 10, 'Scheduled', '')] };
  const REPORTS = [];
  const PROFILE = { id: 'primary', caseName: 'Primary Custody / Family Case', clientName: 'Sample Parent', opposingParty: 'Other Parent', attorneyName: 'J. Rivera, Esq.', attorneyPhone: '(555) 010-4477', attorneyEmail: 'counsel@example.com', courtName: 'District Court, Family Division', docketNumber: '2026-DR-01482', caseType: 'Custody', notes: '', updatedAt: now };
  const CASE = { id: 'primary', parentCaseId: null, caseType: 'primary_custody', title: 'Primary Custody / Family Case', caseNumber: '2026-DR-01482', courtName: 'District Court, Family Division', judgeName: 'Hon. R. Alvarez', status: 'active', lifecycleStage: 'filing', openedDate: day(-120), closedDate: '', nextDeadline: day(8), nextHearingDate: day(21), orderIds: ['o1', 'o2'], evidenceIds: EV.map((e) => e.id), eventIds: EVENTS.map((e) => e.id), documentIds: [], notes: '', createdAt: now, updatedAt: now };
  const CHAIN = [];
  const files = {};
  const seq = { n: 0 };

  const handlers = {
    platform_capabilities: () => ({ platform: PLATFORM, mobile: MOBILE, sqlite_vault: true, evidence_import: true, evidence_hashing: true, reports_export: true, guided_assistant: true, local_ai: !MOBILE, ocr: !MOBILE, voice_output: !MOBILE, dictation_service: !MOBILE, research_substrate: false }),
    get_evidence: () => EV.slice(),
    save_evidence: ({ item }) => { const i = EV.findIndex((e) => e.id === item.id); if (i >= 0) EV[i] = item; else EV.unshift(item); CHAIN.push({ action: 'EVIDENCE_SAVED', evidenceId: item.id, at: new Date().toISOString() }); return null; },
    import_evidence_file: ({ evidenceId, fileName, fileType, bytes }) => { const sha = hex(evidenceId + (bytes ? bytes.length : 0)); files[evidenceId] = sha; return { filePath: `/vault/evidence_originals/${evidenceId}/${fileName}`, sha256: sha, fileName, fileSize: bytes ? bytes.length : 0, fileType, originalModifiedAt: new Date().toISOString(), importedAt: new Date().toISOString() }; },
    submit_evidence: ({ payload }) => { const p = JSON.parse(payload); META[p.evidence_id] = { ...p, timestamp_utc: new Date().toISOString() }; return null; },
    verify_evidence_integrity: ({ expectedHash }) => ({ status: 'VERIFIED', expectedHash, actualHash: expectedHash }),
    get_evidence_metadata: ({ evidenceId }) => JSON.stringify(META[evidenceId] || null),
    get_evidence_locations: () => Object.values(META),
    get_evidence_chain: ({ evidenceId } = {}) => [
      { id: `c-${evidenceId}-1`, evidenceId, action: 'EVIDENCE_IMPORTED', actor: 'POPS', timestamp: iso(-2, 23, 2), details: 'Original preserved unaltered; SHA-256 recorded.', hash: hex(`c1${evidenceId}`) },
      { id: `c-${evidenceId}-2`, evidenceId, action: 'INTEGRITY_VERIFIED', actor: 'POPS', timestamp: iso(-2, 23, 3), details: 'Re-hash matched the recorded fingerprint.', hash: hex(`c2${evidenceId}`) },
    ],
    get_events: () => EVENTS.slice(),
    save_event: ({ item }) => { EVENTS.unshift(item); return null; },
    get_court_orders: () => ORDERS.slice(),
    get_violations: () => VIOLATIONS.slice(),
    get_reports: () => REPORTS.slice(),
    save_report: ({ item }) => { REPORTS.unshift(item); return null; },
    delete_report: () => null,
    get_profile: () => PROFILE,
    get_case_overview_data: () => ({ primaryCase: CASE, relatedCases: [], alerts: [{ id: 'a1', caseId: 'primary', alertType: 'parenting_time_conflict', severity: 'high', title: 'Denied exchange logged', details: `Exchange on ${day(-2)} did not occur. Evidence sealed and linked to the Parenting Plan order.`, dueDate: day(8), createdAt: now, resolved: false }, { id: 'a2', caseId: 'primary', alertType: 'hearing', severity: 'info', title: 'Status hearing scheduled', details: 'Bring the attorney packet and evidence index.', dueDate: day(21), createdAt: now, resolved: false }], activeOrderCount: 2, upcomingDeadlineCount: 2, crossCaseEvidenceCount: 0 }),
    get_case_overview: () => '[]',
    get_operational_records: ({ recordType } = {}) => (OPS[recordType] || []).slice(),
    save_operational_record: ({ item }) => { (OPS[item.recordType] = OPS[item.recordType] || []).unshift(item); return null; },
    get_sealed_records: () => [], get_audit_ledger: () => [], get_players_dossier: () => [], get_incidents: () => [], get_glyph_trace_records: () => [], get_child_support_payments: () => [], get_contact_research_findings: () => [],
    local_agent_status: () => ({ ready: !MOBILE, model: 'local', status: MOBILE ? 'unavailable' : 'ready' }),
    local_agent_readiness: () => ({ ready: !MOBILE }),
    export_vault_transfer: () => ({ destination: '', fileCount: 47, totalBytes: 18734211, evidenceCount: EV.length, packageHash: hex('package') }),
    inspect_vault_transfer: () => ({ createdAt: new Date(Date.now() - 3600e3).toISOString(), sourcePlatform: 'windows', appVersion: '1.0.0', evidenceCount: 5, chainEntryCount: 23, fileCount: 47, totalBytes: 18734211, packageHash: hex('package'), packageHashValid: true, currentEvidenceCount: 1 }),
    restore_vault_transfer: () => ({ packageHash: hex('package'), filesRestored: 47, evidenceCount: 5, originalsVerified: 5, originalsMismatched: [], originalsMissing: [], preRestoreSnapshot: 'vault/snapshots/pre-restore.sqlite' }),
    export_full_case_bundle: () => ({ path: 'Documents/POPS/full_case_bundle.zip' }),
    'plugin:dialog|save': ({ options } = {}) => `/storage/emulated/0/Download/${(options && options.defaultPath) || 'pops-vault.popsvault'}`,
    'plugin:dialog|open': () => '/storage/emulated/0/Download/pops-vault-transfer.popsvault',
    'plugin:geolocation|check_permissions': () => ({ location: 'granted', coarseLocation: 'granted' }),
    'plugin:geolocation|request_permissions': () => ({ location: 'granted', coarseLocation: 'granted' }),
    'plugin:geolocation|get_current_position': () => ({ timestamp: Date.now(), coords: { latitude: 39.737211, longitude: -104.989342, accuracy: 7.6, altitude: null, altitudeAccuracy: null, speed: null, heading: null } }),
  };

  window.__POPS_DEMO_UNKNOWN__ = [];
  window.__TAURI_INTERNALS__ = {
    transformCallback: () => ++seq.n,
    unregisterCallback: () => {},
    convertFileSrc: (p) => p,
    metadata: { currentWindow: { label: 'main' }, currentWebview: { windowLabel: 'main', label: 'main' } },
    invoke: async (cmd, args) => {
      if (handlers[cmd]) return handlers[cmd](args || {});
      window.__POPS_DEMO_UNKNOWN__.push(cmd);
      if (/^get_/.test(cmd)) return [];
      return null;
    },
  };
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: () => {} };
})();
