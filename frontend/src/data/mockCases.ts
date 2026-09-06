import type { SyntheticTestCase, WatchlistRecord } from '../types';

// Helper function to create high-quality SVG Passport artwork
function createPassportSvg(opts: {
  country?: string;
  name: string;
  docNumber: string;
  dob: string;
  expiry: string;
  gender: string;
  photoSeed: string;
  tamperPhoto?: boolean;
  tamperDob?: boolean;
  hasStamp?: boolean;
  tamperStamp?: boolean;
  isExpired?: boolean;
}): string {
  const isTamperedPhoto = opts.tamperPhoto;
  const isTamperedDob = opts.tamperDob;
  const hasStamp = opts.hasStamp;
  const isTamperedStamp = opts.tamperStamp;

  const photoBorder = isTamperedPhoto ? 'stroke="#f43f5e" stroke-width="3" stroke-dasharray="4,2"' : 'stroke="#3b82f6" stroke-width="1.5"';
  const dobColor = isTamperedDob ? '#ef4444' : '#0f172a';
  const dobFontWeight = isTamperedDob ? '900' : '600';

  const stampColor = isTamperedStamp ? '#dc2626' : '#1e3a8a';
  const stampOpacity = isTamperedStamp ? '0.75' : '0.85';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdfbf7" />
        <stop offset="50%" stop-color="#f5efe6" />
        <stop offset="100%" stop-color="#ebe3d5" />
      </linearGradient>
      <pattern id="guilloche" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 0,30 Q 15,10 30,30 T 60,30" fill="none" stroke="rgba(59, 130, 246, 0.08)" stroke-width="1.5"/>
        <path d="M 30,0 Q 10,15 30,30 T 30,60" fill="none" stroke="rgba(217, 119, 6, 0.08)" stroke-width="1.5"/>
        <circle cx="30" cy="30" r="18" fill="none" stroke="rgba(99, 102, 241, 0.06)" stroke-width="1"/>
      </pattern>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="2" dy="4" stdDeviation="6" flood-opacity="0.15"/>
      </filter>
    </defs>

    <!-- Document Base Paper -->
    <rect x="15" y="15" width="870" height="570" rx="16" fill="url(#bgGrad)" stroke="#cbd5e1" stroke-width="3" filter="url(#shadow)"/>
    <rect x="25" y="25" width="850" height="550" rx="12" fill="url(#guilloche)" />

    <!-- Passport Header -->
    <g transform="translate(50, 45)">
      <rect x="0" y="0" width="800" height="58" rx="8" fill="#1e293b" />
      <text x="30" y="36" font-family="'Outfit', 'Inter', sans-serif" font-size="22" font-weight="800" fill="#38bdf8" letter-spacing="3">PASSPORT / PASSEPORT</text>
      <text x="520" y="36" font-family="'Inter', sans-serif" font-size="16" font-weight="700" fill="#f8fafc" letter-spacing="2">REPUBLIC OF INDIA</text>
      <!-- Emblem / Lion Capital representation -->
      <circle cx="485" cy="29" r="14" fill="#d97706" opacity="0.9" />
      <circle cx="485" cy="29" r="10" fill="#1e293b" />
      <path d="M 485,21 L 485,37 M 477,29 L 493,29" stroke="#f59e0b" stroke-width="2" />
    </g>

    <!-- Document Info Bar -->
    <g transform="translate(50, 115)">
      <text x="0" y="16" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">TYPE / TYPE</text>
      <text x="0" y="34" font-family="'JetBrains Mono', monospace" font-size="15" fill="#0f172a" font-weight="700">P</text>

      <text x="80" y="16" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">COUNTRY CODE</text>
      <text x="80" y="34" font-family="'JetBrains Mono', monospace" font-size="15" fill="#0f172a" font-weight="700">IND</text>

      <text x="210" y="16" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">PASSPORT NO. / NO. DU PASSEPORT</text>
      <text x="210" y="34" font-family="'JetBrains Mono', monospace" font-size="17" fill="#0369a1" font-weight="800" letter-spacing="1">${opts.docNumber}</text>

      <line x1="0" y1="46" x2="800" y2="46" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2,2"/>
    </g>

    <!-- Document Photograph Box -->
    <g transform="translate(60, 180)">
      <rect x="0" y="0" width="180" height="230" rx="8" fill="#e2e8f0" ${photoBorder}/>
      <!-- Photo Face Graphic -->
      <g transform="translate(15, 20)">
        <rect x="0" y="0" width="150" height="190" rx="6" fill="#cbd5e1" />
        <!-- Head -->
        <circle cx="75" cy="70" r="42" fill="#94a3b8" />
        <!-- Hair -->
        <path d="M 33,65 C 33,25 117,25 117,65 Z" fill="#334155" />
        <!-- Eyes & Glasses -->
        <circle cx="60" cy="68" r="4" fill="#0f172a" />
        <circle cx="90" cy="68" r="4" fill="#0f172a" />
        <path d="M 68,82 Q 75,87 82,82" stroke="#0f172a" stroke-width="2.5" fill="none" />
        <!-- Shoulders / Suit -->
        <path d="M 10,185 C 10,125 140,125 140,185 Z" fill="#1e293b" />
        <polygon points="75,130 65,185 85,185" fill="#dc2626" />
        <!-- Tamper indicator visual overlay if photo tampered -->
        ${isTamperedPhoto ? `
          <rect x="-10" y="-10" width="170" height="210" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,4" />
          <path d="M 0,0 L 150,190" stroke="#f43f5e" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
        ` : ''}
      </g>
      <text x="90" y="244" font-family="'Inter', sans-serif" font-size="10" fill="#64748b" text-anchor="middle" font-weight="600">HOLDER'S PHOTO</text>
    </g>

    <!-- Visual Inspection Zone (VIZ) Details -->
    <g transform="translate(280, 180)">
      <!-- Name -->
      <text x="0" y="16" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">SURNAME &amp; GIVEN NAMES / NOM ET PRENOMS</text>
      <text x="0" y="38" font-family="'Outfit', sans-serif" font-size="20" fill="#0f172a" font-weight="800" letter-spacing="1">${opts.name.toUpperCase()}</text>

      <!-- Nationality -->
      <text x="0" y="75" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">NATIONALITY / NATIONALITE</text>
      <text x="0" y="95" font-family="'Inter', sans-serif" font-size="15" fill="#0f172a" font-weight="700">INDIAN</text>

      <!-- Sex -->
      <text x="240" y="75" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">SEX / SEXE</text>
      <text x="240" y="95" font-family="'Inter', sans-serif" font-size="15" fill="#0f172a" font-weight="700">${opts.gender}</text>

      <!-- Date of Birth -->
      <text x="0" y="132" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">DATE OF BIRTH / DATE DE NAISSANCE</text>
      <text x="0" y="153" font-family="'JetBrains Mono', monospace" font-size="16" fill="${dobColor}" font-weight="${dobFontWeight}">${opts.dob}</text>
      ${isTamperedDob ? `<rect x="-4" y="137" width="130" height="22" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>` : ''}

      <!-- Place of Birth -->
      <text x="240" y="132" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">PLACE OF BIRTH / LIEU DE NAISSANCE</text>
      <text x="240" y="153" font-family="'Inter', sans-serif" font-size="15" fill="#0f172a" font-weight="700">NEW DELHI, IND</text>

      <!-- Date of Issue -->
      <text x="0" y="190" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">DATE OF ISSUE / DATE DE DELIVRANCE</text>
      <text x="0" y="210" font-family="'JetBrains Mono', monospace" font-size="15" fill="#0f172a" font-weight="600">16/08/2020</text>

      <!-- Date of Expiry -->
      <text x="240" y="190" font-family="sans-serif" font-size="11" fill="#64748b" font-weight="700">DATE OF EXPIRY / DATE D'EXPIRATION</text>
      <text x="240" y="210" font-family="'JetBrains Mono', monospace" font-size="16" fill="${opts.isExpired ? '#dc2626' : '#0f172a'}" font-weight="${opts.isExpired ? '800' : '700'}">${opts.expiry}</text>
      ${opts.isExpired ? `<text x="360" y="210" font-family="sans-serif" font-size="12" fill="#ef4444" font-weight="800">[EXPIRED]</text>` : ''}
    </g>

    <!-- Visa Stamp Overlay if present -->
    ${hasStamp ? `
    <g transform="translate(620, 200) rotate(${isTamperedStamp ? '18' : '-12'})" opacity="${stampOpacity}">
      <circle cx="70" cy="70" r="64" fill="none" stroke="${stampColor}" stroke-width="${isTamperedStamp ? '3.5' : '2.5'}" stroke-dasharray="${isTamperedStamp ? '10,4' : 'none'}"/>
      <circle cx="70" cy="70" r="54" fill="none" stroke="${stampColor}" stroke-width="1.2"/>
      <text x="70" y="32" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="800" fill="${stampColor}" text-anchor="middle">IMMIGRATION CHECKPOST</text>
      <text x="70" y="47" font-family="'JetBrains Mono', sans-serif" font-size="11" font-weight="800" fill="${stampColor}" text-anchor="middle">RAXAUL SSB (IND)</text>
      <rect x="25" y="55" width="90" height="24" fill="${stampColor}" rx="3" />
      <text x="70" y="72" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle">12 FEB 2026</text>
      <text x="70" y="95" font-family="'Outfit', sans-serif" font-size="10" font-weight="800" fill="${stampColor}" text-anchor="middle">ENTRY PERMITTED</text>
      <text x="70" y="112" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="${stampColor}" text-anchor="middle">OFFICER: SSB-0842</text>
      ${isTamperedStamp ? `<rect x="5" y="5" width="130" height="130" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2"/>` : ''}
    </g>` : ''}

    <!-- Machine Readable Zone (MRZ TD3) -->
    <g transform="translate(50, 480)">
      <rect x="0" y="0" width="800" height="78" rx="6" fill="#0f172a" />
      <text x="25" y="32" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="18.5" fill="#38bdf8" font-weight="700" letter-spacing="3.8">
        P&lt;IND${opts.name.toUpperCase().replace(/\s+/g, '&lt;')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
      </text>
      <text x="25" y="62" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="18.5" fill="#38bdf8" font-weight="700" letter-spacing="3.8">
        ${opts.docNumber}4IND0008154M3008158&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Helper to generate portrait avatar data URI
function createPortraitSvg(name: string, _seedColor: string, isImposter: boolean = false): string {
  const headColor = isImposter ? '#f59e0b' : '#38bdf8';
  const suitColor = isImposter ? '#1e1b4b' : '#0f172a';
  const hairStyle = isImposter ? 'M 35,65 C 20,20 130,20 115,65 Z' : 'M 40,65 C 40,25 110,25 110,65 Z';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360" width="100%" height="100%">
    <rect width="300" height="360" fill="#0b1329"/>
    <!-- Biometric Face Capture HUD -->
    <circle cx="150" cy="140" r="100" fill="none" stroke="${headColor}" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
    <line x1="150" y1="20" x2="150" y2="260" stroke="${headColor}" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.3"/>
    <line x1="30" y1="140" x2="270" y2="140" stroke="${headColor}" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.3"/>

    <!-- Subject -->
    <path d="M 40,340 C 40,230 260,230 260,340 Z" fill="${suitColor}"/>
    <circle cx="150" cy="135" r="70" fill="#cbd5e1"/>
    <path d="${hairStyle}" fill="#1e293b" />
    
    <!-- Eyes -->
    <circle cx="125" cy="130" r="6" fill="#0f172a" />
    <circle cx="175" cy="130" r="6" fill="#0f172a" />
    <!-- Facial landmark tracking dots -->
    <circle cx="125" cy="130" r="2" fill="#00f2fe" />
    <circle cx="175" cy="130" r="2" fill="#00f2fe" />
    <circle cx="150" cy="155" r="2" fill="#00f2fe" />
    <circle cx="135" cy="175" r="2" fill="#00f2fe" />
    <circle cx="165" cy="175" r="2" fill="#00f2fe" />
    <circle cx="150" cy="190" r="2" fill="#00f2fe" />

    <!-- Mouth -->
    <path d="M 135,175 Q 150,185 165,175" stroke="#0f172a" stroke-width="3" fill="none" />

    <text x="150" y="345" font-family="'JetBrains Mono', monospace" font-size="12" fill="#94a3b8" text-anchor="middle">${name.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Pre-configured Watchlist database entries
export const MOCK_WATCHLIST_RECORDS: WatchlistRecord[] = [
  {
    id: 'W-IND-2026-091',
    fullName: 'VIKRAM SINGH',
    aliases: ['Vicky Thakur', 'V. K. Singh'],
    docNumber: 'M7120938',
    nationality: 'IND',
    dob: '1992-05-14',
    riskCategory: 'HUMAN_TRAFFICKING',
    flaggedBy: 'SSB Intelligence',
    severity: 'CRITICAL',
    alertNotes: 'Wanted in cross-border counterfeit document syndicate operating along Indo-Nepal border.',
    dateAdded: '2025-11-20'
  },
  {
    id: 'W-INT-2025-442',
    fullName: 'TARIQ AHMED',
    aliases: ['Tariq Khan'],
    docNumber: 'T9812450',
    nationality: 'PAK',
    dob: '1988-03-22',
    riskCategory: 'INTERPOL_RED_NOTICE',
    flaggedBy: 'INTERPOL',
    severity: 'CRITICAL',
    alertNotes: 'Active Interpol Red Notice for transnational organized identity fraud.',
    dateAdded: '2024-08-11'
  },
  {
    id: 'W-MHA-2026-104',
    fullName: 'DEEPAK VERMA',
    aliases: ['Deepak Kumar'],
    docNumber: 'D4512903',
    nationality: 'IND',
    dob: '1996-11-09',
    riskCategory: 'IMMIGRATION_VIOLATION',
    flaggedBy: 'MHA Bureau of Immigration',
    severity: 'HIGH',
    alertNotes: 'Subject of impersonation investigation. Multiple travel attempts using stolen credentials.',
    dateAdded: '2026-01-15'
  }
];

// Complete Demonstration Test Cases
export const SYNTHETIC_TEST_CASES: SyntheticTestCase[] = [
  {
    id: 'case-1-genuine',
    caseNumber: 1,
    title: 'Genuine Indian Passport',
    tagline: 'Standard genuine travel document with pristine security signals',
    category: 'GENUINE',
    expectedRiskLevel: 'LOW',
    expectedScoreRange: [0, 15],
    description: 'Valid Republic of India passport presented by rightful holder. Clean ELA compression, authentic ICAO MRZ checksums, matching font metrics, and high biometric face match confidence (96.4%).',
    documentImage: createPassportSvg({
      name: 'Rahul Kumar',
      docNumber: 'Z4819203',
      dob: '15/08/2000',
      expiry: '15/08/2030',
      gender: 'M',
      photoSeed: 'rahul',
      hasStamp: true
    }),
    liveFaceImage: createPortraitSvg('Rahul Kumar', '#38bdf8', false),
    fields: {
      name: 'Rahul Kumar',
      docNumber: 'Z4819203',
      nationality: 'IND',
      dob: '15/08/2000',
      expiryDate: '15/08/2030',
      gender: 'MALE',
      issueDate: '16/08/2020',
      docType: 'PASSPORT',
      mrzLine1: 'P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'Z4819203<4IND0008154M3008158<<<<<<<<<<<<<<06'
    },
    sessionData: {
      sessionId: 'SSB-2026-0826-001',
      timestamp: '2026-08-26 10:14:22 IST',
      operatorId: 'OFFICER-SSB-449',
      checkpoint: 'Raxaul Land Border Checkpoint (Indo-Nepal)',
      documentType: 'PASSPORT',
      documentImageUrl: '',
      fields: {
        name: 'Rahul Kumar',
        docNumber: 'Z4819203',
        nationality: 'IND',
        dob: '15/08/2000',
        expiryDate: '15/08/2030',
        gender: 'MALE',
        issueDate: '16/08/2020',
        docType: 'PASSPORT',
        mrzLine1: 'P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'Z4819203<4IND0008154M3008158<<<<<<<<<<<<<<06'
      },
      validation: {
        isValid: true,
        isExpired: false,
        isDobValid: true,
        isFormatValid: true,
        mrzChecksumPass: true,
        mrzDetails: {
          docNumberValid: true,
          dobValid: true,
          expiryValid: true,
          compositeValid: true,
          calculatedChecksums: { doc: 4, dob: 4, exp: 8, comp: 6 },
          expectedChecksums: { doc: 4, dob: 4, exp: 8, comp: 6 }
        },
        issues: [],
        normalizedFields: {
          dob: '2000-08-15',
          expiryDate: '2030-08-15',
          docNumber: 'Z4819203'
        }
      },
      tampering: {
        photoIntegrityScore: 97,
        textIntegrityScore: 98,
        stampIntegrityScore: 96,
        metadataIntegrityScore: 99,
        photoReplaced: false,
        textManipulated: false,
        stampForged: false,
        metadataAnomalous: false,
        metadataTags: {
          'Camera': 'Nikon D850',
          'ColorSpace': 'sRGB',
          'Software': 'Direct Optical Scanner v4.2',
          'Compression': 'Standard Baseline JPEG'
        },
        regions: [
          {
            id: 'reg-photo-1',
            name: 'Holder Photo Region',
            type: 'PHOTO',
            x: 6.8,
            y: 30,
            width: 20,
            height: 38,
            riskScore: 3,
            status: 'VALID',
            title: 'Photo Substrate Clean',
            explanation: 'Uniform ELA compression error distribution across boundary substrate. Edge gradient is continuous with no splicing artifacts.',
            metrics: { elaVariance: 4.2, edgeDiscontinuity: 0.12, noiseIndex: 1.05 }
          }
        ],
        summaryNotes: ['All cryptographic and physical forensics signals indicate genuine document substrate.']
      },
      faceVerification: {
        match: true,
        similarity: 96.4,
        confidence: 0.98,
        threshold: 75.0,
        status: 'MATCH',
        liveDetected: true,
        landmarksDetected: true,
        notes: 'Document photograph matches live checkpoint presenter with 96.4% biometric embedding similarity.'
      },
      crossField: {
        match: true,
        mismatches: []
      },
      watchlistHit: null,
      riskFactors: [],
      totalRiskScore: 6,
      riskLevel: 'LOW',
      decision: 'CLEAR_ENTRY',
      operatorNotes: 'Passenger verified. Document pristine. Granted standard border clearance.'
    }
  },
  {
    id: 'case-2-photo-tamper',
    caseNumber: 2,
    title: 'Altered Photograph / Spliced Photo',
    tagline: 'Physical photo replacement detected via Error Level Analysis (ELA)',
    category: 'PHOTO_TAMPER',
    expectedRiskLevel: 'CRITICAL',
    expectedScoreRange: [70, 85],
    description: 'The original passport holder photograph has been cut and replaced with an unauthorized image. Splicing boundary discontinuities and distinct JPEG compression quantization levels detected around the portrait perimeter.',
    documentImage: createPassportSvg({
      name: 'Vikram Singh',
      docNumber: 'M7120938',
      dob: '14/05/1992',
      expiry: '14/05/2032',
      gender: 'M',
      photoSeed: 'vikram',
      tamperPhoto: true
    }),
    liveFaceImage: createPortraitSvg('Vikram Singh', '#f43f5e', false),
    fields: {
      name: 'Vikram Singh',
      docNumber: 'M7120938',
      nationality: 'IND',
      dob: '14/05/1992',
      expiryDate: '14/05/2032',
      gender: 'MALE',
      issueDate: '15/05/2022',
      docType: 'PASSPORT',
      mrzLine1: 'P<INDSINGH<<VIKRAM<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'M7120938<8IND9205142M3205145<<<<<<<<<<<<<<04'
    },
    sessionData: {
      sessionId: 'SSB-2026-0826-002',
      timestamp: '2026-08-26 10:28:45 IST',
      operatorId: 'OFFICER-SSB-449',
      checkpoint: 'Raxaul Land Border Checkpoint (Indo-Nepal)',
      documentType: 'PASSPORT',
      documentImageUrl: '',
      fields: {
        name: 'Vikram Singh',
        docNumber: 'M7120938',
        nationality: 'IND',
        dob: '14/05/1992',
        expiryDate: '14/05/2032',
        gender: 'MALE',
        issueDate: '15/05/2022',
        docType: 'PASSPORT'
      },
      validation: {
        isValid: true,
        isExpired: false,
        isDobValid: true,
        isFormatValid: true,
        mrzChecksumPass: true,
        mrzDetails: {
          docNumberValid: true,
          dobValid: true,
          expiryValid: true,
          compositeValid: true,
          calculatedChecksums: { doc: 8, dob: 2, exp: 5, comp: 4 },
          expectedChecksums: { doc: 8, dob: 2, exp: 5, comp: 4 }
        },
        issues: [],
        normalizedFields: { dob: '1992-05-14', expiryDate: '2032-05-14' }
      },
      tampering: {
        photoIntegrityScore: 28,
        textIntegrityScore: 92,
        stampIntegrityScore: 90,
        metadataIntegrityScore: 70,
        photoReplaced: true,
        textManipulated: false,
        stampForged: false,
        metadataAnomalous: true,
        regions: [
          {
            id: 'reg-tamper-photo',
            name: 'Holder Photo Boundary & Matrix',
            type: 'PHOTO',
            x: 6.8,
            y: 30,
            width: 20,
            height: 38,
            riskScore: 88,
            status: 'ALERT',
            title: 'Photo Splicing & ELA Compression Anomaly',
            explanation: 'High-frequency compression delta spikes (ELA Variance: 24.8) detected inside photo box compared to surrounding passport substrate. Sharp Sobel boundary discontinuity along photo edges confirms image replacement.',
            metrics: { elaVariance: 24.8, edgeDiscontinuity: 0.88, noiseIndex: 2.65 }
          }
        ],
        summaryNotes: [
          'High risk: Photograph region exhibits distinct quantization matrix mismatch and cut-and-paste boundary artifacts.'
        ]
      },
      faceVerification: {
        match: true,
        similarity: 91.2,
        confidence: 0.94,
        threshold: 75.0,
        status: 'MATCH',
        liveDetected: true,
        landmarksDetected: true,
        notes: 'Live presenter matches the spliced fake photo, indicating organized credential forging.'
      },
      crossField: { match: true, mismatches: [] },
      watchlistHit: MOCK_WATCHLIST_RECORDS[0],
      riskFactors: [
        {
          id: 'rf-photo-splice',
          category: 'PHOTO_TAMPERING',
          title: 'Photo Replacement / Splicing Detected',
          points: 30,
          severity: 'critical',
          description: 'Error Level Analysis reveals abnormal compression difference and sharp edge gradient.',
          evidence: 'ELA variance 24.8 vs baseline 4.2 | Sobel edge jump 0.88 | Quantization mismatch.'
        },
        {
          id: 'rf-watchlist-hit',
          category: 'WATCHLIST',
          title: 'SSB Intelligence Watchlist Match',
          points: 45,
          severity: 'critical',
          description: 'Document holder matched active SSB Human Trafficking intelligence bulletin.',
          evidence: 'Record: W-IND-2026-091 | Flagged for counterfeit document syndicate.'
        }
      ],
      totalRiskScore: 78,
      riskLevel: 'CRITICAL',
      decision: 'DETAIN_ALERT',
      operatorNotes: 'CRITICAL ALERT: Passenger intercepted. Replaced photograph detected on passport. Watchlist match confirmed.'
    }
  },
  {
    id: 'case-3-text-tamper',
    caseNumber: 3,
    title: 'Altered Date of Birth & Expiry Date',
    tagline: 'Text manipulation & VIZ vs MRZ cross-field conflict',
    category: 'TEXT_TAMPER',
    expectedRiskLevel: 'CRITICAL',
    expectedScoreRange: [75, 90],
    description: 'Visual Inspection Zone (VIZ) has been digitally modified to show DOB as 12/04/1995 (to appear older for work permits), but underlying Machine Readable Zone (MRZ) encodes 12/04/2002. Font baseline jitter and pixel artifacts flagged.',
    documentImage: createPassportSvg({
      name: 'Anita Sharma',
      docNumber: 'P9048123',
      dob: '12/04/1995', // Altered in VIZ
      expiry: '12/04/2032',
      gender: 'F',
      photoSeed: 'anita',
      tamperDob: true
    }),
    liveFaceImage: createPortraitSvg('Anita Sharma', '#38bdf8', false),
    fields: {
      name: 'Anita Sharma',
      docNumber: 'P9048123',
      nationality: 'IND',
      dob: '12/04/1995',
      expiryDate: '12/04/2032',
      gender: 'FEMALE',
      docType: 'PASSPORT',
      mrzLine1: 'P<INDSHARMA<<ANITA<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'P9048123<3IND0204128F3204124<<<<<<<<<<<<<<02' // MRZ says 2002
    },
    sessionData: {
      sessionId: 'SSB-2026-0826-003',
      timestamp: '2026-08-26 10:45:10 IST',
      operatorId: 'OFFICER-SSB-449',
      checkpoint: 'Raxaul Land Border Checkpoint (Indo-Nepal)',
      documentType: 'PASSPORT',
      documentImageUrl: '',
      fields: {
        name: 'Anita Sharma',
        docNumber: 'P9048123',
        nationality: 'IND',
        dob: '12/04/1995',
        expiryDate: '12/04/2032',
        gender: 'FEMALE',
        docType: 'PASSPORT',
        mrzLine1: 'P<INDSHARMA<<ANITA<<<<<<<<<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'P9048123<3IND0204128F3204124<<<<<<<<<<<<<<02'
      },
      validation: {
        isValid: false,
        isExpired: false,
        isDobValid: false,
        isFormatValid: true,
        mrzChecksumPass: true,
        mrzDetails: {
          docNumberValid: true,
          dobValid: true,
          expiryValid: true,
          compositeValid: true,
          calculatedChecksums: { doc: 3, dob: 8, exp: 4, comp: 2 },
          expectedChecksums: { doc: 3, dob: 8, exp: 4, comp: 2 }
        },
        issues: ['Cross-field conflict: VIZ Date of Birth (1995) does not match MRZ Date of Birth (2002)'],
        normalizedFields: { dobVIZ: '1995-04-12', dobMRZ: '2002-04-12' }
      },
      tampering: {
        photoIntegrityScore: 94,
        textIntegrityScore: 32,
        stampIntegrityScore: 92,
        metadataIntegrityScore: 68,
        photoReplaced: false,
        textManipulated: true,
        stampForged: false,
        metadataAnomalous: true,
        regions: [
          {
            id: 'reg-tamper-dob',
            name: 'Date of Birth VIZ Field',
            type: 'TEXT',
            x: 31,
            y: 36,
            width: 25,
            height: 8,
            riskScore: 91,
            status: 'ALERT',
            title: 'Font Weight & Baseline Inconsistency',
            explanation: 'Glyph rendering variance (0.78) and local halo artifacts around "1995" indicate overwriting or digital insertion. Baseline y-offset deviates by 3.2px.',
            metrics: { fontConsistency: 0.32, noiseIndex: 2.1 }
          }
        ],
        summaryNotes: ['Severe text tampering: Date of Birth modified to bypass age restrictions.']
      },
      faceVerification: {
        match: true,
        similarity: 94.1,
        confidence: 0.95,
        threshold: 75.0,
        status: 'MATCH',
        liveDetected: true,
        landmarksDetected: true,
        notes: 'Document photo matches presenter.'
      },
      crossField: {
        match: false,
        mismatches: [
          {
            field: 'Date of Birth',
            source1: 'Visual Inspection Zone (VIZ)',
            value1: '12/04/1995',
            source2: 'MRZ TD3 Line 2',
            value2: '12/04/2002',
            severity: 'critical',
            description: 'VIZ DOB has been manipulated to disguise true age (2002 -> 1995).'
          }
        ]
      },
      watchlistHit: null,
      riskFactors: [
        {
          id: 'rf-text-tamper',
          category: 'TEXT_TAMPERING',
          title: 'Text Manipulation in DOB Field',
          points: 35,
          severity: 'critical',
          description: 'Font rasterization irregularity and halo artifacts detected.',
          evidence: 'VIZ text altered to 1995 | Baseline offset 3.2px | Compression halo.'
        },
        {
          id: 'rf-crossfield-dob',
          category: 'CROSS_FIELD',
          title: 'VIZ vs MRZ Identity Conflict',
          points: 40,
          severity: 'critical',
          description: 'Calculated MRZ birthdate (2002) conflicts with printed text (1995).',
          evidence: 'MRZ parsed: 2002-04-12 | VIZ OCR: 1995-04-12 | Delta: 7 Years.'
        },
        {
          id: 'rf-metadata',
          category: 'METADATA',
          title: 'Digital Editing Artifacts in Metadata',
          points: 10,
          severity: 'medium',
          description: 'Secondary layer rendering detected in document stream.',
          evidence: 'PDF / Raster stream contains modified text object.'
        }
      ],
      totalRiskScore: 82,
      riskLevel: 'CRITICAL',
      decision: 'DETAIN_ALERT',
      operatorNotes: 'DOB forgery detected. Document holder altered birth year to meet overseas employment criteria.'
    }
  },
  {
    id: 'case-4-stamp-tamper',
    caseNumber: 4,
    title: 'Counterfeit / Altered Visa Stamp',
    tagline: 'Visa entry stamp structural similarity failure & ink anomaly',
    category: 'STAMP_TAMPER',
    expectedRiskLevel: 'CRITICAL',
    expectedScoreRange: [65, 80],
    description: 'Immigration checkpoint entry stamp shows abnormal pixel structure, low structural similarity (SSIM: 38.4% vs official SSB stamp template), irregular border thickness, and synthetic ink color spectrum.',
    documentImage: createPassportSvg({
      name: 'Amit Patel',
      docNumber: 'T6519284',
      dob: '22/09/1990',
      expiry: '22/09/2030',
      gender: 'M',
      photoSeed: 'amit',
      hasStamp: true,
      tamperStamp: true
    }),
    liveFaceImage: createPortraitSvg('Amit Patel', '#38bdf8', false),
    fields: {
      name: 'Amit Patel',
      docNumber: 'T6519284',
      nationality: 'IND',
      dob: '22/09/1990',
      expiryDate: '22/09/2030',
      gender: 'MALE',
      docType: 'PASSPORT',
      mrzLine1: 'P<INDPATEL<<AMIT<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'T6519284<2IND9009226M3009228<<<<<<<<<<<<<<08'
    },
    sessionData: {
      sessionId: 'SSB-2026-0826-004',
      timestamp: '2026-08-26 11:02:18 IST',
      operatorId: 'OFFICER-SSB-449',
      checkpoint: 'Raxaul Land Border Checkpoint (Indo-Nepal)',
      documentType: 'PASSPORT',
      documentImageUrl: '',
      fields: {
        name: 'Amit Patel',
        docNumber: 'T6519284',
        nationality: 'IND',
        dob: '22/09/1990',
        expiryDate: '22/09/2030',
        gender: 'MALE',
        docType: 'PASSPORT'
      },
      validation: {
        isValid: true,
        isExpired: false,
        isDobValid: true,
        isFormatValid: true,
        mrzChecksumPass: true,
        mrzDetails: {
          docNumberValid: true,
          dobValid: true,
          expiryValid: true,
          compositeValid: true,
          calculatedChecksums: { doc: 2, dob: 6, exp: 8, comp: 8 },
          expectedChecksums: { doc: 2, dob: 6, exp: 8, comp: 8 }
        },
        issues: [],
        normalizedFields: { dob: '1990-09-22', expiryDate: '2030-09-22' }
      },
      tampering: {
        photoIntegrityScore: 95,
        textIntegrityScore: 91,
        stampIntegrityScore: 38,
        metadataIntegrityScore: 82,
        photoReplaced: false,
        textManipulated: false,
        stampForged: true,
        metadataAnomalous: false,
        regions: [
          {
            id: 'reg-stamp-forgery',
            name: 'Immigration Entry Stamp Box',
            type: 'STAMP',
            x: 68,
            y: 33,
            width: 24,
            height: 28,
            riskScore: 85,
            status: 'ALERT',
            title: 'Stamp Template Matching Mismatch & Ink Anomaly',
            explanation: 'SSIM similarity against official SSB Raxaul checkpoint stamp baseline is only 38.4% (Threshold: 80%). Font geometry, border circularity (0.61), and color histogram deviate from genuine security ink.',
            metrics: { ssimMatch: 0.384, edgeDiscontinuity: 0.72 }
          }
        ],
        summaryNotes: ['High risk: Altered / counterfeit visa entry stamp detected.']
      },
      faceVerification: {
        match: true,
        similarity: 92.8,
        confidence: 0.96,
        threshold: 75.0,
        status: 'MATCH',
        liveDetected: true,
        landmarksDetected: true,
        notes: 'Document photo matches presenter.'
      },
      crossField: { match: true, mismatches: [] },
      watchlistHit: null,
      riskFactors: [
        {
          id: 'rf-stamp-forge',
          category: 'STAMP_TAMPERING',
          title: 'Counterfeit / Altered Immigration Stamp',
          points: 40,
          severity: 'critical',
          description: 'Stamp geometry and ink spectral analysis failed official checkpoint verification.',
          evidence: 'SSIM Match: 38.4% | Circularity: 0.61 vs 0.98 | Ink RGB spectrum mismatch.'
        },
        {
          id: 'rf-stamp-tamper-text',
          category: 'STAMP_TAMPERING',
          title: 'Abnormal Stamp Date & Officer ID Typography',
          points: 25,
          severity: 'high',
          description: 'Stamp date box rendered with synthetic digital font rather than mechanical relief stamp.',
          evidence: 'Pixel edge sharpness 0.72 indicates digital inkjet replication.'
        }
      ],
      totalRiskScore: 72,
      riskLevel: 'CRITICAL',
      decision: 'DETAIN_ALERT',
      operatorNotes: 'Counterfeit immigration entry stamp detected on page 3. Referred for physical forensics inspection.'
    }
  },
  {
    id: 'case-5-face-mismatch',
    caseNumber: 5,
    title: 'Identity Impersonation / Biometric Mismatch',
    tagline: 'Lookalike presenter does not match genuine document photograph',
    category: 'FACE_MISMATCH',
    expectedRiskLevel: 'CRITICAL',
    expectedScoreRange: [80, 95],
    description: 'Document itself is authentic, but the individual presenting the passport at the checkpoint fails facial biometric embedding similarity (34.8% vs required 75.0% threshold). Facial landmark geometry confirms different person.',
    documentImage: createPassportSvg({
      name: 'Deepak Verma',
      docNumber: 'D4512903',
      dob: '09/11/1996',
      expiry: '09/11/2031',
      gender: 'M',
      photoSeed: 'deepak',
      hasStamp: true
    }),
    liveFaceImage: createPortraitSvg('Deepak Verma (Imposter)', '#f59e0b', true),
    fields: {
      name: 'Deepak Verma',
      docNumber: 'D4512903',
      nationality: 'IND',
      dob: '09/11/1996',
      expiryDate: '09/11/2031',
      gender: 'MALE',
      docType: 'PASSPORT',
      mrzLine1: 'P<INDVERMA<<DEEPAK<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'D4512903<6IND9611094M3111092<<<<<<<<<<<<<<01'
    },
    sessionData: {
      sessionId: 'SSB-2026-0826-005',
      timestamp: '2026-08-26 11:24:50 IST',
      operatorId: 'OFFICER-SSB-449',
      checkpoint: 'Raxaul Land Border Checkpoint (Indo-Nepal)',
      documentType: 'PASSPORT',
      documentImageUrl: '',
      fields: {
        name: 'Deepak Verma',
        docNumber: 'D4512903',
        nationality: 'IND',
        dob: '09/11/1996',
        expiryDate: '09/11/2031',
        gender: 'MALE',
        docType: 'PASSPORT'
      },
      validation: {
        isValid: true,
        isExpired: false,
        isDobValid: true,
        isFormatValid: true,
        mrzChecksumPass: true,
        mrzDetails: {
          docNumberValid: true,
          dobValid: true,
          expiryValid: true,
          compositeValid: true,
          calculatedChecksums: { doc: 6, dob: 4, exp: 2, comp: 1 },
          expectedChecksums: { doc: 6, dob: 4, exp: 2, comp: 1 }
        },
        issues: [],
        normalizedFields: { dob: '1996-11-09', expiryDate: '2031-11-09' }
      },
      tampering: {
        photoIntegrityScore: 96,
        textIntegrityScore: 97,
        stampIntegrityScore: 95,
        metadataIntegrityScore: 98,
        photoReplaced: false,
        textManipulated: false,
        stampForged: false,
        metadataAnomalous: false,
        regions: [],
        summaryNotes: ['Physical document passes all tampering checks; fraud is biometric impersonation.']
      },
      faceVerification: {
        match: false,
        similarity: 34.8,
        confidence: 0.98,
        threshold: 75.0,
        status: 'MISMATCH',
        liveDetected: true,
        landmarksDetected: true,
        notes: 'CRITICAL: Facial embedding distance (Cosine similarity 34.8%) indicates person presenting document is NOT the document owner.'
      },
      crossField: { match: true, mismatches: [] },
      watchlistHit: MOCK_WATCHLIST_RECORDS[2],
      riskFactors: [
        {
          id: 'rf-face-mismatch',
          category: 'FACE_BIOMETRIC',
          title: 'Facial Biometric Impersonation Alert',
          points: 45,
          severity: 'critical',
          description: 'Live face capture differs significantly from passport photo.',
          evidence: 'Similarity: 34.8% (Threshold: 75%) | Inter-pupillary distance & jawline landmark variance > 42%.'
        },
        {
          id: 'rf-impersonation-watch',
          category: 'WATCHLIST',
          title: 'Impersonation Investigation Watchlist Hit',
          points: 40,
          severity: 'critical',
          description: 'Document record flagged in MHA Bureau of Immigration fraud database.',
          evidence: 'Record: W-MHA-2026-104 | Flagged for stolen credential reuse.'
        }
      ],
      totalRiskScore: 88,
      riskLevel: 'CRITICAL',
      decision: 'DETAIN_ALERT',
      operatorNotes: 'Subject detained for identity impersonation. Attempted to cross border using legitimate third-party passport.'
    }
  },
  {
    id: 'case-6-expired-metadata',
    caseNumber: 6,
    title: 'Expired Document & Photoshop Metadata Anomaly',
    tagline: 'Expired travel authorization with image editor signatures',
    category: 'EXPIRED_METADATA',
    expectedRiskLevel: 'CRITICAL',
    expectedScoreRange: [75, 90],
    description: 'Document expired on 10/01/2023. EXIF metadata analysis revealed editing signatures from "Adobe Photoshop 2024", indicating digital attempt to modify document timestamps.',
    documentImage: createPassportSvg({
      name: 'Sunita Rao',
      docNumber: 'K1092837',
      dob: '05/03/1985',
      expiry: '10/01/2023',
      gender: 'F',
      photoSeed: 'sunita',
      isExpired: true
    }),
    liveFaceImage: createPortraitSvg('Sunita Rao', '#38bdf8', false),
    fields: {
      name: 'Sunita Rao',
      docNumber: 'K1092837',
      nationality: 'IND',
      dob: '05/03/1985',
      expiryDate: '10/01/2023',
      gender: 'FEMALE',
      docType: 'PASSPORT',
      mrzLine1: 'P<INDRAO<<SUNITA<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'K1092837<1IND8503052F2301103<<<<<<<<<<<<<<09'
    },
    sessionData: {
      sessionId: 'SSB-2026-0826-006',
      timestamp: '2026-08-26 11:40:02 IST',
      operatorId: 'OFFICER-SSB-449',
      checkpoint: 'Raxaul Land Border Checkpoint (Indo-Nepal)',
      documentType: 'PASSPORT',
      documentImageUrl: '',
      fields: {
        name: 'Sunita Rao',
        docNumber: 'K1092837',
        nationality: 'IND',
        dob: '05/03/1985',
        expiryDate: '10/01/2023',
        gender: 'FEMALE',
        docType: 'PASSPORT'
      },
      validation: {
        isValid: false,
        isExpired: true,
        isDobValid: true,
        isFormatValid: true,
        mrzChecksumPass: true,
        mrzDetails: {
          docNumberValid: true,
          dobValid: true,
          expiryValid: true,
          compositeValid: true,
          calculatedChecksums: { doc: 1, dob: 2, exp: 3, comp: 9 },
          expectedChecksums: { doc: 1, dob: 2, exp: 3, comp: 9 }
        },
        issues: ['CRITICAL: Document expired on 10/01/2023 (Over 3 years expired)'],
        normalizedFields: { expiryDate: '2023-01-10' }
      },
      tampering: {
        photoIntegrityScore: 89,
        textIntegrityScore: 84,
        stampIntegrityScore: 88,
        metadataIntegrityScore: 22,
        photoReplaced: false,
        textManipulated: false,
        stampForged: false,
        metadataAnomalous: true,
        softwareDetected: 'Adobe Photoshop 2024 (Windows)',
        metadataTags: {
          'Software': 'Adobe Photoshop 2024 (Windows)',
          'ModifyDate': '2026-02-10 18:22:04',
          'HistoryAction': 'saved / edited / derived',
          'XMPToolkit': 'Adobe XMP Core 9.0',
          'ColorProfile': 'Untagged RGB'
        },
        regions: [
          {
            id: 'reg-metadata-alert',
            name: 'Image EXIF / XMP Container',
            type: 'METADATA',
            x: 5,
            y: 5,
            width: 90,
            height: 90,
            riskScore: 82,
            status: 'ALERT',
            title: 'Image Editing Software Signature in EXIF',
            explanation: 'Document image contains Adobe Photoshop 2024 metadata history tags and modified timestamp. Indicates unauthorized pre-processing.',
            metrics: { noiseIndex: 1.8 }
          }
        ],
        summaryNotes: ['Metadata anomaly: Image re-saved and modified using digital photo manipulation software.']
      },
      faceVerification: {
        match: true,
        similarity: 93.5,
        confidence: 0.97,
        threshold: 75.0,
        status: 'MATCH',
        liveDetected: true,
        landmarksDetected: true,
        notes: 'Document photo matches presenter.'
      },
      crossField: { match: true, mismatches: [] },
      watchlistHit: null,
      riskFactors: [
        {
          id: 'rf-expired-doc',
          category: 'VALIDATION',
          title: 'Expired Travel Document',
          points: 40,
          severity: 'critical',
          description: 'Document expired on 10/01/2023.',
          evidence: 'Expiry Date: 2023-01-10 | Status: Expired (Invalid for travel).'
        },
        {
          id: 'rf-meta-photoshop',
          category: 'METADATA',
          title: 'Adobe Photoshop Editing Signature Detected',
          points: 35,
          severity: 'high',
          description: 'Image metadata contains image manipulation software signature.',
          evidence: 'Software: Adobe Photoshop 2024 (Windows) | History: Saved 2026-02-10.'
        },
        {
          id: 'rf-meta-timestamp',
          category: 'METADATA',
          title: 'Timestamp Inconsistency',
          points: 10,
          severity: 'medium',
          description: 'Image file creation timestamp precedes capture timestamp.',
          evidence: 'Timestamp skew: 14 days.'
        }
      ],
      totalRiskScore: 85,
      riskLevel: 'CRITICAL',
      decision: 'DETAIN_ALERT',
      operatorNotes: 'Document expired and digitally modified. Entry prohibited.'
    }
  },
  {
    id: 'case-7-cross-field-mismatch',
    caseNumber: 7,
    title: 'Cross-Field Identity Conflict (Passport vs Visa)',
    tagline: 'Mismatch between Passport holder name and attached Visa permit',
    category: 'CROSS_DOC_MISMATCH',
    expectedRiskLevel: 'CRITICAL',
    expectedScoreRange: [70, 85],
    description: 'Document package includes an Indian Passport for "RAHUL KUMAR" attached with a Visa sticker issued to "RAHUL SHARMA". System flags critical cross-document identity divergence.',
    documentImage: createPassportSvg({
      name: 'Rahul Kumar',
      docNumber: 'K9182736',
      dob: '18/07/1998',
      expiry: '18/07/2033',
      gender: 'M',
      photoSeed: 'rahul_k',
      hasStamp: true
    }),
    liveFaceImage: createPortraitSvg('Rahul Kumar', '#38bdf8', false),
    fields: {
      name: 'Rahul Kumar',
      docNumber: 'K9182736',
      nationality: 'IND',
      dob: '18/07/1998',
      expiryDate: '18/07/2033',
      gender: 'MALE',
      docType: 'PASSPORT',
      visaNumber: 'IND-V-8891024',
      visaType: 'EMPLOYMENT (E-2)',
      entryValidation: 'MULTIPLE ENTRY',
      stayDuration: '180 DAYS',
      mrzLine1: 'P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'K9182736<4IND9807185M3307181<<<<<<<<<<<<<<03'
    },
    sessionData: {
      sessionId: 'SSB-2026-0826-007',
      timestamp: '2026-08-26 11:58:30 IST',
      operatorId: 'OFFICER-SSB-449',
      checkpoint: 'Raxaul Land Border Checkpoint (Indo-Nepal)',
      documentType: 'PASSPORT',
      documentImageUrl: '',
      fields: {
        name: 'Rahul Kumar',
        docNumber: 'K9182736',
        nationality: 'IND',
        dob: '18/07/1998',
        expiryDate: '18/07/2033',
        gender: 'MALE',
        docType: 'PASSPORT',
        visaNumber: 'IND-V-8891024',
        visaType: 'EMPLOYMENT (E-2)',
        entryValidation: 'MULTIPLE ENTRY',
        stayDuration: '180 DAYS'
      },
      validation: {
        isValid: true,
        isExpired: false,
        isDobValid: true,
        isFormatValid: true,
        mrzChecksumPass: true,
        mrzDetails: {
          docNumberValid: true,
          dobValid: true,
          expiryValid: true,
          compositeValid: true,
          calculatedChecksums: { doc: 4, dob: 5, exp: 1, comp: 3 },
          expectedChecksums: { doc: 4, dob: 5, exp: 1, comp: 3 }
        },
        issues: [],
        normalizedFields: { dob: '1998-07-18', expiryDate: '2033-07-18' }
      },
      tampering: {
        photoIntegrityScore: 95,
        textIntegrityScore: 94,
        stampIntegrityScore: 92,
        metadataIntegrityScore: 96,
        photoReplaced: false,
        textManipulated: false,
        stampForged: false,
        metadataAnomalous: false,
        regions: [],
        summaryNotes: ['Document pages intact; cross-document credential conflict identified.']
      },
      faceVerification: {
        match: true,
        similarity: 95.2,
        confidence: 0.98,
        threshold: 75.0,
        status: 'MATCH',
        liveDetected: true,
        landmarksDetected: true,
        notes: 'Document photo matches presenter.'
      },
      crossField: {
        match: false,
        mismatches: [
          {
            field: 'Holder Full Name',
            source1: 'Passport Bio-Page',
            value1: 'RAHUL KUMAR',
            source2: 'Attached Visa Sticker (IND-V-8891024)',
            value2: 'RAHUL SHARMA',
            severity: 'critical',
            description: 'Surname mismatch between primary passport and accompanying entry visa.'
          }
        ]
      },
      watchlistHit: null,
      riskFactors: [
        {
          id: 'rf-crossdoc-name',
          category: 'CROSS_FIELD',
          title: 'Passport vs Visa Identity Conflict',
          points: 45,
          severity: 'critical',
          description: 'Document bundle contains mismatched identities.',
          evidence: 'Passport Holder: RAHUL KUMAR | Visa Holder: RAHUL SHARMA | Status: Incompatible Credentials.'
        },
        {
          id: 'rf-crossdoc-visa',
          category: 'VALIDATION',
          title: 'Invalid Visa Endorsement',
          points: 30,
          severity: 'high',
          description: 'Visa permit issued to different surname cannot be attached to current passport.',
          evidence: 'Visa IND-V-8891024 invalid for passport K9182736.'
        }
      ],
      totalRiskScore: 75,
      riskLevel: 'CRITICAL',
      decision: 'SECONDARY_INSPECTION',
      operatorNotes: 'Flagged for secondary investigation: Visa sticker name (Rahul Sharma) does not match passport name (Rahul Kumar).'
    }
  },
  {
    id: 'case-8-multiple-risk',
    caseNumber: 8,
    title: 'Multiple Risk Signals (Combined Threat)',
    tagline: 'Simultaneous photo splicing, biometric mismatch, expired validity, and intelligence alert',
    category: 'MULTIPLE_RISK',
    expectedRiskLevel: 'CRITICAL',
    expectedScoreRange: [90, 100],
    description: 'Sophisticated cross-border credential forgery incorporating physical photo replacement, expired travel validity, presenter facial impersonation, and an active INTERPOL intelligence bulletin hit.',
    documentImage: createPassportSvg({
      name: 'Tariq Ahmed',
      docNumber: 'T9812450',
      dob: '22/03/1988',
      expiry: '22/03/2024',
      gender: 'M',
      photoSeed: 'tariq',
      tamperPhoto: true,
      isExpired: true,
      hasStamp: true,
      tamperStamp: true
    }),
    liveFaceImage: createPortraitSvg('Tariq Ahmed (Imposter)', '#f43f5e', true),
    fields: {
      name: 'Tariq Ahmed',
      docNumber: 'T9812450',
      nationality: 'PAK',
      dob: '22/03/1988',
      expiryDate: '22/03/2024',
      gender: 'MALE',
      issueDate: '23/03/2014',
      docType: 'PASSPORT',
      mrzLine1: 'P<PAKAHMED<<TARIQ<<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'T9812450<2PAK8803224M2403222<<<<<<<<<<<<<<08'
    },
    sessionData: {
      sessionId: 'PAHCHAN-2026-0826-008',
      timestamp: '2026-08-26 12:15:40 IST',
      operatorId: 'OFFICER-SSB-449',
      checkpoint: 'Raxaul Land Border Checkpoint (Indo-Nepal)',
      documentType: 'PASSPORT',
      documentImageUrl: '',
      documentSha256: '9f83a2e1d74b93c850123ef671ab409823412356abce897123984124baef1209',
      fields: {
        name: 'Tariq Ahmed',
        docNumber: 'T9812450',
        nationality: 'PAK',
        dob: '22/03/1988',
        expiryDate: '22/03/2024',
        gender: 'MALE',
        issueDate: '23/03/2014',
        docType: 'PASSPORT',
        mrzLine1: 'P<PAKAHMED<<TARIQ<<<<<<<<<<<<<<<<<<<<<<<<<<<',
        mrzLine2: 'T9812450<2PAK8803224M2403222<<<<<<<<<<<<<<08',
        fieldConfidences: {
          name: 0.985,
          docNumber: 0.992,
          nationality: 0.990,
          dob: 0.988,
          expiryDate: 0.994,
          gender: 0.989
        }
      },
      validation: {
        isValid: false,
        isExpired: true,
        isDobValid: true,
        isFormatValid: true,
        mrzChecksumPass: true,
        mrzDetails: {
          docNumberValid: true,
          dobValid: true,
          expiryValid: true,
          compositeValid: true,
          calculatedChecksums: { doc: 2, dob: 4, exp: 2, comp: 8 },
          expectedChecksums: { doc: 2, dob: 4, exp: 2, comp: 8 }
        },
        issues: [
          'CRITICAL: Document expired on 22/03/2024 (Over 2 years expired)',
          'High Risk: Spliced portrait substrate boundary detected'
        ],
        normalizedFields: { dob: '1988-03-22', expiryDate: '2024-03-22' }
      },
      tampering: {
        photoIntegrityScore: 22,
        textIntegrityScore: 84,
        stampIntegrityScore: 35,
        metadataIntegrityScore: 40,
        photoReplaced: true,
        textManipulated: false,
        stampForged: true,
        metadataAnomalous: true,
        regions: [
          {
            id: 'reg-multi-photo',
            name: 'Replaced Portrait Substrate',
            type: 'PHOTO',
            x: 6.8,
            y: 30,
            width: 20,
            height: 38,
            riskScore: 92,
            status: 'ALERT',
            title: 'Photo Splicing & ELA Quantization Anomaly',
            explanation: 'Severe ELA variance spike (28.4) with discontinuous Sobel boundary gradient (0.94) across photo perimeter.',
            evidence: 'Quantization matrix divergence > 5.1x | Sharp border artifact.',
            metrics: { elaVariance: 28.4, edgeDiscontinuity: 0.94, noiseIndex: 2.8 }
          },
          {
            id: 'reg-multi-stamp',
            name: 'Altered Immigration Stamp',
            type: 'STAMP',
            x: 68,
            y: 33,
            width: 24,
            height: 28,
            riskScore: 86,
            status: 'ALERT',
            title: 'Counterfeit Stamp SSIM Failure',
            explanation: 'Stamp template structural similarity is only 34.2% vs official checkpoint baseline.',
            evidence: 'SSIM Match: 34.2% | Digital inkjet raster pattern.',
            metrics: { ssimMatch: 0.342, edgeDiscontinuity: 0.81 }
          }
        ],
        summaryNotes: [
          'Multiple critical forensic anomalies: Photo replaced, counterfeit visa stamp, and expired validity.'
        ]
      },
      faceVerification: {
        match: false,
        similarity: 31.5,
        confidence: 0.99,
        threshold: 75.0,
        status: 'MISMATCH',
        liveDetected: true,
        landmarksDetected: true,
        notes: 'CRITICAL BIOMETRIC ALERT: Live presenter facial embedding distance (31.5%) indicates imposter.'
      },
      crossField: { match: true, mismatches: [] },
      watchlistHit: MOCK_WATCHLIST_RECORDS[1],
      riskFactors: [
        {
          id: 'rf-multi-photo',
          category: 'PHOTO_TAMPERING',
          title: 'Photo Replacement / Splicing Detected',
          points: 30,
          severity: 'critical',
          description: 'Portrait box shows clear physical cut and substitution.',
          evidence: 'ELA variance 28.4 | Sobel jump 0.94.'
        },
        {
          id: 'rf-multi-face',
          category: 'FACE_BIOMETRIC',
          title: 'Facial Biometric Impersonation Alert',
          points: 45,
          severity: 'critical',
          description: 'Live presenter facial embedding distance failed required threshold.',
          evidence: 'Similarity 31.5% (Threshold 75%) | Landmark variance > 48%.'
        },
        {
          id: 'rf-multi-watch',
          category: 'WATCHLIST',
          title: 'INTERPOL Red Notice Watchlist Hit',
          points: 50,
          severity: 'critical',
          description: 'Document holder matched active INTERPOL Red Notice bulletin.',
          evidence: 'Record: W-INT-2025-442 | Transnational organized fraud syndicate.'
        },
        {
          id: 'rf-multi-exp',
          category: 'VALIDATION',
          title: 'Expired Travel Document',
          points: 35,
          severity: 'critical',
          description: 'Document expired on 22/03/2024.',
          evidence: 'Expired over 2 years ago.'
        }
      ],
      totalRiskScore: 95,
      riskLevel: 'CRITICAL',
      decision: 'DETAIN_ALERT',
      operatorNotes: 'CRITICAL FRAUD INTERCEPTION: Multiple severe signals confirmed (Photo splicing, Biometric mismatch, Expired doc, and active INTERPOL bulletin). Detain subject immediately.',
      explainability: {
        whatHappened: 'Screening triggered 4 critical alerts across physical forensics, biometric comparison, document expiration, and active intelligence databases.',
        whyIsItRisky: [
          'Portrait splicing confirms document tampering.',
          'Biometric similarity (31.5%) indicates passenger is an imposter.',
          'Subject matched an active INTERPOL Red Notice alert.'
        ],
        supportingEvidence: [
          'Photo ELA variance 28.4 | Sobel boundary discontinuity 0.94',
          'Biometric similarity: 31.5% vs 75.0% threshold',
          'Record W-INT-2025-442 in INTERPOL Red Notice database'
        ],
        officerRecommendation: 'ESCALATE IMMEDIATELY: Detain subject, retain physical document under chain of custody, and notify Shift Commander and Anti-Terrorism Squad.'
      }
    }
  }
];
