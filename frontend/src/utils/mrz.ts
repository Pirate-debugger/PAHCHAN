/**
 * ICAO Doc 9303 Machine Readable Zone (MRZ) Parser & Checksum Validator
 * Standard 7-3-1 weighting algorithm with modulo 10
 */

const MRZ_WEIGHTS = [7, 3, 1];

export function getCharValue(char: string): number {
  if (!char || char === '<') return 0;
  const upper = char.toUpperCase();
  const code = upper.charCodeAt(0);
  if (code >= 48 && code <= 57) {
    return code - 48; // '0'-'9'
  }
  if (code >= 65 && code <= 90) {
    return code - 65 + 10; // 'A'-'Z' (A=10, B=11, ..., Z=35)
  }
  return 0;
}

export function computeMRZChecksum(dataStr: string): number {
  let sum = 0;
  for (let i = 0; i < dataStr.length; i++) {
    const val = getCharValue(dataStr[i]);
    const weight = MRZ_WEIGHTS[i % 3];
    sum += val * weight;
  }
  return sum % 10;
}

export interface MRZParseResult {
  docType: 'TD1' | 'TD2' | 'TD3' | 'UNKNOWN';
  documentNumber: string;
  docNumberCheckDigit: number;
  isDocNumberValid: boolean;
  nationality: string;
  dob: string; // YYYY-MM-DD
  dobRaw: string; // YYMMDD
  dobCheckDigit: number;
  isDobValid: boolean;
  gender: string;
  expiryDate: string; // YYYY-MM-DD
  expiryDateRaw: string; // YYMMDD
  expiryCheckDigit: number;
  isExpiryValid: boolean;
  personalNumber: string;
  personalNumberCheckDigit?: number;
  compositeCheckDigit: number;
  isCompositeValid: boolean;
  holderName: string;
  issuingCountry: string;
  overallValid: boolean;
}

function parseMRZDate(yymmdd: string, isExpiry: boolean = false): string {
  if (!yymmdd || yymmdd.length < 6) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);
  
  const currentYear = new Date().getFullYear() % 100;
  let fullYear: number;
  
  if (isExpiry) {
    // For expiry: if yy < 50 => 2000+yy, else 1900+yy
    fullYear = yy < 50 ? 2000 + yy : 1900 + yy;
  } else {
    // For DOB: if yy > currentYear => 1900+yy, else 2000+yy
    fullYear = yy > currentYear ? 1900 + yy : 2000 + yy;
  }
  
  return `${fullYear}-${mm}-${dd}`;
}

export function parseTD3(line1: string, line2: string): MRZParseResult {
  // TD3: 2 lines of 44 characters (Standard Passport)
  const cleanL1 = line1.padEnd(44, '<').substring(0, 44);
  const cleanL2 = line2.padEnd(44, '<').substring(0, 44);

  const issuingCountry = cleanL1.substring(2, 5).replace(/</g, '');
  const namePart = cleanL1.substring(5).replace(/<+/g, ' ').trim();

  const docNumber = cleanL2.substring(0, 9).replace(/</g, '');
  const docNumberCheckDigit = parseInt(cleanL2[9], 10) || 0;
  const calcDocCheck = computeMRZChecksum(cleanL2.substring(0, 9));
  const isDocNumberValid = calcDocCheck === docNumberCheckDigit;

  const nationality = cleanL2.substring(10, 13).replace(/</g, '');
  const dobRaw = cleanL2.substring(13, 19);
  const dobCheckDigit = parseInt(cleanL2[19], 10) || 0;
  const calcDobCheck = computeMRZChecksum(dobRaw);
  const isDobValid = calcDobCheck === dobCheckDigit;
  const dob = parseMRZDate(dobRaw, false);

  const gender = cleanL2[20] === 'M' ? 'MALE' : cleanL2[20] === 'F' ? 'FEMALE' : 'UNSPECIFIED';

  const expiryRaw = cleanL2.substring(21, 27);
  const expiryCheckDigit = parseInt(cleanL2[27], 10) || 0;
  const calcExpiryCheck = computeMRZChecksum(expiryRaw);
  const isExpiryValid = calcExpiryCheck === expiryCheckDigit;
  const expiryDate = parseMRZDate(expiryRaw, true);

  const personalNumber = cleanL2.substring(28, 42).replace(/</g, '');
  const compositeCheckDigit = parseInt(cleanL2[43], 10) || 0;
  
  // Composite checksum input for TD3: DocNum+Check + DOB+Check + Expiry+Check + PersonalNum+Check (chars 0-42 of line 2)
  const compositeData = cleanL2.substring(0, 10) + cleanL2.substring(13, 20) + cleanL2.substring(21, 43);
  const calcCompositeCheck = computeMRZChecksum(compositeData);
  const isCompositeValid = calcCompositeCheck === compositeCheckDigit;

  const overallValid = isDocNumberValid && isDobValid && isExpiryValid && isCompositeValid;

  return {
    docType: 'TD3',
    documentNumber: docNumber,
    docNumberCheckDigit,
    isDocNumberValid,
    nationality,
    dob,
    dobRaw,
    dobCheckDigit,
    isDobValid,
    gender,
    expiryDate,
    expiryDateRaw: expiryRaw,
    expiryCheckDigit,
    isExpiryValid,
    personalNumber,
    compositeCheckDigit,
    isCompositeValid,
    holderName: namePart,
    issuingCountry,
    overallValid
  };
}
