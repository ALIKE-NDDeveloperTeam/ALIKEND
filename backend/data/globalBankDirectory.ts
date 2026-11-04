import BankInstitution, {
  InstitutionCategory,
  RegulatoryVerificationStatus,
} from "../models/BankInstitution";
import { isMongoConnected } from "../store";

export interface BankDirectoryRecord {
  institutionId: string;
  officialName: string;
  aliases: string[];
  country: string;
  countriesOfOperation: string[];
  region:
    | "Bangladesh"
    | "South Asia"
    | "Asia-Pacific"
    | "United Kingdom & Europe"
    | "North America"
    | "Middle East"
    | "Africa"
    | "Latin America & South America"
    | "Oceania"
    | "Global Multi-Region";
  category: InstitutionCategory;
  isTraditionalBank: boolean;
  officialWebsite: string;
  supportedCurrencies: string[];
  swiftBicCode?: string;
  routingCodeType?: string;
  verificationSource: string;
  verificationSourceUrl?: string;
  regulatoryStatus: RegulatoryVerificationStatus;
  verified: boolean;
  payoutEligible: boolean;
  payoutSupportedCountries: string[];
  supportedPayoutRails: string[];
  active: boolean;
  lastVerifiedDate: string;
  adminNotes?: string;
}

// Helper for concise seed definition
interface RawSeedEntry {
  name: string;
  country: string;
  region: BankDirectoryRecord["region"];
  category?: InstitutionCategory;
  website?: string;
  currencies?: string[];
  source?: string;
  sourceUrl?: string;
  aliases?: string[];
  countries?: string[];
  payoutEligible?: boolean;
  regulatoryStatus?: RegulatoryVerificationStatus;
  verified?: boolean;
  swift?: string;
  routingType?: string;
  rails?: string[];
}

const COUNTRY_DEFAULT_META: Record<
  string,
  {
    currency: string;
    regulator: string;
    regulatorUrl: string;
    routingType: string;
    defaultRails: string[];
  }
> = {
  Bangladesh: {
    currency: "BDT",
    regulator: "Bangladesh Bank (Scheduled Banks Register)",
    regulatorUrl: "https://www.bb.org.bd/en/index.php/financialactivity/bankfi",
    routingType: "Bangladesh Bank Routing Number (9-Digit) / BEFTN",
    defaultRails: ["BEFTN", "RTGS", "NPSB"],
  },
  India: {
    currency: "INR",
    regulator: "Reserve Bank of India (RBI Scheduled Banks)",
    regulatorUrl: "https://www.rbi.org.in",
    routingType: "IFSC Code (11-Character)",
    defaultRails: ["NEFT", "RTGS", "IMPS", "UPI"],
  },
  Pakistan: {
    currency: "PKR",
    regulator: "State Bank of Pakistan (Regulated Institutions)",
    regulatorUrl: "https://www.sbp.org.pk",
    routingType: "IBAN (24-Character PK) / RAAST",
    defaultRails: ["IBFT", "RAAST", "RTGS"],
  },
  Nepal: {
    currency: "NPR",
    regulator: "Nepal Rastra Bank (Class A Commercial Banks)",
    regulatorUrl: "https://www.nrb.org.np",
    routingType: "NCHL / ConnectIPS Bank Code",
    defaultRails: ["ConnectIPS", "NCHL-ECC", "RTGS"],
  },
  "Sri Lanka": {
    currency: "LKR",
    regulator: "Central Bank of Sri Lanka (Licensed Commercial Banks)",
    regulatorUrl: "https://www.cbsl.gov.lk",
    routingType: "SLIPS Bank & Branch Code / CEFTS",
    defaultRails: ["SLIPS", "CEFTS", "RTGS"],
  },
  "United States": {
    currency: "USD",
    regulator: "FDIC / OCC National Bank Register",
    regulatorUrl: "https://banks.data.fdic.gov",
    routingType: "ABA Routing Transit Number (9-Digit)",
    defaultRails: ["ACH", "Fedwire", "RTP"],
  },
  Canada: {
    currency: "CAD",
    regulator: "Office of the Superintendent of Financial Institutions (OSFI)",
    regulatorUrl: "https://www.osfi-bsif.gc.ca",
    routingType: "Canadian Transit & Institution Number (EFT)",
    defaultRails: ["EFT", "Interac", "Lynx Wire"],
  },
  Mexico: {
    currency: "MXN",
    regulator: "CNBV / Banco de México (SPEI Participants)",
    regulatorUrl: "https://www.cnbv.gob.mx",
    routingType: "CLABE (18-Digit)",
    defaultRails: ["SPEI", "SWIFT"],
  },
  "United Kingdom": {
    currency: "GBP",
    regulator: "UK Prudential Regulation Authority (PRA) / FCA Register",
    regulatorUrl: "https://register.fca.org.uk",
    routingType: "UK Sort Code (6-Digit) & IBAN",
    defaultRails: ["Faster Payments (FPS)", "BACS", "CHAPS"],
  },
  Germany: {
    currency: "EUR",
    regulator: "BaFin / European Central Bank (ECB) Credit Institutions Register",
    regulatorUrl: "https://www.bafin.de",
    routingType: "IBAN (DE) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant", "TARGET2"],
  },
  France: {
    currency: "EUR",
    regulator: "ACPR / Banque de France / ECB Register",
    regulatorUrl: "https://acpr.banque-france.fr",
    routingType: "IBAN (FR) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Spain: {
    currency: "EUR",
    regulator: "Banco de España / ECB Register",
    regulatorUrl: "https://www.bde.es",
    routingType: "IBAN (ES) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Italy: {
    currency: "EUR",
    regulator: "Banca d'Italia / ECB Register",
    regulatorUrl: "https://www.bancaditalia.it",
    routingType: "IBAN (IT) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Netherlands: {
    currency: "EUR",
    regulator: "De Nederlandsche Bank (DNB) / ECB Register",
    regulatorUrl: "https://www.dnb.nl",
    routingType: "IBAN (NL) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Switzerland: {
    currency: "CHF",
    regulator: "Swiss Financial Market Supervisory Authority (FINMA)",
    regulatorUrl: "https://www.finma.ch",
    routingType: "IBAN (CH) & SIC Clearing Number",
    defaultRails: ["SIC", "SEPA", "SWIFT"],
  },
  Sweden: {
    currency: "SEK",
    regulator: "Finansinspektionen (Swedish Financial Supervisory Authority)",
    regulatorUrl: "https://www.fi.se",
    routingType: "IBAN (SE) & Bankgiro",
    defaultRails: ["Bankgiro", "Swish", "SEPA"],
  },
  Norway: {
    currency: "NOK",
    regulator: "Finanstilsynet (Financial Supervisory Authority of Norway)",
    regulatorUrl: "https://www.finanstilsynet.no",
    routingType: "IBAN (NO) & Norwegian Account Number (11-Digit)",
    defaultRails: ["NICS", "SEPA", "SWIFT"],
  },
  Denmark: {
    currency: "DKK",
    regulator: "Finanstilsynet (Danish FSA)",
    regulatorUrl: "https://www.dfsa.dk",
    routingType: "IBAN (DK) & Registration Number",
    defaultRails: ["Straksclearing", "Intradagclearing", "SEPA"],
  },
  Finland: {
    currency: "EUR",
    regulator: "FIN-FSA (Finanssivalvonta) / ECB Register",
    regulatorUrl: "https://www.finanssivalvonta.fi",
    routingType: "IBAN (FI) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Belgium: {
    currency: "EUR",
    regulator: "National Bank of Belgium (NBB) / FSMA",
    regulatorUrl: "https://www.nbb.be",
    routingType: "IBAN (BE) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Austria: {
    currency: "EUR",
    regulator: "Austrian Financial Market Authority (FMA) / ECB",
    regulatorUrl: "https://www.fma.gv.at",
    routingType: "IBAN (AT) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Ireland: {
    currency: "EUR",
    regulator: "Central Bank of Ireland / ECB Register",
    regulatorUrl: "https://www.centralbank.ie",
    routingType: "IBAN (IE) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Portugal: {
    currency: "EUR",
    regulator: "Banco de Portugal / ECB Register",
    regulatorUrl: "https://www.bportugal.pt",
    routingType: "IBAN (PT) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  Greece: {
    currency: "EUR",
    regulator: "Bank of Greece / ECB Register",
    regulatorUrl: "https://www.bankofgreece.gr",
    routingType: "IBAN (GR) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "IRIS"],
  },
  Poland: {
    currency: "PLN",
    regulator: "Polish Financial Supervision Authority (KNF)",
    regulatorUrl: "https://www.knf.gov.pl",
    routingType: "NRB / IBAN (PL) & ELIXIR",
    defaultRails: ["ELIXIR", "Express ELIXIR", "SEPA"],
  },
  "Czech Republic": {
    currency: "CZK",
    regulator: "Czech National Bank (CNB)",
    regulatorUrl: "https://www.cnb.cz",
    routingType: "IBAN (CZ) & CERTIS Bank Code",
    defaultRails: ["CERTIS", "SEPA"],
  },
  Hungary: {
    currency: "HUF",
    regulator: "Magyar Nemzeti Bank (MNB)",
    regulatorUrl: "https://www.mnb.hu",
    routingType: "IBAN (HU) & GIRO Code",
    defaultRails: ["GIRO Instant", "VIBER", "SEPA"],
  },
  Romania: {
    currency: "RON",
    regulator: "National Bank of Romania (BNR)",
    regulatorUrl: "https://www.bnr.ro",
    routingType: "IBAN (RO) & TRANSFOND",
    defaultRails: ["TRANSFOND", "ReGIS", "SEPA"],
  },
  Estonia: {
    currency: "EUR",
    regulator: "Finantsinspektsioon (Estonian FSA) / ECB",
    regulatorUrl: "https://www.fi.ee",
    routingType: "IBAN (EE) & BIC/SWIFT",
    defaultRails: ["SEPA Credit Transfer", "SEPA Instant"],
  },
  China: {
    currency: "CNY",
    regulator: "People's Bank of China (PBOC) / NFRA",
    regulatorUrl: "http://www.pbc.gov.cn",
    routingType: "CNAPS Code (12-Digit) & SWIFT",
    defaultRails: ["CNAPS", "IBPS", "CIPS"],
  },
  "Hong Kong": {
    currency: "HKD",
    regulator: "Hong Kong Monetary Authority (HKMA Licensed Banks)",
    regulatorUrl: "https://www.hkma.gov.hk",
    routingType: "HK Clearing Code (3-Digit) & FPS",
    defaultRails: ["FPS (Faster Payment System)", "CHATS", "SWIFT"],
  },
  Japan: {
    currency: "JPY",
    regulator: "Financial Services Agency of Japan (JFSA)",
    regulatorUrl: "https://www.fsa.go.jp",
    routingType: "Zengin Bank Code (4-Digit) & Branch Code (3-Digit)",
    defaultRails: ["Zengin System", "BOJ-NET", "SWIFT"],
  },
  Singapore: {
    currency: "SGD",
    regulator: "Monetary Authority of Singapore (MAS Financial Directory)",
    regulatorUrl: "https://eservices.mas.gov.sg/fid",
    routingType: "FAST / PayNow Bank & Branch Code",
    defaultRails: ["FAST", "PayNow", "GIRO", "MEPS+"],
  },
  Malaysia: {
    currency: "MYR",
    regulator: "Bank Negara Malaysia (BNM Licensed Financial Institutions)",
    regulatorUrl: "https://www.bnm.gov.my",
    routingType: "DuitNow / IBG Routing Code",
    defaultRails: ["DuitNow", "IBG", "RENTAS"],
  },
  Indonesia: {
    currency: "IDR",
    regulator: "Otoritas Jasa Keuangan (OJK) & Bank Indonesia",
    regulatorUrl: "https://www.ojk.go.id",
    routingType: "BI-FAST / Kliring Bank Code (3-Digit)",
    defaultRails: ["BI-FAST", "SKNBI", "BI-RTGS"],
  },
  Thailand: {
    currency: "THB",
    regulator: "Bank of Thailand (BOT Supervised Financial Institutions)",
    regulatorUrl: "https://www.bot.or.th",
    routingType: "PromptPay / BAHTNET Bank Code",
    defaultRails: ["PromptPay", "ITMX", "BAHTNET"],
  },
  Philippines: {
    currency: "PHP",
    regulator: "Bangko Sentral ng Pilipinas (BSP Supervised Banks)",
    regulatorUrl: "https://www.bsp.gov.ph",
    routingType: "BRSTN (9-Digit) / InstaPay / PESONet",
    defaultRails: ["PESONet", "InstaPay", "PhilPaSS"],
  },
  Vietnam: {
    currency: "VND",
    regulator: "State Bank of Vietnam (SBV)",
    regulatorUrl: "https://www.sbv.gov.vn",
    routingType: "CITAD Code / NAPAS 247",
    defaultRails: ["NAPAS 247", "IBPS (CITAD)"],
  },
  "South Korea": {
    currency: "KRW",
    regulator: "Financial Services Commission (FSC) / FSS Korea",
    regulatorUrl: "https://www.fsc.go.kr",
    routingType: "KFTC Bank Code (3-Digit)",
    defaultRails: ["KFTC HOFINET", "BOK-Wire+"],
  },
  Taiwan: {
    currency: "TWD",
    regulator: "Financial Supervisory Commission (FSC) Taiwan",
    regulatorUrl: "https://www.fsc.gov.tw",
    routingType: "FISC Bank Code (3-Digit) & Branch Code (4-Digit)",
    defaultRails: ["FISC Interbank", "CIFS"],
  },
  Australia: {
    currency: "AUD",
    regulator: "Australian Prudential Regulation Authority (APRA ADI Register)",
    regulatorUrl: "https://www.apra.gov.au",
    routingType: "BSB Number (6-Digit) & Account Number",
    defaultRails: ["NPP (New Payments Platform) / Osko", "BECS", "RITS"],
  },
  "New Zealand": {
    currency: "NZD",
    regulator: "Reserve Bank of New Zealand (RBNZ Registered Banks)",
    regulatorUrl: "https://www.rbnz.govt.nz",
    routingType: "NZ Bank & Branch Prefix (6-Digit)",
    defaultRails: ["NZ Clearing System (SBI)", "ESAS"],
  },
  "Saudi Arabia": {
    currency: "SAR",
    regulator: "Saudi Central Bank (SAMA Licensed Banks)",
    regulatorUrl: "https://www.sama.gov.sa",
    routingType: "IBAN (24-Character SA) & SARIE",
    defaultRails: ["SARIE Instant", "SWIFT"],
  },
  "United Arab Emirates": {
    currency: "AED",
    regulator: "Central Bank of the UAE (CBUAE Licensed Institutions)",
    regulatorUrl: "https://www.centralbank.ae",
    routingType: "IBAN (23-Character AE) & UAEFTS",
    defaultRails: ["UAEFTS", "IPP (Aani)", "SWIFT"],
  },
  Qatar: {
    currency: "QAR",
    regulator: "Qatar Central Bank (QCB)",
    regulatorUrl: "https://www.qcb.gov.qa",
    routingType: "IBAN (29-Character QA) & Fawran",
    defaultRails: ["QATCH", "Fawran", "QPS"],
  },
  Kuwait: {
    currency: "KWD",
    regulator: "Central Bank of Kuwait (CBK)",
    regulatorUrl: "https://www.cbk.gov.kw",
    routingType: "IBAN (30-Character KW) & KASSIP",
    defaultRails: ["KASSIP", "Wamd", "SWIFT"],
  },
  Bahrain: {
    currency: "BHD",
    regulator: "Central Bank of Bahrain (CBB Register)",
    regulatorUrl: "https://www.cbb.gov.bh",
    routingType: "IBAN (22-Character BH) & Fawri+",
    defaultRails: ["EFTS (Fawri / Fawri+)", "BCTS"],
  },
  Oman: {
    currency: "OMR",
    regulator: "Central Bank of Oman (CBO)",
    regulatorUrl: "https://cbo.gov.om",
    routingType: "IBAN (23-Character OM) & ACH",
    defaultRails: ["Oman ACH", "RTGS"],
  },
  Jordan: {
    currency: "JOD",
    regulator: "Central Bank of Jordan (CBJ)",
    regulatorUrl: "https://www.cbj.gov.jo",
    routingType: "IBAN (30-Character JO) & CliQ",
    defaultRails: ["CliQ", "ACH Jordan", "RTGS-JO"],
  },
  Egypt: {
    currency: "EGP",
    regulator: "Central Bank of Egypt (CBE Registered Banks)",
    regulatorUrl: "https://www.cbe.org.eg",
    routingType: "IBAN (29-Character EG) & IPN (InstaPay)",
    defaultRails: ["EG-ACH", "IPN (InstaPay)", "RTGS"],
  },
  Turkey: {
    currency: "TRY",
    regulator: "Banking Regulation and Supervision Agency (BDDK Turkey)",
    regulatorUrl: "https://www.bddk.org.tr",
    routingType: "IBAN (26-Character TR) & FAST",
    defaultRails: ["EFT", "FAST", "SWIFT"],
  },
  Israel: {
    currency: "ILS",
    regulator: "Bank of Israel (Banking Supervision Department)",
    regulatorUrl: "https://www.boi.org.il",
    routingType: "IBAN (23-Character IL) & Masav",
    defaultRails: ["Masav", "Zahav (RTGS)"],
  },
  "South Africa": {
    currency: "ZAR",
    regulator: "South African Reserve Bank (SARB Prudential Authority)",
    regulatorUrl: "https://www.resbank.co.za",
    routingType: "Universal Branch Code (6-Digit)",
    defaultRails: ["BankservAfrica EFT", "PayShap", "SAMOS"],
  },
  Nigeria: {
    currency: "NGN",
    regulator: "Central Bank of Nigeria (CBN Licensed Banks)",
    regulatorUrl: "https://www.cbn.gov.ng",
    routingType: "NUBAN (10-Digit) & NIBSS Code",
    defaultRails: ["NIBSS Instant Payment (NIP)", "NEFT"],
  },
  Kenya: {
    currency: "KES",
    regulator: "Central Bank of Kenya (CBK Directory of Licensed Banks)",
    regulatorUrl: "https://www.centralbank.go.ke",
    routingType: "CBK Bank & Branch Code / PesaLink",
    defaultRails: ["KBA EFT", "PesaLink", "KEPSS"],
  },
  Morocco: {
    currency: "MAD",
    regulator: "Bank Al-Maghrib (Central Bank of Morocco)",
    regulatorUrl: "https://www.bkam.ma",
    routingType: "RIB (24-Digit Moroccan Bank Identity)",
    defaultRails: ["SIMT", "GSIMT Instant", "SRBM"],
  },
  Ghana: {
    currency: "GHS",
    regulator: "Bank of Ghana (Licensed Banks Register)",
    regulatorUrl: "https://www.bog.gov.gh",
    routingType: "GhIPSS Sort Code",
    defaultRails: ["GhIPSS Instant Pay (GIP)", "ACH Direct Credit"],
  },
  Uganda: {
    currency: "UGX",
    regulator: "Bank of Uganda (Supervised Financial Institutions)",
    regulatorUrl: "https://www.bou.or.ug",
    routingType: "BoU EFT Bank & Branch Code",
    defaultRails: ["UG-EFT", "UNISS (RTGS)"],
  },
  Tanzania: {
    currency: "TZS",
    regulator: "Bank of Tanzania (BoT Licensed Banks)",
    regulatorUrl: "https://www.bot.go.tz",
    routingType: "TACH / TIPS Bank Code",
    defaultRails: ["TACH", "TIPS", "TISS"],
  },
  Mauritius: {
    currency: "MUR",
    regulator: "Bank of Mauritius (Licensed Financial Institutions)",
    regulatorUrl: "https://www.bom.mu",
    routingType: "IBAN (30-Character MU) & MauCAS",
    defaultRails: ["MACSS", "MauCAS"],
  },
  Togo: {
    currency: "XOF",
    regulator: "BCEAO (Central Bank of West African States)",
    regulatorUrl: "https://www.bceao.int",
    routingType: "WAEMU RIB & SICA-UEMOA",
    defaultRails: ["SICA-UEMOA", "STAR-UEMOA"],
  },
  Brazil: {
    currency: "BRL",
    regulator: "Banco Central do Brasil (BCB Authorized Institutions)",
    regulatorUrl: "https://www.bcb.gov.br",
    routingType: "ISPB / COMPE Code (3-Digit) + Pix Key",
    defaultRails: ["Pix", "TED", "STR"],
  },
  Chile: {
    currency: "CLP",
    regulator: "Comisión para el Mercado Financiero (CMF Chile)",
    regulatorUrl: "https://www.cmfchile.cl",
    routingType: "SBIF Bank Code & RUT",
    defaultRails: ["TEF (CCA)", "LBTR"],
  },
  Colombia: {
    currency: "COP",
    regulator: "Superintendencia Financiera de Colombia (SFC)",
    regulatorUrl: "https://www.superfinanciera.gov.co",
    routingType: "ACH Colombia / Transfiya Code",
    defaultRails: ["ACH Colombia", "CENIT", "Transfiya"],
  },
  Peru: {
    currency: "PEN",
    regulator: "Superintendencia de Banca, Seguros y AFP (SBS Peru)",
    regulatorUrl: "https://www.sbs.gob.pe",
    routingType: "CCI (Código de Cuenta Interbancario - 20-Digit)",
    defaultRails: ["CCE Transferencias", "LBTR"],
  },
  Argentina: {
    currency: "ARS",
    regulator: "Banco Central de la República Argentina (BCRA)",
    regulatorUrl: "https://www.bcra.gob.ar",
    routingType: "CBU / CVU (22-Digit)",
    defaultRails: ["Transferencias 3.0", "COELSA", "MEP"],
  },
  Panama: {
    currency: "USD",
    regulator: "Superintendencia de Bancos de Panamá (SBP)",
    regulatorUrl: "https://www.superbancos.gob.pa",
    routingType: "ACH Panama / SWIFT",
    defaultRails: ["ACH Directo", "SWIFT"],
  },
};

// ============================================================================
// SECTION B: BANGLADESH BANKS — ALL 59 SCHEDULED BANKS (PROMPT LIST 1-55 + 4)
// ============================================================================
const BANGLADESH_BANKS_SEED: RawSeedEntry[] = [
  { name: "AB Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://abbl.com", aliases: ["AB Bank PLC", "Arab Bangladesh Bank"], payoutEligible: true },
  { name: "Agrani Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://www.agranibank.org", aliases: ["Agrani Bank PLC"], payoutEligible: true },
  { name: "Al-Arafah Islami Bank", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.al-arafahbank.com", aliases: ["Al-Arafah Islami Bank PLC", "AIBL"], payoutEligible: true },
  { name: "Bangladesh Commerce Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://bcblbd.com", aliases: ["Bangladesh Commerce Bank Limited", "BCBL"], payoutEligible: true },
  { name: "Bangladesh Development Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://www.bdbl.com.bd", aliases: ["Bangladesh Development Bank PLC", "BDBL"], payoutEligible: true },
  { name: "Bangladesh Krishi Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://www.krishibank.org.bd", aliases: ["BKB"], payoutEligible: true },
  { name: "Bank Al-Falah Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.bankalfalah.com/bd", aliases: ["Bank Alfalah Limited Bangladesh"], payoutEligible: true },
  { name: "Bank Asia", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.bankasia-bd.com", aliases: ["Bank Asia PLC"], payoutEligible: true },
  { name: "Bengal Commercial Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://bgcb.com.bd", aliases: ["Bengal Commercial Bank PLC"], payoutEligible: true },
  { name: "BASIC Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://www.basicbanklimited.com", aliases: ["BASIC Bank Limited"], payoutEligible: true },
  { name: "BRAC Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.bracbank.com", aliases: ["BRAC Bank PLC"], payoutEligible: true },
  { name: "Citizens Bank PLC", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.citizensbankbd.com", aliases: ["Citizens Bank Bangladesh"], payoutEligible: true },
  { name: "City Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.thecitybank.com", aliases: ["The City Bank PLC", "City Bank PLC"], payoutEligible: true },
  { name: "Commercial Bank of Ceylon Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.combank.net.bd", aliases: ["CBC Bangladesh"], payoutEligible: true },
  { name: "Community Bank Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.communitybankbd.com", aliases: ["Community Bank Bangladesh PLC"], payoutEligible: true },
  { name: "Dhaka Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://dhakabankltd.com", aliases: ["Dhaka Bank PLC"], payoutEligible: true },
  { name: "Dutch-Bangla Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.dutchbanglabank.com", aliases: ["Dutch-Bangla Bank PLC", "DBBL"], payoutEligible: true },
  { name: "Eastern Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.ebl.com.bd", aliases: ["Eastern Bank PLC", "EBL"], payoutEligible: true },
  { name: "EXIM Bank Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.eximbankbd.com", aliases: ["Export Import Bank of Bangladesh PLC"], payoutEligible: true },
  { name: "First Security Islami Bank", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://fsiblbd.com", aliases: ["First Security Islami Bank PLC", "FSIB"], payoutEligible: true },
  { name: "Global Islami Bank", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.globalislamibankbd.com", aliases: ["Global Islami Bank PLC", "NRB Global Bank"], payoutEligible: true },
  { name: "Habib Bank Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.hbl.com/bangladesh", aliases: ["HBL Bangladesh"], payoutEligible: true },
  { name: "HSBC Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.hsbc.com.bd", aliases: ["The Hongkong and Shanghai Banking Corporation Bangladesh"], currencies: ["BDT", "USD", "GBP", "EUR"], payoutEligible: true },
  { name: "ICB Islamic Bank", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.icbislamic-bd.com", aliases: ["ICB Islamic Bank Limited"], payoutEligible: true },
  { name: "IFIC Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.ificbank.com.bd", aliases: ["IFIC Bank PLC", "International Finance Investment and Commerce Bank"], payoutEligible: true },
  { name: "Islami Bank Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.islamibankbd.com", aliases: ["Islami Bank Bangladesh PLC", "IBBL"], payoutEligible: true },
  { name: "Jamuna Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://jamunabankbd.com", aliases: ["Jamuna Bank PLC"], payoutEligible: true },
  { name: "Janata Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://www.jb.com.bd", aliases: ["Janata Bank PLC"], payoutEligible: true },
  { name: "Meghna Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.meghnabank.com.bd", aliases: ["Meghna Bank PLC"], payoutEligible: true },
  { name: "Mercantile Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.mblbd.com", aliases: ["Mercantile Bank PLC"], payoutEligible: true },
  { name: "Midland Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.midlandbankbd.net", aliases: ["Midland Bank PLC"], payoutEligible: true },
  { name: "Modhumoti Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.modhumotibank.net", aliases: ["Modhumoti Bank PLC"], payoutEligible: true },
  { name: "Mutual Trust Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.mutualtrustbank.com", aliases: ["Mutual Trust Bank PLC", "MTB"], payoutEligible: true },
  { name: "National Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.nblbd.com", aliases: ["National Bank Limited Bangladesh", "NBL"], payoutEligible: true },
  { name: "National Bank of Pakistan Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.nbp.com.bd", aliases: ["NBP Bangladesh Operations"], payoutEligible: false },
  { name: "NCC Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.nccbank.com.bd", aliases: ["National Credit and Commerce Bank PLC"], payoutEligible: true },
  { name: "NRB Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.nrbbankbd.com", aliases: ["NRB Bank PLC"], payoutEligible: true },
  { name: "NRBC Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.nrbcommercialbank.com", aliases: ["NRB Commercial Bank PLC"], payoutEligible: true },
  { name: "One Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.onebank.com.bd", aliases: ["ONE Bank PLC"], payoutEligible: true },
  { name: "Padma Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.padmabankbd.com", aliases: ["Padma Bank PLC", "The Farmers Bank"], payoutEligible: false },
  { name: "Prime Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.primebank.com.bd", aliases: ["Prime Bank PLC"], payoutEligible: true },
  { name: "Probashi Kallyan Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://pkb.gov.bd", aliases: ["PKB Bangladesh"], payoutEligible: true },
  { name: "Pubali Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.pubalibangla.com", aliases: ["Pubali Bank PLC"], payoutEligible: true },
  { name: "Rajshahi Krishi Unnayan Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://www.rakub.org.bd", aliases: ["RAKUB"], payoutEligible: true },
  { name: "Rupali Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://rupalibank.com.bd", aliases: ["Rupali Bank PLC"], payoutEligible: true },
  { name: "SBAC Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.sbacbank.com", aliases: ["South Bangla Agriculture and Commerce Bank PLC"], payoutEligible: true },
  { name: "Shahjalal Islami Bank", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.sjiblbd.com", aliases: ["Shahjalal Islami Bank PLC", "SJIBL"], payoutEligible: true },
  { name: "Shimanto Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.shimantobank.com", aliases: ["Shimanto Bank PLC"], payoutEligible: true },
  { name: "Social Islami Bank", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.siblbd.com", aliases: ["Social Islami Bank PLC", "SIBL"], payoutEligible: true },
  { name: "Sonali Bank", country: "Bangladesh", region: "Bangladesh", category: "State-Owned / Development Bank", website: "https://www.sonalibank.com.bd", aliases: ["Sonali Bank PLC"], payoutEligible: true },
  { name: "Southeast Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.southeastbank.com.bd", aliases: ["Southeast Bank PLC"], payoutEligible: true },
  { name: "Standard Bank", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.standardbankbd.com", aliases: ["Standard Bank PLC"], payoutEligible: true },
  { name: "Standard Chartered Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.sc.com/bd", aliases: ["Standard Chartered Bank Bangladesh"], currencies: ["BDT", "USD", "GBP", "EUR"], payoutEligible: true },
  { name: "State Bank of India Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://bd.statebank", aliases: ["SBI Bangladesh Operations"], payoutEligible: true },
  { name: "Trust Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.tblbd.com", aliases: ["Trust Bank PLC"], payoutEligible: true },
  { name: "Union Bank", country: "Bangladesh", region: "Bangladesh", category: "Islamic Bank", website: "https://www.unionbank.com.bd", aliases: ["Union Bank PLC Bangladesh"], payoutEligible: true },
  { name: "United Commercial Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.ucb.com.bd", aliases: ["United Commercial Bank PLC", "UCB"], payoutEligible: true },
  { name: "Uttara Bank", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.uttarabank-bd.com", aliases: ["Uttara Bank PLC"], payoutEligible: true },
  { name: "Woori Bank Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://go.wooribank.com/bd", aliases: ["Woori Bank Dhaka Branch"], payoutEligible: true },
  { name: "Citibank N.A. Bangladesh", country: "Bangladesh", region: "Bangladesh", category: "Commercial Bank", website: "https://www.citigroup.com/global/about-us/global-presence/bangladesh", aliases: ["Citi Bangladesh"], currencies: ["BDT", "USD"], payoutEligible: true },
  { name: "Bangladesh Bank", country: "Bangladesh", region: "Bangladesh", category: "Central Bank / Regulator", website: "https://www.bb.org.bd", aliases: ["Central Bank of Bangladesh"], payoutEligible: false, regulatoryStatus: "Central Bank / Regulator — Non-Payout" },
];

// ============================================================================
// SECTION C.1: NORTH AMERICA (US, CANADA, MEXICO) — 72 INSTITUTIONS
// ============================================================================
const NORTH_AMERICA_BANKS_SEED: RawSeedEntry[] = [
  { name: "JPMorgan Chase Bank", country: "United States", region: "North America", website: "https://www.chase.com", aliases: ["Chase Bank", "JPMorgan Chase & Co."], payoutEligible: true },
  { name: "Bank of America", country: "United States", region: "North America", website: "https://www.bankofamerica.com", aliases: ["BofA", "Bank of America N.A."], payoutEligible: true },
  { name: "Citibank", country: "United States", region: "North America", website: "https://www.citi.com", aliases: ["Citibank N.A.", "Citigroup"], countries: ["United States", "United Kingdom", "Singapore", "Hong Kong"], payoutEligible: true },
  { name: "Wells Fargo Bank", country: "United States", region: "North America", website: "https://www.wellsfargo.com", aliases: ["Wells Fargo Bank N.A."], payoutEligible: true },
  { name: "U.S. Bank", country: "United States", region: "North America", website: "https://www.usbank.com", aliases: ["U.S. Bancorp", "US Bank N.A."], payoutEligible: true },
  { name: "PNC Bank", country: "United States", region: "North America", website: "https://www.pnc.com", aliases: ["PNC Financial Services"], payoutEligible: true },
  { name: "Truist Bank", country: "United States", region: "North America", website: "https://www.truist.com", aliases: ["BB&T / SunTrust"], payoutEligible: true },
  { name: "Goldman Sachs Bank USA", country: "United States", region: "North America", website: "https://www.goldmansachs.com", aliases: ["Marcus by Goldman Sachs"], payoutEligible: true },
  { name: "Morgan Stanley Private Bank", country: "United States", region: "North America", website: "https://www.morganstanley.com", payoutEligible: true },
  { name: "Capital One", country: "United States", region: "North America", website: "https://www.capitalone.com", aliases: ["Capital One N.A."], payoutEligible: true },
  { name: "TD Bank", country: "United States", region: "North America", website: "https://www.td.com/us", aliases: ["TD Bank N.A."], payoutEligible: true },
  { name: "Bank of New York Mellon", country: "United States", region: "North America", website: "https://www.bnymellon.com", aliases: ["BNY Mellon", "BNY"], payoutEligible: true },
  { name: "State Street Bank and Trust", country: "United States", region: "North America", website: "https://www.statestreet.com", payoutEligible: false },
  { name: "Citizens Bank (US)", country: "United States", region: "North America", website: "https://www.citizensbank.com", aliases: ["Citizens Financial Group"], payoutEligible: true },
  { name: "Fifth Third Bank", country: "United States", region: "North America", website: "https://www.53.com", payoutEligible: true },
  { name: "KeyBank", country: "United States", region: "North America", website: "https://www.key.com", aliases: ["KeyCorp"], payoutEligible: true },
  { name: "Huntington National Bank", country: "United States", region: "North America", website: "https://www.huntington.com", payoutEligible: true },
  { name: "Regions Bank", country: "United States", region: "North America", website: "https://www.regions.com", payoutEligible: true },
  { name: "M&T Bank", country: "United States", region: "North America", website: "https://www.mtb.com", payoutEligible: true },
  { name: "Ally Bank", country: "United States", region: "North America", category: "Digital / Neobank", website: "https://www.ally.com", payoutEligible: true },
  { name: "American Express National Bank", country: "United States", region: "North America", website: "https://www.americanexpress.com", aliases: ["Amex Bank"], payoutEligible: true },
  { name: "Charles Schwab Bank", country: "United States", region: "North America", website: "https://www.schwab.com", payoutEligible: true },
  { name: "Discover Bank", country: "United States", region: "North America", website: "https://www.discover.com", payoutEligible: true },
  { name: "Synchrony Bank", country: "United States", region: "North America", website: "https://www.synchronybank.com", payoutEligible: false },
  { name: "BMO Bank", country: "United States", region: "North America", website: "https://www.bmo.com/en-us", aliases: ["BMO Harris Bank"], payoutEligible: true },
  { name: "First Citizens Bank", country: "United States", region: "North America", website: "https://www.firstcitizens.com", payoutEligible: true },
  { name: "Comerica Bank", country: "United States", region: "North America", website: "https://www.comerica.com", payoutEligible: true },
  { name: "Zions Bancorporation", country: "United States", region: "North America", website: "https://www.zionsbancorporation.com", aliases: ["Zions Bank"], payoutEligible: true },
  { name: "Webster Bank", country: "United States", region: "North America", website: "https://www.websterbank.com", payoutEligible: true },
  { name: "East West Bank", country: "United States", region: "North America", website: "https://www.eastwestbank.com", payoutEligible: true },
  { name: "Popular Bank", country: "United States", region: "North America", website: "https://www.popularbank.com", aliases: ["Banco Popular North America"], payoutEligible: true },
  { name: "Frost Bank", country: "United States", region: "North America", website: "https://www.frostbank.com", aliases: ["Cullen/Frost Bankers"], payoutEligible: true },
  { name: "Synovus Bank", country: "United States", region: "North America", website: "https://www.synovus.com", payoutEligible: true },
  { name: "Valley National Bank", country: "United States", region: "North America", website: "https://www.valley.com", payoutEligible: true },
  { name: "Wintrust Bank", country: "United States", region: "North America", website: "https://www.wintrust.com", payoutEligible: true },
  { name: "Old National Bank", country: "United States", region: "North America", website: "https://www.oldnational.com", payoutEligible: true },
  { name: "BOK Financial", country: "United States", region: "North America", website: "https://www.bokfinancial.com", payoutEligible: true },
  { name: "Pinnacle Bank", country: "United States", region: "North America", website: "https://www.pnfp.com", aliases: ["Pinnacle Financial Partners"], payoutEligible: true },
  { name: "FNB Corporation", country: "United States", region: "North America", website: "https://www.fnb-online.com", aliases: ["First National Bank PA"], payoutEligible: true },
  { name: "SouthState Bank", country: "United States", region: "North America", website: "https://www.southstatebank.com", payoutEligible: true },
  { name: "Prosperity Bank", country: "United States", region: "North America", website: "https://www.prosperitybankusa.com", payoutEligible: true },
  { name: "Hancock Whitney Bank", country: "United States", region: "North America", website: "https://www.hancockwhitney.com", payoutEligible: true },
  { name: "Commerce Bank", country: "United States", region: "North America", website: "https://www.commercebank.com", aliases: ["Commerce Bancshares"], payoutEligible: true },
  { name: "Umpqua Bank", country: "United States", region: "North America", website: "https://www.umpquabank.com", aliases: ["Columbia Banking System"], payoutEligible: true },
  { name: "First Horizon Bank", country: "United States", region: "North America", website: "https://www.firsthorizon.com", payoutEligible: true },
  { name: "Western Alliance Bank", country: "United States", region: "North America", website: "https://www.westernalliancebancorporation.com", payoutEligible: true },
  { name: "Texas Capital Bank", country: "United States", region: "North America", website: "https://www.texascapitalbank.com", payoutEligible: true },
  { name: "Glacier Bank", country: "United States", region: "North America", website: "https://www.glacierbank.com", aliases: ["Glacier Bancorp"], payoutEligible: true },
  { name: "United Bank (West Virginia)", country: "United States", region: "North America", website: "https://www.bankwithunited.com", aliases: ["United Bankshares"], payoutEligible: true },
  { name: "Arvest Bank", country: "United States", region: "North America", website: "https://www.arvest.com", payoutEligible: true },
  { name: "First Hawaiian Bank", country: "United States", region: "North America", website: "https://www.fhb.com", payoutEligible: true },
  { name: "Bank of Hawaii", country: "United States", region: "North America", website: "https://www.boh.com", payoutEligible: true },
  { name: "Associated Bank", country: "United States", region: "North America", website: "https://www.associatedbank.com", aliases: ["Associated Banc-Corp"], payoutEligible: true },
  { name: "Cathay Bank", country: "United States", region: "North America", website: "https://www.cathaybank.com", payoutEligible: true },
  { name: "Flagstar Bank", country: "United States", region: "North America", website: "https://www.flagstar.com", aliases: ["New York Community Bancorp"], payoutEligible: true },
  { name: "SoFi Bank", country: "United States", region: "North America", category: "Digital / Neobank", website: "https://www.sofi.com", aliases: ["SoFi Bank N.A."], payoutEligible: true },
  { name: "Northern Trust Company", country: "United States", region: "North America", website: "https://www.northerntrust.com", payoutEligible: true },
  { name: "Navy Federal Credit Union", country: "United States", region: "North America", category: "Regional / Cooperative Bank", website: "https://www.navyfederal.org", payoutEligible: true },
  // Canada
  { name: "Royal Bank of Canada", country: "Canada", region: "North America", website: "https://www.rbcroyalbank.com", aliases: ["RBC"], payoutEligible: true },
  { name: "Toronto-Dominion Bank", country: "Canada", region: "North America", website: "https://www.td.com/ca", aliases: ["TD Canada Trust"], payoutEligible: true },
  { name: "Bank of Nova Scotia", country: "Canada", region: "North America", website: "https://www.scotiabank.com", aliases: ["Scotiabank"], payoutEligible: true },
  { name: "Bank of Montreal", country: "Canada", region: "North America", website: "https://www.bmo.com", aliases: ["BMO Financial Group"], payoutEligible: true },
  { name: "Canadian Imperial Bank of Commerce", country: "Canada", region: "North America", website: "https://www.cibc.com", aliases: ["CIBC"], payoutEligible: true },
  { name: "National Bank of Canada", country: "Canada", region: "North America", website: "https://www.nbc.ca", aliases: ["Banque Nationale du Canada"], payoutEligible: true },
  { name: "Desjardins Group", country: "Canada", region: "North America", category: "Regional / Cooperative Bank", website: "https://www.desjardins.com", aliases: ["Caisses Desjardins"], payoutEligible: true },
  { name: "Laurentian Bank of Canada", country: "Canada", region: "North America", website: "https://www.laurentianbank.ca", payoutEligible: true },
  { name: "EQ Bank (Equitable Bank)", country: "Canada", region: "North America", category: "Digital / Neobank", website: "https://www.eqbank.ca", payoutEligible: true },
  { name: "Tangerine Bank", country: "Canada", region: "North America", category: "Digital / Neobank", website: "https://www.tangerine.ca", payoutEligible: true },
  // Mexico
  { name: "BBVA México", country: "Mexico", region: "North America", website: "https://www.bbva.mx", aliases: ["BBVA Bancomer"], payoutEligible: true },
  { name: "Banorte", country: "Mexico", region: "North America", website: "https://www.banorte.com", aliases: ["Grupo Financiero Banorte"], payoutEligible: true },
  { name: "Banco Santander México", country: "Mexico", region: "North America", website: "https://www.santander.com.mx", payoutEligible: true },
  { name: "Citibanamex", country: "Mexico", region: "North America", website: "https://www.banamex.com", aliases: ["Banco Nacional de México"], payoutEligible: true },
  { name: "Banco Azteca", country: "Mexico", region: "North America", website: "https://www.bancoazteca.com.mx", payoutEligible: true },
  { name: "Banco Inbursa", country: "Mexico", region: "North America", website: "https://www.inbursa.com", payoutEligible: true },
];

// ============================================================================
// SECTION C.2: UNITED KINGDOM AND EUROPE — 82 INSTITUTIONS
// ============================================================================
const UK_EUROPE_BANKS_SEED: RawSeedEntry[] = [
  { name: "HSBC UK Bank", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.hsbc.co.uk", aliases: ["HSBC Holdings plc"], payoutEligible: true },
  { name: "Barclays Bank", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.barclays.co.uk", aliases: ["Barclays UK"], payoutEligible: true },
  { name: "Lloyds Bank", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.lloydsbank.com", aliases: ["Lloyds Banking Group"], payoutEligible: true },
  { name: "NatWest", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.natwest.com", aliases: ["National Westminster Bank"], payoutEligible: true },
  { name: "Royal Bank of Scotland", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.rbs.co.uk", aliases: ["RBS"], payoutEligible: true },
  { name: "Standard Chartered", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.sc.com", aliases: ["Standard Chartered PLC"], countries: ["United Kingdom", "Singapore", "Hong Kong", "United Arab Emirates"], payoutEligible: true },
  { name: "Santander UK", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.santander.co.uk", payoutEligible: true },
  { name: "Nationwide Building Society", country: "United Kingdom", region: "United Kingdom & Europe", category: "Regional / Cooperative Bank", website: "https://www.nationwide.co.uk", payoutEligible: true },
  { name: "Virgin Money UK", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://uk.virginmoney.com", payoutEligible: true },
  { name: "TSB Bank", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.tsb.co.uk", payoutEligible: true },
  { name: "Metro Bank", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.metrobankonline.co.uk", payoutEligible: true },
  { name: "Monzo Bank", country: "United Kingdom", region: "United Kingdom & Europe", category: "Digital / Neobank", website: "https://monzo.com", payoutEligible: true },
  { name: "Starling Bank", country: "United Kingdom", region: "United Kingdom & Europe", category: "Digital / Neobank", website: "https://www.starlingbank.com", payoutEligible: true },
  { name: "Revolut", country: "United Kingdom", region: "United Kingdom & Europe", category: "Digital / Neobank", website: "https://www.revolut.com", aliases: ["Revolut Bank UAB"], countries: ["United Kingdom", "Lithuania", "Ireland"], payoutEligible: true },
  { name: "Co-operative Bank (UK)", country: "United Kingdom", region: "United Kingdom & Europe", website: "https://www.co-operativebank.co.uk", aliases: ["The Co-operative Bank"], payoutEligible: true },
  { name: "OakNorth Bank", country: "United Kingdom", region: "United Kingdom & Europe", category: "Digital / Neobank", website: "https://www.oaknorth.co.uk", payoutEligible: true },
  // Continental Europe
  { name: "Deutsche Bank", country: "Germany", region: "United Kingdom & Europe", website: "https://www.db.com", payoutEligible: true },
  { name: "Commerzbank", country: "Germany", region: "United Kingdom & Europe", website: "https://www.commerzbank.de", payoutEligible: true },
  { name: "DZ Bank", country: "Germany", region: "United Kingdom & Europe", category: "Regional / Cooperative Bank", website: "https://www.dzbank.de", payoutEligible: true },
  { name: "KfW", country: "Germany", region: "United Kingdom & Europe", category: "State-Owned / Development Bank", website: "https://www.kfw.de", aliases: ["KfW Bankengruppe"], payoutEligible: false },
  { name: "Landesbank Baden-Württemberg", country: "Germany", region: "United Kingdom & Europe", website: "https://www.lbbw.de", aliases: ["LBBW"], payoutEligible: true },
  { name: "Bayerische Landesbank", country: "Germany", region: "United Kingdom & Europe", website: "https://www.bayernlb.de", aliases: ["BayernLB"], payoutEligible: true },
  { name: "Norddeutsche Landesbank", country: "Germany", region: "United Kingdom & Europe", website: "https://www.nordlb.de", aliases: ["NORD/LB"], payoutEligible: true },
  { name: "Helaba", country: "Germany", region: "United Kingdom & Europe", website: "https://www.helaba.com", aliases: ["Landesbank Hessen-Thüringen"], payoutEligible: true },
  { name: "N26 Bank", country: "Germany", region: "United Kingdom & Europe", category: "Digital / Neobank", website: "https://n26.com", payoutEligible: true },
  { name: "BNP Paribas", country: "France", region: "United Kingdom & Europe", website: "https://group.bnpparibas", payoutEligible: true },
  { name: "Société Générale", country: "France", region: "United Kingdom & Europe", website: "https://www.societegenerale.com", payoutEligible: true },
  { name: "Crédit Agricole", country: "France", region: "United Kingdom & Europe", website: "https://www.credit-agricole.com", payoutEligible: true },
  { name: "Groupe BPCE", country: "France", region: "United Kingdom & Europe", website: "https://www.groupebpce.com", aliases: ["Banque Populaire / Caisse d'Epargne"], payoutEligible: true },
  { name: "Crédit Mutuel", country: "France", region: "United Kingdom & Europe", website: "https://www.creditmutuel.fr", payoutEligible: true },
  { name: "La Banque Postale", country: "France", region: "United Kingdom & Europe", website: "https://www.labanquepostale.fr", payoutEligible: true },
  { name: "ING Bank", country: "Netherlands", region: "United Kingdom & Europe", website: "https://www.ing.com", aliases: ["ING Groep"], payoutEligible: true },
  { name: "Rabobank", country: "Netherlands", region: "United Kingdom & Europe", category: "Regional / Cooperative Bank", website: "https://www.rabobank.com", payoutEligible: true },
  { name: "ABN AMRO", country: "Netherlands", region: "United Kingdom & Europe", website: "https://www.abnamro.com", payoutEligible: true },
  { name: "De Volksbank (ASN / SNS Bank)", country: "Netherlands", region: "United Kingdom & Europe", website: "https://www.devolksbank.nl", payoutEligible: true },
  { name: "bunq", country: "Netherlands", region: "United Kingdom & Europe", category: "Digital / Neobank", website: "https://www.bunq.com", payoutEligible: true },
  { name: "UBS", country: "Switzerland", region: "United Kingdom & Europe", website: "https://www.ubs.com", aliases: ["UBS Group AG"], payoutEligible: true },
  { name: "Julius Baer", country: "Switzerland", region: "United Kingdom & Europe", website: "https://www.juliusbaer.com", payoutEligible: true },
  { name: "Zürcher Kantonalbank", country: "Switzerland", region: "United Kingdom & Europe", website: "https://www.zkb.ch", aliases: ["ZKB"], payoutEligible: true },
  { name: "Raiffeisen Switzerland", country: "Switzerland", region: "United Kingdom & Europe", category: "Regional / Cooperative Bank", website: "https://www.raiffeisen.ch", payoutEligible: true },
  { name: "PostFinance", country: "Switzerland", region: "United Kingdom & Europe", website: "https://www.postfinance.ch", payoutEligible: true },
  { name: "Banco Santander", country: "Spain", region: "United Kingdom & Europe", website: "https://www.santander.com", payoutEligible: true },
  { name: "BBVA", country: "Spain", region: "United Kingdom & Europe", website: "https://www.bbva.com", aliases: ["Banco Bilbao Vizcaya Argentaria"], payoutEligible: true },
  { name: "CaixaBank", country: "Spain", region: "United Kingdom & Europe", website: "https://www.caixabank.com", payoutEligible: true },
  { name: "Banco Sabadell", country: "Spain", region: "United Kingdom & Europe", website: "https://www.bancsabadell.com", payoutEligible: true },
  { name: "Bankinter", country: "Spain", region: "United Kingdom & Europe", website: "https://www.bankinter.com", payoutEligible: true },
  { name: "Abanca", country: "Spain", region: "United Kingdom & Europe", website: "https://www.abanca.com", payoutEligible: true },
  { name: "UniCredit", country: "Italy", region: "United Kingdom & Europe", website: "https://www.unicreditgroup.eu", payoutEligible: true },
  { name: "Intesa Sanpaolo", country: "Italy", region: "United Kingdom & Europe", website: "https://group.intesasanpaolo.com", payoutEligible: true },
  { name: "Banco BPM", country: "Italy", region: "United Kingdom & Europe", website: "https://www.bancobpm.it", payoutEligible: true },
  { name: "Banca Monte dei Paschi di Siena", country: "Italy", region: "United Kingdom & Europe", website: "https://www.mps.it", aliases: ["MPS"], payoutEligible: true },
  { name: "BPER Banca", country: "Italy", region: "United Kingdom & Europe", website: "https://www.bper.it", payoutEligible: true },
  { name: "Mediobanca", country: "Italy", region: "United Kingdom & Europe", website: "https://www.mediobanca.com", payoutEligible: true },
  { name: "Nordea Bank", country: "Finland", region: "United Kingdom & Europe", website: "https://www.nordea.com", countries: ["Finland", "Sweden", "Norway", "Denmark"], payoutEligible: true },
  { name: "OP Financial Group", country: "Finland", region: "United Kingdom & Europe", website: "https://www.op.fi", payoutEligible: true },
  { name: "SEB", country: "Sweden", region: "United Kingdom & Europe", website: "https://sebgroup.com", aliases: ["Skandinaviska Enskilda Banken"], payoutEligible: true },
  { name: "Swedbank", country: "Sweden", region: "United Kingdom & Europe", website: "https://www.swedbank.com", payoutEligible: true },
  { name: "Svenska Handelsbanken", country: "Sweden", region: "United Kingdom & Europe", website: "https://www.handelsbanken.com", aliases: ["Handelsbanken"], payoutEligible: true },
  { name: "DNB Bank", country: "Norway", region: "United Kingdom & Europe", website: "https://www.dnb.no", aliases: ["Den Norske Bank"], payoutEligible: true },
  { name: "SpareBank 1 SR-Bank", country: "Norway", region: "United Kingdom & Europe", website: "https://www.sparebank1.no", payoutEligible: true },
  { name: "Danske Bank", country: "Denmark", region: "United Kingdom & Europe", website: "https://danskebank.com", payoutEligible: true },
  { name: "Jyske Bank", country: "Denmark", region: "United Kingdom & Europe", website: "https://www.jyskebank.dk", payoutEligible: true },
  { name: "Nykredit Bank", country: "Denmark", region: "United Kingdom & Europe", website: "https://www.nykredit.dk", payoutEligible: true },
  { name: "KBC Bank", country: "Belgium", region: "United Kingdom & Europe", website: "https://www.kbc.com", aliases: ["KBC Group"], payoutEligible: true },
  { name: "Belfius Bank", country: "Belgium", region: "United Kingdom & Europe", website: "https://www.belfius.be", payoutEligible: true },
  { name: "Erste Group Bank", country: "Austria", region: "United Kingdom & Europe", website: "https://www.erstegroup.com", payoutEligible: true },
  { name: "Raiffeisen Bank International", country: "Austria", region: "United Kingdom & Europe", website: "https://www.rbinternational.com", aliases: ["RBI Austria"], payoutEligible: true },
  { name: "BAWAG P.S.K.", country: "Austria", region: "United Kingdom & Europe", website: "https://www.bawaggroup.com", payoutEligible: true },
  { name: "Allied Irish Banks", country: "Ireland", region: "United Kingdom & Europe", website: "https://aib.ie", aliases: ["AIB"], payoutEligible: true },
  { name: "Bank of Ireland", country: "Ireland", region: "United Kingdom & Europe", website: "https://www.bankofireland.com", payoutEligible: true },
  { name: "Permanent TSB", country: "Ireland", region: "United Kingdom & Europe", website: "https://www.permanenttsb.ie", payoutEligible: true },
  { name: "Millennium bcp", country: "Portugal", region: "United Kingdom & Europe", website: "https://ind.millenniumbcp.pt", aliases: ["Banco Comercial Português"], payoutEligible: true },
  { name: "Novo Banco", country: "Portugal", region: "United Kingdom & Europe", website: "https://www.novobanco.pt", payoutEligible: true },
  { name: "Caixa Geral de Depósitos", country: "Portugal", region: "United Kingdom & Europe", category: "State-Owned / Development Bank", website: "https://www.cgd.pt", payoutEligible: true },
  { name: "National Bank of Greece", country: "Greece", region: "United Kingdom & Europe", website: "https://www.nbg.gr", payoutEligible: true },
  { name: "Eurobank Ergasias", country: "Greece", region: "United Kingdom & Europe", website: "https://www.eurobank.gr", payoutEligible: true },
  { name: "Alpha Bank", country: "Greece", region: "United Kingdom & Europe", website: "https://www.alpha.gr", payoutEligible: true },
  { name: "Piraeus Bank", country: "Greece", region: "United Kingdom & Europe", website: "https://www.piraeusholdings.gr", payoutEligible: true },
  { name: "PKO Bank Polski", country: "Poland", region: "United Kingdom & Europe", website: "https://www.pkobp.pl", payoutEligible: true },
  { name: "Bank Pekao", country: "Poland", region: "United Kingdom & Europe", website: "https://www.pekao.com.pl", payoutEligible: true },
  { name: "mBank", country: "Poland", region: "United Kingdom & Europe", website: "https://www.mbank.pl", payoutEligible: true },
  { name: "Česká spořitelna", country: "Czech Republic", region: "United Kingdom & Europe", website: "https://www.csas.cz", payoutEligible: true },
  { name: "ČSOB (Československá obchodní banka)", country: "Czech Republic", region: "United Kingdom & Europe", website: "https://www.csob.cz", payoutEligible: true },
  { name: "Komerční banka", country: "Czech Republic", region: "United Kingdom & Europe", website: "https://www.kb.cz", payoutEligible: true },
  { name: "OTP Bank", country: "Hungary", region: "United Kingdom & Europe", website: "https://www.otpbank.hu", payoutEligible: true },
  { name: "Banca Transilvania", country: "Romania", region: "United Kingdom & Europe", website: "https://www.bancatransilvania.ro", payoutEligible: true },
  { name: "CEC Bank", country: "Romania", region: "United Kingdom & Europe", category: "State-Owned / Development Bank", website: "https://www.cec.ro", payoutEligible: true },
  { name: "LHV Pank", country: "Estonia", region: "United Kingdom & Europe", website: "https://www.lhv.ee", payoutEligible: true },
];

// ============================================================================
// SECTION C.3: INDIA & SOUTH ASIA (INDIA, PAKISTAN, NEPAL, SRI LANKA) — 84 INSTITUTIONS
// ============================================================================
const SOUTH_ASIA_BANKS_SEED: RawSeedEntry[] = [
  // India (38 Banks)
  { name: "State Bank of India", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://sbi.co.in", aliases: ["SBI"], payoutEligible: true },
  { name: "HDFC Bank", country: "India", region: "South Asia", website: "https://www.hdfcbank.com", payoutEligible: true },
  { name: "ICICI Bank", country: "India", region: "South Asia", website: "https://www.icicibank.com", payoutEligible: true },
  { name: "Axis Bank", country: "India", region: "South Asia", website: "https://www.axisbank.com", payoutEligible: true },
  { name: "Kotak Mahindra Bank", country: "India", region: "South Asia", website: "https://www.kotak.com", payoutEligible: true },
  { name: "Punjab National Bank", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.pnbindia.in", aliases: ["PNB"], payoutEligible: true },
  { name: "Bank of Baroda", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.bankofbaroda.in", aliases: ["BoB"], payoutEligible: true },
  { name: "Canara Bank", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://canarabank.com", payoutEligible: true },
  { name: "Union Bank of India", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.unionbankofindia.co.in", payoutEligible: true },
  { name: "IndusInd Bank", country: "India", region: "South Asia", website: "https://www.indusind.com", payoutEligible: true },
  { name: "Yes Bank", country: "India", region: "South Asia", website: "https://www.yesbank.in", payoutEligible: true },
  { name: "IDFC First Bank", country: "India", region: "South Asia", website: "https://www.idfcfirstbank.com", payoutEligible: true },
  { name: "Federal Bank", country: "India", region: "South Asia", website: "https://www.federalbank.co.in", payoutEligible: true },
  { name: "Indian Bank", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.indianbank.in", payoutEligible: true },
  { name: "Bank of India", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://bankofindia.co.in", aliases: ["BOI"], payoutEligible: true },
  { name: "Central Bank of India", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.centralbankofindia.co.in", payoutEligible: true },
  { name: "Indian Overseas Bank", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.iob.in", aliases: ["IOB"], payoutEligible: true },
  { name: "UCO Bank", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.ucobank.com", payoutEligible: true },
  { name: "Bank of Maharashtra", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://bankofmaharashtra.in", payoutEligible: true },
  { name: "Punjab & Sind Bank", country: "India", region: "South Asia", category: "State-Owned / Development Bank", website: "https://punjabandsindbank.co.in", payoutEligible: true },
  { name: "IDBI Bank", country: "India", region: "South Asia", website: "https://www.idbibank.in", payoutEligible: true },
  { name: "Bandhan Bank", country: "India", region: "South Asia", website: "https://bandhanbank.com", payoutEligible: true },
  { name: "RBL Bank", country: "India", region: "South Asia", website: "https://www.rblbank.com", payoutEligible: true },
  { name: "South Indian Bank", country: "India", region: "South Asia", website: "https://www.southindianbank.com", payoutEligible: true },
  { name: "Karur Vysya Bank", country: "India", region: "South Asia", website: "https://www.kvb.co.in", aliases: ["KVB"], payoutEligible: true },
  { name: "City Union Bank", country: "India", region: "South Asia", website: "https://www.cityunionbank.com", aliases: ["CUB"], payoutEligible: true },
  { name: "Tamilnad Mercantile Bank", country: "India", region: "South Asia", website: "https://www.tmb.in", aliases: ["TMB"], payoutEligible: true },
  { name: "Karnataka Bank", country: "India", region: "South Asia", website: "https://karnatakabank.com", payoutEligible: true },
  { name: "Jammu & Kashmir Bank", country: "India", region: "South Asia", website: "https://www.jkbank.com", aliases: ["J&K Bank"], payoutEligible: true },
  { name: "DCB Bank", country: "India", region: "South Asia", website: "https://www.dcbbank.com", payoutEligible: true },
  { name: "CSB Bank", country: "India", region: "South Asia", website: "https://www.csb.co.in", aliases: ["Catholic Syrian Bank"], payoutEligible: true },
  { name: "Dhanlaxmi Bank", country: "India", region: "South Asia", website: "https://www.dhanbank.com", payoutEligible: true },
  { name: "AU Small Finance Bank", country: "India", region: "South Asia", website: "https://www.aubank.in", payoutEligible: true },
  { name: "Equitas Small Finance Bank", country: "India", region: "South Asia", website: "https://www.equitasbank.com", payoutEligible: true },
  { name: "Ujjivan Small Finance Bank", country: "India", region: "South Asia", website: "https://www.ujjivansfb.in", payoutEligible: true },
  { name: "Jana Small Finance Bank", country: "India", region: "South Asia", website: "https://www.janabank.com", payoutEligible: true },
  { name: "Saraswat Co-operative Bank", country: "India", region: "South Asia", category: "Regional / Cooperative Bank", website: "https://www.saraswatbank.com", payoutEligible: true },
  { name: "Reserve Bank of India", country: "India", region: "South Asia", category: "Central Bank / Regulator", website: "https://www.rbi.org.in", payoutEligible: false, regulatoryStatus: "Central Bank / Regulator — Non-Payout" },

  // Pakistan (18 Banks)
  { name: "Habib Bank Limited", country: "Pakistan", region: "South Asia", website: "https://www.hbl.com", aliases: ["HBL Pakistan"], payoutEligible: true },
  { name: "United Bank Limited", country: "Pakistan", region: "South Asia", website: "https://www.ubldigital.com", aliases: ["UBL Pakistan"], payoutEligible: true },
  { name: "MCB Bank", country: "Pakistan", region: "South Asia", website: "https://www.mcb.com.pk", aliases: ["Muslim Commercial Bank"], payoutEligible: true },
  { name: "Allied Bank Limited", country: "Pakistan", region: "South Asia", website: "https://www.abl.com", aliases: ["ABL Pakistan"], payoutEligible: true },
  { name: "National Bank of Pakistan", country: "Pakistan", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.nbp.com.pk", aliases: ["NBP"], payoutEligible: true },
  { name: "Meezan Bank", country: "Pakistan", region: "South Asia", category: "Islamic Bank", website: "https://www.meezanbank.com", payoutEligible: true },
  { name: "Bank Alfalah", country: "Pakistan", region: "South Asia", website: "https://www.bankalfalah.com", payoutEligible: true },
  { name: "Bank AL Habib", country: "Pakistan", region: "South Asia", website: "https://www.bankalhabib.com", payoutEligible: true },
  { name: "Askari Bank", country: "Pakistan", region: "South Asia", website: "https://askaribank.com", payoutEligible: true },
  { name: "Faysal Bank", country: "Pakistan", region: "South Asia", category: "Islamic Bank", website: "https://www.faysalbank.com", payoutEligible: true },
  { name: "Standard Chartered Pakistan", country: "Pakistan", region: "South Asia", website: "https://www.sc.com/pk", payoutEligible: true },
  { name: "Habib Metropolitan Bank", country: "Pakistan", region: "South Asia", website: "https://www.habibmetro.com", aliases: ["HabibMetro"], payoutEligible: true },
  { name: "JS Bank", country: "Pakistan", region: "South Asia", website: "https://jsbl.com", payoutEligible: true },
  { name: "Soneri Bank", country: "Pakistan", region: "South Asia", website: "https://www.soneribank.com", payoutEligible: true },
  { name: "Bank of Punjab", country: "Pakistan", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.bop.com.pk", aliases: ["BOP Pakistan"], payoutEligible: true },
  { name: "Bank of Khyber", country: "Pakistan", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.bok.com.pk", aliases: ["BOK Pakistan"], payoutEligible: true },
  { name: "Dubai Islamic Bank Pakistan", country: "Pakistan", region: "South Asia", category: "Islamic Bank", website: "https://www.dibpak.com", payoutEligible: true },
  { name: "BankIslami Pakistan", country: "Pakistan", region: "South Asia", category: "Islamic Bank", website: "https://bankislami.com.pk", payoutEligible: true },
  { name: "State Bank of Pakistan", country: "Pakistan", region: "South Asia", category: "Central Bank / Regulator", website: "https://www.sbp.org.pk", payoutEligible: false, regulatoryStatus: "Central Bank / Regulator — Non-Payout" },

  // Nepal (15 Banks)
  { name: "Nabil Bank", country: "Nepal", region: "South Asia", website: "https://www.nabilbank.com", payoutEligible: true },
  { name: "Global IME Bank", country: "Nepal", region: "South Asia", website: "https://www.globalimebank.com", payoutEligible: true },
  { name: "NIC Asia Bank", country: "Nepal", region: "South Asia", website: "https://www.nicasiabank.com", payoutEligible: true },
  { name: "Nepal Investment Mega Bank", country: "Nepal", region: "South Asia", website: "https://www.nimb.com.np", aliases: ["NIMB Nepal"], payoutEligible: true },
  { name: "Standard Chartered Nepal", country: "Nepal", region: "South Asia", website: "https://www.sc.com/np", payoutEligible: true },
  { name: "Himalayan Bank", country: "Nepal", region: "South Asia", website: "https://www.himalayanbank.com", payoutEligible: true },
  { name: "Everest Bank", country: "Nepal", region: "South Asia", website: "https://everestbankltd.com", payoutEligible: true },
  { name: "Rastriya Banijya Bank", country: "Nepal", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.rbb.com.np", payoutEligible: true },
  { name: "Nepal Bank Limited", country: "Nepal", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.nepalbank.com.np", payoutEligible: true },
  { name: "Agricultural Development Bank Nepal", country: "Nepal", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.adbl.gov.np", aliases: ["ADBL Nepal"], payoutEligible: true },
  { name: "Sanima Bank", country: "Nepal", region: "South Asia", website: "https://www.sanimabank.com", payoutEligible: true },
  { name: "Siddhartha Bank", country: "Nepal", region: "South Asia", website: "https://www.siddharthabank.com", payoutEligible: true },
  { name: "Kumari Bank", country: "Nepal", region: "South Asia", website: "https://www.kumaribank.com", payoutEligible: true },
  { name: "Laxmi Sunrise Bank", country: "Nepal", region: "South Asia", website: "https://www.laxmisunrise.com", payoutEligible: true },
  { name: "National Bank of Nepal", country: "Nepal", region: "South Asia", category: "Central Bank / Regulator", website: "https://www.nrb.org.np", aliases: ["Nepal Rastra Bank"], payoutEligible: false, regulatoryStatus: "Central Bank / Regulator — Non-Payout" },

  // Sri Lanka (12 Banks)
  { name: "Bank of Ceylon", country: "Sri Lanka", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.boc.lk", aliases: ["BOC Sri Lanka"], payoutEligible: true },
  { name: "People's Bank Sri Lanka", country: "Sri Lanka", region: "South Asia", category: "State-Owned / Development Bank", website: "https://www.peoplesbank.lk", payoutEligible: true },
  { name: "Commercial Bank of Ceylon", country: "Sri Lanka", region: "South Asia", website: "https://www.combank.lk", payoutEligible: true },
  { name: "Hatton National Bank", country: "Sri Lanka", region: "South Asia", website: "https://www.hnb.net", aliases: ["HNB Sri Lanka"], payoutEligible: true },
  { name: "Sampath Bank", country: "Sri Lanka", region: "South Asia", website: "https://www.sampath.lk", payoutEligible: true },
  { name: "Seylan Bank", country: "Sri Lanka", region: "South Asia", website: "https://www.seylan.lk", payoutEligible: true },
  { name: "National Development Bank Sri Lanka", country: "Sri Lanka", region: "South Asia", website: "https://www.ndbbank.com", aliases: ["NDB Bank"], payoutEligible: true },
  { name: "DFCC Bank", country: "Sri Lanka", region: "South Asia", website: "https://www.dfcc.lk", payoutEligible: true },
  { name: "Nations Trust Bank", country: "Sri Lanka", region: "South Asia", website: "https://www.nationstrust.com", aliases: ["NTB Sri Lanka"], payoutEligible: true },
  { name: "Pan Asia Banking Corporation", country: "Sri Lanka", region: "South Asia", website: "https://www.pabcbank.com", aliases: ["Pan Asia Bank"], payoutEligible: true },
  { name: "Union Bank of Colombo", country: "Sri Lanka", region: "South Asia", website: "https://www.unionb.com", payoutEligible: true },
  { name: "Amana Bank Sri Lanka", country: "Sri Lanka", region: "South Asia", category: "Islamic Bank", website: "https://www.amanabank.lk", payoutEligible: true },
];

// ============================================================================
// SECTION C.4: ASIA-PACIFIC & OCEANIA — 100 INSTITUTIONS
// ============================================================================
const APAC_OCEANIA_BANKS_SEED: RawSeedEntry[] = [
  // China (21 Banks)
  { name: "Industrial and Commercial Bank of China", country: "China", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.icbc.com.cn", aliases: ["ICBC"], payoutEligible: true },
  { name: "China Construction Bank", country: "China", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.ccb.com", aliases: ["CCB"], payoutEligible: true },
  { name: "Agricultural Bank of China", country: "China", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.abchina.com", aliases: ["ABC China"], payoutEligible: true },
  { name: "Bank of China", country: "China", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.boc.cn", aliases: ["BOC China"], payoutEligible: true },
  { name: "Bank of Communications", country: "China", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.bankcomm.com", aliases: ["BoCom"], payoutEligible: true },
  { name: "Postal Savings Bank of China", country: "China", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.psbc.com", aliases: ["PSBC"], payoutEligible: true },
  { name: "China Merchants Bank", country: "China", region: "Asia-Pacific", website: "https://www.cmbchina.com", aliases: ["CMB"], payoutEligible: true },
  { name: "Shanghai Pudong Development Bank", country: "China", region: "Asia-Pacific", website: "https://www.spdb.com.cn", aliases: ["SPDB"], payoutEligible: true },
  { name: "Industrial Bank (China)", country: "China", region: "Asia-Pacific", website: "https://www.cib.com.cn", aliases: ["CIB China"], payoutEligible: true },
  { name: "China CITIC Bank", country: "China", region: "Asia-Pacific", website: "https://www.citicbank.com", payoutEligible: true },
  { name: "China Minsheng Bank", country: "China", region: "Asia-Pacific", website: "https://www.cmbc.com.cn", aliases: ["CMBC"], payoutEligible: true },
  { name: "China Everbright Bank", country: "China", region: "Asia-Pacific", website: "https://www.cebbank.com", aliases: ["CEB"], payoutEligible: true },
  { name: "Ping An Bank", country: "China", region: "Asia-Pacific", website: "https://bank.pingan.com", payoutEligible: true },
  { name: "Hua Xia Bank", country: "China", region: "Asia-Pacific", website: "https://www.hxb.com.cn", payoutEligible: true },
  { name: "Bank of Beijing", country: "China", region: "Asia-Pacific", website: "https://www.bankofbeijing.com.cn", payoutEligible: true },
  { name: "Bank of Shanghai", country: "China", region: "Asia-Pacific", website: "https://www.bosc.cn", payoutEligible: true },
  { name: "Bank of Jiangsu", country: "China", region: "Asia-Pacific", website: "https://www.jsbchina.cn", payoutEligible: true },
  { name: "Bank of Ningbo", country: "China", region: "Asia-Pacific", website: "https://www.nbcb.com.cn", payoutEligible: true },
  { name: "China Zheshang Bank", country: "China", region: "Asia-Pacific", website: "https://www.czbank.com", aliases: ["CZBank"], payoutEligible: true },
  { name: "China Bohai Bank", country: "China", region: "Asia-Pacific", website: "https://www.cbhb.com.cn", payoutEligible: true },
  { name: "WeBank", country: "China", region: "Asia-Pacific", category: "Digital / Neobank", website: "https://www.webank.com", payoutEligible: true },

  // Hong Kong (6 Banks)
  { name: "Bank of China (Hong Kong)", country: "Hong Kong", region: "Asia-Pacific", website: "https://www.bochk.com", aliases: ["BOCHK"], payoutEligible: true },
  { name: "Hang Seng Bank", country: "Hong Kong", region: "Asia-Pacific", website: "https://www.hangseng.com", payoutEligible: true },
  { name: "Bank of East Asia", country: "Hong Kong", region: "Asia-Pacific", website: "https://www.hkbea.com", aliases: ["BEA"], payoutEligible: true },
  { name: "DBS Bank (Hong Kong)", country: "Hong Kong", region: "Asia-Pacific", website: "https://www.dbs.com.hk", payoutEligible: true },
  { name: "Standard Chartered Hong Kong", country: "Hong Kong", region: "Asia-Pacific", website: "https://www.sc.com/hk", payoutEligible: true },
  { name: "ZA Bank", country: "Hong Kong", region: "Asia-Pacific", category: "Digital / Neobank", website: "https://bank.za.group", payoutEligible: true },

  // Japan (13 Banks)
  { name: "Mitsubishi UFJ Financial Group (MUFG Bank)", country: "Japan", region: "Asia-Pacific", website: "https://www.bk.mufg.jp", aliases: ["MUFG Bank"], payoutEligible: true },
  { name: "Sumitomo Mitsui Banking Corporation", country: "Japan", region: "Asia-Pacific", website: "https://www.smbc.co.jp", aliases: ["SMBC"], payoutEligible: true },
  { name: "Mizuho Bank", country: "Japan", region: "Asia-Pacific", website: "https://www.mizuhobank.com", payoutEligible: true },
  { name: "Japan Post Bank", country: "Japan", region: "Asia-Pacific", website: "https://www.jp-bank.japanpost.jp", aliases: ["Yucho Bank"], payoutEligible: true },
  { name: "Resona Bank", country: "Japan", region: "Asia-Pacific", website: "https://www.resonabank.co.jp", payoutEligible: true },
  { name: "Norinchukin Bank", country: "Japan", region: "Asia-Pacific", category: "Regional / Cooperative Bank", website: "https://www.nochubank.or.jp", payoutEligible: true },
  { name: "Sumitomo Mitsui Trust Bank", country: "Japan", region: "Asia-Pacific", website: "https://www.smtb.jp", payoutEligible: true },
  { name: "Shinsei Bank (SBI Shinsei Bank)", country: "Japan", region: "Asia-Pacific", website: "https://www.sbishinseibank.co.jp", aliases: ["SBI Shinsei Bank"], payoutEligible: true },
  { name: "Aozora Bank", country: "Japan", region: "Asia-Pacific", website: "https://www.aozorabank.co.jp", payoutEligible: true },
  { name: "Rakuten Bank", country: "Japan", region: "Asia-Pacific", category: "Digital / Neobank", website: "https://www.rakuten-bank.co.jp", payoutEligible: true },
  { name: "PayPay Bank", country: "Japan", region: "Asia-Pacific", category: "Digital / Neobank", website: "https://www.paypay-bank.co.jp", payoutEligible: true },
  { name: "Bank of Yokohama", country: "Japan", region: "Asia-Pacific", website: "https://www.boy.co.jp", payoutEligible: true },
  { name: "Chiba Bank", country: "Japan", region: "Asia-Pacific", website: "https://www.chibabank.co.jp", payoutEligible: true },

  // Singapore (4 Banks)
  { name: "DBS Bank", country: "Singapore", region: "Asia-Pacific", website: "https://www.dbs.com", aliases: ["Development Bank of Singapore", "POSB"], payoutEligible: true },
  { name: "OCBC Bank", country: "Singapore", region: "Asia-Pacific", website: "https://www.ocbc.com", aliases: ["Oversea-Chinese Banking Corporation"], payoutEligible: true },
  { name: "United Overseas Bank", country: "Singapore", region: "Asia-Pacific", website: "https://www.uobgroup.com", aliases: ["UOB"], payoutEligible: true },
  { name: "Bank of Singapore", country: "Singapore", region: "Asia-Pacific", website: "https://www.bankofsingapore.com", payoutEligible: false },

  // Malaysia (8 Banks)
  { name: "Maybank", country: "Malaysia", region: "Asia-Pacific", website: "https://www.maybank.com", aliases: ["Malayan Banking Berhad"], payoutEligible: true },
  { name: "CIMB Bank", country: "Malaysia", region: "Asia-Pacific", website: "https://www.cimb.com", payoutEligible: true },
  { name: "Public Bank", country: "Malaysia", region: "Asia-Pacific", website: "https://www.pbebank.com", aliases: ["Public Bank Berhad"], payoutEligible: true },
  { name: "RHB Bank", country: "Malaysia", region: "Asia-Pacific", website: "https://www.rhbgroup.com", payoutEligible: true },
  { name: "Hong Leong Bank", country: "Malaysia", region: "Asia-Pacific", website: "https://www.hlb.com.my", payoutEligible: true },
  { name: "AmBank", country: "Malaysia", region: "Asia-Pacific", website: "https://www.ambank.com.my", payoutEligible: true },
  { name: "Bank Islam Malaysia", country: "Malaysia", region: "Asia-Pacific", category: "Islamic Bank", website: "https://www.bankislam.com", payoutEligible: true },
  { name: "Alliance Bank Malaysia", country: "Malaysia", region: "Asia-Pacific", website: "https://www.alliancebank.com.my", payoutEligible: true },

  // Indonesia (7 Banks)
  { name: "Bank Mandiri", country: "Indonesia", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.bankmandiri.co.id", payoutEligible: true },
  { name: "Bank Rakyat Indonesia", country: "Indonesia", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://bri.co.id", aliases: ["BRI"], payoutEligible: true },
  { name: "Bank Central Asia", country: "Indonesia", region: "Asia-Pacific", website: "https://www.bca.co.id", aliases: ["BCA"], payoutEligible: true },
  { name: "Bank Negara Indonesia", country: "Indonesia", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.bni.co.id", aliases: ["BNI"], payoutEligible: true },
  { name: "Bank Syariah Indonesia", country: "Indonesia", region: "Asia-Pacific", category: "Islamic Bank", website: "https://www.bankbsi.co.id", aliases: ["BSI"], payoutEligible: true },
  { name: "Bank CIMB Niaga", country: "Indonesia", region: "Asia-Pacific", website: "https://www.cimbniaga.co.id", payoutEligible: true },
  { name: "Bank Danamon", country: "Indonesia", region: "Asia-Pacific", website: "https://www.danamon.co.id", payoutEligible: true },

  // Thailand (6 Banks)
  { name: "Bangkok Bank", country: "Thailand", region: "Asia-Pacific", website: "https://www.bangkokbank.com", payoutEligible: true },
  { name: "Kasikornbank", country: "Thailand", region: "Asia-Pacific", website: "https://www.kasikornbank.com", aliases: ["KBank"], payoutEligible: true },
  { name: "Siam Commercial Bank", country: "Thailand", region: "Asia-Pacific", website: "https://www.scb.co.th", aliases: ["SCB Thailand"], payoutEligible: true },
  { name: "Krungthai Bank", country: "Thailand", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://krungthai.com", aliases: ["KTB"], payoutEligible: true },
  { name: "Bank of Ayudhya", country: "Thailand", region: "Asia-Pacific", website: "https://www.krungsri.com", aliases: ["Krungsri"], payoutEligible: true },
  { name: "TMBThanachart Bank", country: "Thailand", region: "Asia-Pacific", website: "https://www.ttbbank.com", aliases: ["ttb"], payoutEligible: true },

  // Philippines (7 Banks)
  { name: "BDO Unibank", country: "Philippines", region: "Asia-Pacific", website: "https://www.bdo.com.ph", aliases: ["Banco de Oro"], payoutEligible: true },
  { name: "Bank of the Philippine Islands", country: "Philippines", region: "Asia-Pacific", website: "https://www.bpi.com.ph", aliases: ["BPI"], payoutEligible: true },
  { name: "Metropolitan Bank and Trust Company", country: "Philippines", region: "Asia-Pacific", website: "https://www.metrobank.com.ph", aliases: ["Metrobank"], payoutEligible: true },
  { name: "Land Bank of the Philippines", country: "Philippines", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.landbank.com", aliases: ["LBP"], payoutEligible: true },
  { name: "Philippine National Bank", country: "Philippines", region: "Asia-Pacific", website: "https://www.pnb.com.ph", aliases: ["PNB Philippines"], payoutEligible: true },
  { name: "Security Bank Philippines", country: "Philippines", region: "Asia-Pacific", website: "https://www.securitybank.com", payoutEligible: true },
  { name: "UnionBank of the Philippines", country: "Philippines", region: "Asia-Pacific", website: "https://www.unionbankph.com", payoutEligible: true },

  // Vietnam (7 Banks)
  { name: "Vietcombank", country: "Vietnam", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.vietcombank.com.vn", payoutEligible: true },
  { name: "VietinBank", country: "Vietnam", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.vietinbank.vn", payoutEligible: true },
  { name: "BIDV", country: "Vietnam", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://bidv.com.vn", aliases: ["Bank for Investment and Development of Vietnam"], payoutEligible: true },
  { name: "Techcombank", country: "Vietnam", region: "Asia-Pacific", website: "https://techcombank.com", payoutEligible: true },
  { name: "Agribank Vietnam", country: "Vietnam", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.agribank.com.vn", payoutEligible: true },
  { name: "VPBank", country: "Vietnam", region: "Asia-Pacific", website: "https://www.vpbank.com.vn", payoutEligible: true },
  { name: "Military Commercial Joint Stock Bank (MB Bank)", country: "Vietnam", region: "Asia-Pacific", website: "https://www.mbbank.com.vn", payoutEligible: true },

  // South Korea (7 Banks)
  { name: "KB Kookmin Bank", country: "South Korea", region: "Asia-Pacific", website: "https://www.kbstar.com", payoutEligible: true },
  { name: "Shinhan Bank", country: "South Korea", region: "Asia-Pacific", website: "https://www.shinhan.com", payoutEligible: true },
  { name: "Hana Bank", country: "South Korea", region: "Asia-Pacific", website: "https://www.kebhana.com", aliases: ["KEB Hana Bank"], payoutEligible: true },
  { name: "Woori Bank", country: "South Korea", region: "Asia-Pacific", website: "https://www.wooribank.com", payoutEligible: true },
  { name: "NH NongHyup Bank", country: "South Korea", region: "Asia-Pacific", category: "Regional / Cooperative Bank", website: "https://banking.nonghyup.com", payoutEligible: true },
  { name: "Industrial Bank of Korea", country: "South Korea", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.ibk.co.kr", aliases: ["IBK Korea"], payoutEligible: true },
  { name: "KakaoBank", country: "South Korea", region: "Asia-Pacific", category: "Digital / Neobank", website: "https://www.kakaobank.com", payoutEligible: true },

  // Taiwan (5 Banks)
  { name: "Bank of Taiwan", country: "Taiwan", region: "Asia-Pacific", category: "State-Owned / Development Bank", website: "https://www.bot.com.tw", payoutEligible: true },
  { name: "CTBC Bank", country: "Taiwan", region: "Asia-Pacific", website: "https://www.ctbcbank.com", aliases: ["Chinatrust Commercial Bank"], payoutEligible: true },
  { name: "Cathay United Bank", country: "Taiwan", region: "Asia-Pacific", website: "https://www.cathaybk.com.tw", payoutEligible: true },
  { name: "Mega International Commercial Bank", country: "Taiwan", region: "Asia-Pacific", website: "https://www.megabank.com.tw", payoutEligible: true },
  { name: "E.SUN Commercial Bank", country: "Taiwan", region: "Asia-Pacific", website: "https://www.esunbank.com", payoutEligible: true },

  // Oceania — Australia & New Zealand (9 Banks)
  { name: "Commonwealth Bank of Australia", country: "Australia", region: "Oceania", website: "https://www.commbank.com.au", aliases: ["CommBank", "CBA"], payoutEligible: true },
  { name: "Westpac Banking Corporation", country: "Australia", region: "Oceania", website: "https://www.westpac.com.au", aliases: ["Westpac"], payoutEligible: true },
  { name: "Australia and New Zealand Banking Group", country: "Australia", region: "Oceania", website: "https://www.anz.com.au", aliases: ["ANZ Bank"], countries: ["Australia", "New Zealand"], payoutEligible: true },
  { name: "National Australia Bank", country: "Australia", region: "Oceania", website: "https://www.nab.com.au", aliases: ["NAB"], payoutEligible: true },
  { name: "Macquarie Bank", country: "Australia", region: "Oceania", website: "https://www.macquarie.com.au", payoutEligible: true },
  { name: "Bendigo and Adelaide Bank", country: "Australia", region: "Oceania", website: "https://www.bendigobank.com.au", aliases: ["Bendigo Bank"], payoutEligible: true },
  { name: "Bank of Queensland", country: "Australia", region: "Oceania", website: "https://www.boq.com.au", aliases: ["BOQ"], payoutEligible: true },
  { name: "ASB Bank", country: "New Zealand", region: "Oceania", website: "https://www.asb.co.nz", payoutEligible: true },
  { name: "Bank of New Zealand", country: "New Zealand", region: "Oceania", website: "https://www.bnz.co.nz", aliases: ["BNZ"], payoutEligible: true },
  { name: "Kiwibank", country: "New Zealand", region: "Oceania", category: "State-Owned / Development Bank", website: "https://www.kiwibank.co.nz", payoutEligible: true },
];

// ============================================================================
// SECTION C.5: MIDDLE EAST — 48 INSTITUTIONS
// ============================================================================
const MIDDLE_EAST_BANKS_SEED: RawSeedEntry[] = [
  { name: "Qatar National Bank", country: "Qatar", region: "Middle East", website: "https://www.qnb.com", aliases: ["QNB"], payoutEligible: true },
  { name: "First Abu Dhabi Bank", country: "United Arab Emirates", region: "Middle East", website: "https://www.bankfab.com", aliases: ["FAB"], payoutEligible: true },
  { name: "Emirates NBD", country: "United Arab Emirates", region: "Middle East", website: "https://www.emiratesnbd.com", payoutEligible: true },
  { name: "Abu Dhabi Commercial Bank", country: "United Arab Emirates", region: "Middle East", website: "https://www.adcb.com", aliases: ["ADCB"], payoutEligible: true },
  { name: "Dubai Islamic Bank", country: "United Arab Emirates", region: "Middle East", category: "Islamic Bank", website: "https://www.dib.ae", aliases: ["DIB"], payoutEligible: true },
  { name: "Mashreq Bank", country: "United Arab Emirates", region: "Middle East", website: "https://www.mashreq.com", payoutEligible: true },
  { name: "Abu Dhabi Islamic Bank", country: "United Arab Emirates", region: "Middle East", category: "Islamic Bank", website: "https://www.adib.ae", aliases: ["ADIB"], payoutEligible: true },
  { name: "RAKBANK", country: "United Arab Emirates", region: "Middle East", website: "https://www.rakbank.ae", aliases: ["National Bank of Ras Al-Khaimah"], payoutEligible: true },
  { name: "Commercial Bank of Dubai", country: "United Arab Emirates", region: "Middle East", website: "https://www.cbd.ae", aliases: ["CBD"], payoutEligible: true },
  { name: "Sharjah Islamic Bank", country: "United Arab Emirates", region: "Middle East", category: "Islamic Bank", website: "https://www.sib.ae", payoutEligible: true },
  { name: "Saudi National Bank", country: "Saudi Arabia", region: "Middle East", website: "https://www.alahli.com", aliases: ["SNB", "AlAhli"], payoutEligible: true },
  { name: "Al Rajhi Bank", country: "Saudi Arabia", region: "Middle East", category: "Islamic Bank", website: "https://www.alrajhibank.com.sa", payoutEligible: true },
  { name: "Riyad Bank", country: "Saudi Arabia", region: "Middle East", website: "https://www.riyadbank.com", payoutEligible: true },
  { name: "Saudi Awwal Bank", country: "Saudi Arabia", region: "Middle East", website: "https://www.sab.com", aliases: ["SAB", "SABB"], payoutEligible: true },
  { name: "Banque Saudi Fransi", country: "Saudi Arabia", region: "Middle East", website: "https://www.alfransi.com.sa", aliases: ["BSF"], payoutEligible: true },
  { name: "Arab National Bank", country: "Saudi Arabia", region: "Middle East", website: "https://www.anb.com.sa", aliases: ["ANB"], payoutEligible: true },
  { name: "Alinma Bank", country: "Saudi Arabia", region: "Middle East", category: "Islamic Bank", website: "https://www.alinma.com", payoutEligible: true },
  { name: "Bank Albilad", country: "Saudi Arabia", region: "Middle East", category: "Islamic Bank", website: "https://www.bankalbilad.com", payoutEligible: true },
  { name: "Bank AlJazira", country: "Saudi Arabia", region: "Middle East", category: "Islamic Bank", website: "https://www.bankaljazira.com", payoutEligible: true },
  { name: "Saudi Investment Bank", country: "Saudi Arabia", region: "Middle East", website: "https://www.saib.com.sa", aliases: ["SAIB"], payoutEligible: true },
  { name: "Kuwait Finance House", country: "Kuwait", region: "Middle East", category: "Islamic Bank", website: "https://www.kfh.com", aliases: ["KFH"], payoutEligible: true },
  { name: "National Bank of Kuwait", country: "Kuwait", region: "Middle East", website: "https://www.nbk.com", aliases: ["NBK"], payoutEligible: true },
  { name: "Gulf Bank Kuwait", country: "Kuwait", region: "Middle East", website: "https://www.e-gulfbank.com", payoutEligible: true },
  { name: "Burgan Bank", country: "Kuwait", region: "Middle East", website: "https://www.burgan.com", payoutEligible: true },
  { name: "Boubyan Bank", country: "Kuwait", region: "Middle East", category: "Islamic Bank", website: "https://boubyan.bankboubyan.com", payoutEligible: true },
  { name: "Qatar Islamic Bank", country: "Qatar", region: "Middle East", category: "Islamic Bank", website: "https://www.qib.com.qa", aliases: ["QIB"], payoutEligible: true },
  { name: "Commercial Bank of Qatar", country: "Qatar", region: "Middle East", website: "https://www.cbq.qa", aliases: ["CBQ"], payoutEligible: true },
  { name: "Doha Bank", country: "Qatar", region: "Middle East", website: "https://qa.dohabank.com", payoutEligible: true },
  { name: "Masraf Al Rayan", country: "Qatar", region: "Middle East", category: "Islamic Bank", website: "https://www.alrayan.com", payoutEligible: true },
  { name: "Bank Muscat", country: "Oman", region: "Middle East", website: "https://www.bankmuscat.com", payoutEligible: true },
  { name: "National Bank of Oman", country: "Oman", region: "Middle East", website: "https://www.nbo.om", aliases: ["NBO"], payoutEligible: true },
  { name: "Bank Dhofar", country: "Oman", region: "Middle East", website: "https://www.bankdhofar.com", payoutEligible: true },
  { name: "Ahli United Bank", country: "Bahrain", region: "Middle East", website: "https://www.ahliunited.com", aliases: ["AUB Bahrain"], payoutEligible: true },
  { name: "National Bank of Bahrain", country: "Bahrain", region: "Middle East", website: "https://www.nbbonline.com", aliases: ["NBB"], payoutEligible: true },
  { name: "Bank of Bahrain and Kuwait", country: "Bahrain", region: "Middle East", website: "https://www.bbkonline.com", aliases: ["BBK"], payoutEligible: true },
  { name: "Arab Banking Corporation (Bank ABC)", country: "Bahrain", region: "Middle East", website: "https://www.bank-abc.com", aliases: ["Bank ABC"], payoutEligible: true },
  { name: "Arab Bank", country: "Jordan", region: "Middle East", website: "https://www.arabbank.com", payoutEligible: true },
  { name: "Housing Bank for Trade and Finance", country: "Jordan", region: "Middle East", website: "https://www.hbtf.com", aliases: ["HBTF Jordan"], payoutEligible: true },
  { name: "Cairo Amman Bank", country: "Jordan", region: "Middle East", website: "https://www.cab.jo", payoutEligible: true },
  { name: "Bank of Jordan", country: "Jordan", region: "Middle East", website: "https://www.bankofjordan.com", payoutEligible: true },
  { name: "National Bank of Egypt", country: "Egypt", region: "Middle East", category: "State-Owned / Development Bank", website: "https://www.nbe.com.eg", aliases: ["NBE"], payoutEligible: true },
  { name: "Banque Misr", country: "Egypt", region: "Middle East", category: "State-Owned / Development Bank", website: "https://www.banquemisr.com", payoutEligible: true },
  { name: "Commercial International Bank Egypt", country: "Egypt", region: "Middle East", website: "https://www.cibeg.com", aliases: ["CIB Egypt"], payoutEligible: true },
  { name: "QNB Alahli Egypt", country: "Egypt", region: "Middle East", website: "https://www.qnbalahli.com", payoutEligible: true },
  { name: "Bank Hapoalim", country: "Israel", region: "Middle East", website: "https://www.bankhapoalim.co.il", payoutEligible: true },
  { name: "Bank Leumi", country: "Israel", region: "Middle East", website: "https://www.leumi.co.il", payoutEligible: true },
  { name: "Mizrahi Tefahot Bank", country: "Israel", region: "Middle East", website: "https://www.mizrahi-tefahot.co.il", payoutEligible: true },
  { name: "Israel Discount Bank", country: "Israel", region: "Middle East", website: "https://www.discountbank.co.il", payoutEligible: true },
  { name: "Ziraat Bankası", country: "Turkey", region: "Middle East", category: "State-Owned / Development Bank", website: "https://www.ziraatbank.com.tr", payoutEligible: true },
  { name: "Türkiye İş Bankası", country: "Turkey", region: "Middle East", website: "https://www.isbank.com.tr", aliases: ["Isbank"], payoutEligible: true },
  { name: "Garanti BBVA", country: "Turkey", region: "Middle East", website: "https://www.garantibbva.com.tr", payoutEligible: true },
  { name: "Akbank", country: "Turkey", region: "Middle East", website: "https://www.akbank.com", payoutEligible: true },
  { name: "Yapı Kredi", country: "Turkey", region: "Middle East", website: "https://www.yapikredi.com.tr", payoutEligible: true },
  { name: "VakıfBank", country: "Turkey", region: "Middle East", category: "State-Owned / Development Bank", website: "https://www.vakifbank.com.tr", payoutEligible: true },
  { name: "Halkbank", country: "Turkey", region: "Middle East", category: "State-Owned / Development Bank", website: "https://www.halkbank.com.tr", payoutEligible: true },
];

// ============================================================================
// SECTION C.6: AFRICA — 48 INSTITUTIONS
// ============================================================================
const AFRICA_BANKS_SEED: RawSeedEntry[] = [
  { name: "Standard Bank Group", country: "South Africa", region: "Africa", website: "https://www.standardbank.co.za", aliases: ["Standard Bank South Africa"], payoutEligible: true },
  { name: "FirstRand Bank", country: "South Africa", region: "Africa", website: "https://www.firstrand.co.za", aliases: ["FNB South Africa", "First National Bank SA"], payoutEligible: true },
  { name: "Absa Bank", country: "South Africa", region: "Africa", website: "https://www.absa.co.za", aliases: ["Absa Group"], payoutEligible: true },
  { name: "Nedbank", country: "South Africa", region: "Africa", website: "https://www.nedbank.co.za", payoutEligible: true },
  { name: "Capitec Bank", country: "South Africa", region: "Africa", website: "https://www.capitecbank.co.za", payoutEligible: true },
  { name: "Investec Bank", country: "South Africa", region: "Africa", website: "https://www.investec.com", payoutEligible: true },
  { name: "Discovery Bank", country: "South Africa", region: "Africa", category: "Digital / Neobank", website: "https://www.discovery.co.za/bank", payoutEligible: true },
  { name: "TymeBank", country: "South Africa", region: "Africa", category: "Digital / Neobank", website: "https://www.tymebank.co.za", payoutEligible: true },
  { name: "Access Bank", country: "Nigeria", region: "Africa", website: "https://www.accessbankplc.com", payoutEligible: true },
  { name: "Zenith Bank", country: "Nigeria", region: "Africa", website: "https://www.zenithbank.com", payoutEligible: true },
  { name: "First Bank of Nigeria", country: "Nigeria", region: "Africa", website: "https://www.firstbanknigeria.com", aliases: ["FirstBank"], payoutEligible: true },
  { name: "United Bank for Africa", country: "Nigeria", region: "Africa", website: "https://www.ubagroup.com", aliases: ["UBA"], payoutEligible: true },
  { name: "Guaranty Trust Bank", country: "Nigeria", region: "Africa", website: "https://www.gtbank.com", aliases: ["GTBank", "GTCO"], payoutEligible: true },
  { name: "Ecobank Transnational", country: "Togo", region: "Africa", website: "https://www.ecobank.com", aliases: ["Ecobank"], countries: ["Togo", "Nigeria", "Ghana", "Kenya", "Ivory Coast"], payoutEligible: true },
  { name: "Fidelity Bank Nigeria", country: "Nigeria", region: "Africa", website: "https://www.fidelitybank.ng", payoutEligible: true },
  { name: "Stanbic IBTC Bank", country: "Nigeria", region: "Africa", website: "https://www.stanbicibtcbank.com", payoutEligible: true },
  { name: "Union Bank of Nigeria", country: "Nigeria", region: "Africa", website: "https://www.unionbankng.com", payoutEligible: true },
  { name: "First City Monument Bank", country: "Nigeria", region: "Africa", website: "https://www.fcmb.com", aliases: ["FCMB"], payoutEligible: true },
  { name: "Sterling Bank Nigeria", country: "Nigeria", region: "Africa", website: "https://sterling.ng", payoutEligible: true },
  { name: "Wema Bank", country: "Nigeria", region: "Africa", website: "https://wemabank.com", payoutEligible: true },
  { name: "Polaris Bank", country: "Nigeria", region: "Africa", website: "https://www.polarisbanklimited.com", payoutEligible: true },
  { name: "KCB Bank Kenya", country: "Kenya", region: "Africa", website: "https://ke.kcbgroup.com", aliases: ["Kenya Commercial Bank"], payoutEligible: true },
  { name: "Equity Bank Kenya", country: "Kenya", region: "Africa", website: "https://equitygroupholdings.com", aliases: ["Equity Group"], payoutEligible: true },
  { name: "Co-operative Bank of Kenya", country: "Kenya", region: "Africa", category: "Regional / Cooperative Bank", website: "https://www.co-opbank.co.ke", payoutEligible: true },
  { name: "NCBA Bank Kenya", country: "Kenya", region: "Africa", website: "https://ke.ncbagroup.com", payoutEligible: true },
  { name: "Absa Bank Kenya", country: "Kenya", region: "Africa", website: "https://www.absabank.co.ke", payoutEligible: true },
  { name: "Stanbic Bank Kenya", country: "Kenya", region: "Africa", website: "https://www.stanbicbank.co.ke", payoutEligible: true },
  { name: "Diamond Trust Bank", country: "Kenya", region: "Africa", website: "https://dtbk.dtbafrica.com", aliases: ["DTB Kenya"], payoutEligible: true },
  { name: "I&M Bank", country: "Kenya", region: "Africa", website: "https://www.imbankgroup.com", payoutEligible: true },
  { name: "Family Bank Kenya", country: "Kenya", region: "Africa", website: "https://familybank.co.ke", payoutEligible: true },
  { name: "Attijariwafa Bank", country: "Morocco", region: "Africa", website: "https://www.attijariwafabank.com", payoutEligible: true },
  { name: "Banque Centrale Populaire", country: "Morocco", region: "Africa", website: "https://www.groupebcp.com", aliases: ["BCP Morocco"], payoutEligible: true },
  { name: "Bank of Africa (BMCE Group)", country: "Morocco", region: "Africa", website: "https://www.bankofafrica.ma", aliases: ["BMCE Bank"], payoutEligible: true },
  { name: "Crédit Agricole du Maroc", country: "Morocco", region: "Africa", website: "https://www.creditagricole.ma", payoutEligible: true },
  { name: "CIH Bank", country: "Morocco", region: "Africa", website: "https://www.cihbank.ma", payoutEligible: true },
  { name: "Banque du Caire", country: "Egypt", region: "Africa", category: "State-Owned / Development Bank", website: "https://www.bdc.com.eg", payoutEligible: true },
  { name: "Arab African International Bank", country: "Egypt", region: "Africa", website: "https://www.aaib.com", aliases: ["AAIB"], payoutEligible: true },
  { name: "AlexBank (Bank of Alexandria)", country: "Egypt", region: "Africa", website: "https://www.alexbank.com", payoutEligible: true },
  { name: "Faisal Islamic Bank of Egypt", country: "Egypt", region: "Africa", category: "Islamic Bank", website: "https://www.faisalbank.com.eg", payoutEligible: true },
  { name: "GCB Bank", country: "Ghana", region: "Africa", website: "https://www.gcbbank.com.gh", aliases: ["Ghana Commercial Bank"], payoutEligible: true },
  { name: "Fidelity Bank Ghana", country: "Ghana", region: "Africa", website: "https://www.fidelitybank.com.gh", payoutEligible: true },
  { name: "CalBank", country: "Ghana", region: "Africa", website: "https://calbank.net", payoutEligible: true },
  { name: "Bank of Ghana", country: "Ghana", region: "Africa", category: "Central Bank / Regulator", website: "https://www.bog.gov.gh", payoutEligible: false, regulatoryStatus: "Central Bank / Regulator — Non-Payout" },
  { name: "Stanbic Bank Uganda", country: "Uganda", region: "Africa", website: "https://www.stanbicbank.co.ug", payoutEligible: true },
  { name: "Centenary Bank Uganda", country: "Uganda", region: "Africa", website: "https://www.centenarybank.co.ug", payoutEligible: true },
  { name: "dfcu Bank", country: "Uganda", region: "Africa", website: "https://www.dfcugroup.com", payoutEligible: true },
  { name: "Bank of Uganda", country: "Uganda", region: "Africa", category: "Central Bank / Regulator", website: "https://www.bou.or.ug", payoutEligible: false, regulatoryStatus: "Central Bank / Regulator — Non-Payout" },
  { name: "CRDB Bank", country: "Tanzania", region: "Africa", website: "https://crdbbank.co.tz", payoutEligible: true },
  { name: "NMB Bank Tanzania", country: "Tanzania", region: "Africa", website: "https://www.nmbbank.co.tz", payoutEligible: true },
  { name: "National Bank of Commerce Tanzania", country: "Tanzania", region: "Africa", website: "https://www.nbc.co.tz", aliases: ["NBC Tanzania"], payoutEligible: true },
  { name: "Mauritius Commercial Bank", country: "Mauritius", region: "Africa", website: "https://mcb.mu", aliases: ["MCB Mauritius"], payoutEligible: true },
  { name: "SBM Bank Mauritius", country: "Mauritius", region: "Africa", website: "https://www.sbmgroup.mu", aliases: ["State Bank of Mauritius"], payoutEligible: true },
  { name: "Bank of Mauritius", country: "Mauritius", region: "Africa", category: "Central Bank / Regulator", website: "https://www.bom.mu", payoutEligible: false, regulatoryStatus: "Central Bank / Regulator — Non-Payout" },
];

// ============================================================================
// SECTION C.7: LATIN AMERICA & SOUTH AMERICA — 40 INSTITUTIONS
// ============================================================================
const LATAM_BANKS_SEED: RawSeedEntry[] = [
  { name: "Itaú Unibanco", country: "Brazil", region: "Latin America & South America", website: "https://www.itau.com.br", payoutEligible: true },
  { name: "Banco do Brasil", country: "Brazil", region: "Latin America & South America", category: "State-Owned / Development Bank", website: "https://www.bb.com.br", payoutEligible: true },
  { name: "Banco Bradesco", country: "Brazil", region: "Latin America & South America", website: "https://banco.bradesco", payoutEligible: true },
  { name: "Caixa Econômica Federal", country: "Brazil", region: "Latin America & South America", category: "State-Owned / Development Bank", website: "https://www.caixa.gov.br", payoutEligible: true },
  { name: "Santander Brasil", country: "Brazil", region: "Latin America & South America", website: "https://www.santander.com.br", payoutEligible: true },
  { name: "BTG Pactual", country: "Brazil", region: "Latin America & South America", website: "https://www.btgpactual.com", payoutEligible: true },
  { name: "Nubank", country: "Brazil", region: "Latin America & South America", category: "Digital / Neobank", website: "https://nubank.com.br", aliases: ["Nu Pagamentos"], countries: ["Brazil", "Mexico", "Colombia"], payoutEligible: true },
  { name: "Banco Safra", country: "Brazil", region: "Latin America & South America", website: "https://www.safra.com.br", payoutEligible: true },
  { name: "Banco Votorantim (banco BV)", country: "Brazil", region: "Latin America & South America", website: "https://www.bv.com.br", payoutEligible: true },
  { name: "Banrisul", country: "Brazil", region: "Latin America & South America", category: "State-Owned / Development Bank", website: "https://www.banrisul.com.br", payoutEligible: true },
  { name: "Sicredi", country: "Brazil", region: "Latin America & South America", category: "Regional / Cooperative Bank", website: "https://www.sicredi.com.br", payoutEligible: true },
  { name: "Sicoob", country: "Brazil", region: "Latin America & South America", category: "Regional / Cooperative Bank", website: "https://www.sicoob.com.br", payoutEligible: true },
  { name: "Banco Inter", country: "Brazil", region: "Latin America & South America", category: "Digital / Neobank", website: "https://inter.co", payoutEligible: true },
  { name: "C6 Bank", country: "Brazil", region: "Latin America & South America", category: "Digital / Neobank", website: "https://www.c6bank.com.br", payoutEligible: true },
  { name: "Banco de Chile", country: "Chile", region: "Latin America & South America", website: "https://portales.bancochile.cl", payoutEligible: true },
  { name: "Banco Santander Chile", country: "Chile", region: "Latin America & South America", website: "https://banco.santander.cl", payoutEligible: true },
  { name: "BancoEstado", country: "Chile", region: "Latin America & South America", category: "State-Owned / Development Bank", website: "https://www.bancoestado.cl", aliases: ["Banco del Estado de Chile"], payoutEligible: true },
  { name: "BCI (Banco de Crédito e Inversiones)", country: "Chile", region: "Latin America & South America", website: "https://www.bci.cl", payoutEligible: true },
  { name: "Scotiabank Chile", country: "Chile", region: "Latin America & South America", website: "https://www.scotiabankchile.cl", payoutEligible: true },
  { name: "Itaú Chile", country: "Chile", region: "Latin America & South America", website: "https://ww2.itau.cl", payoutEligible: true },
  { name: "Bancolombia", country: "Colombia", region: "Latin America & South America", website: "https://www.bancolombia.com", payoutEligible: true },
  { name: "Banco de Bogotá", country: "Colombia", region: "Latin America & South America", website: "https://www.bancodebogota.com", payoutEligible: true },
  { name: "Davivienda", country: "Colombia", region: "Latin America & South America", website: "https://www.davivienda.com", payoutEligible: true },
  { name: "BBVA Colombia", country: "Colombia", region: "Latin America & South America", website: "https://www.bbva.com.co", payoutEligible: true },
  { name: "Banco de Occidente", country: "Colombia", region: "Latin America & South America", website: "https://www.bancodeoccidente.com.co", payoutEligible: true },
  { name: "Banco Agrario de Colombia", country: "Colombia", region: "Latin America & South America", category: "State-Owned / Development Bank", website: "https://www.bancoagrario.gov.co", payoutEligible: true },
  { name: "Banco de Crédito del Perú", country: "Peru", region: "Latin America & South America", website: "https://www.viabcp.com", aliases: ["BCP Peru"], payoutEligible: true },
  { name: "BBVA Perú", country: "Peru", region: "Latin America & South America", website: "https://www.bbva.pe", payoutEligible: true },
  { name: "Interbank Peru", country: "Peru", region: "Latin America & South America", website: "https://interbank.pe", payoutEligible: true },
  { name: "Scotiabank Perú", country: "Peru", region: "Latin America & South America", website: "https://www.scotiabank.com.pe", payoutEligible: true },
  { name: "Banco de la Nación (Peru)", country: "Peru", region: "Latin America & South America", category: "State-Owned / Development Bank", website: "https://www.bn.com.pe", payoutEligible: true },
  { name: "Banco de la Nación Argentina", country: "Argentina", region: "Latin America & South America", category: "State-Owned / Development Bank", website: "https://www.bna.com.ar", payoutEligible: true },
  { name: "Banco Galicia", country: "Argentina", region: "Latin America & South America", website: "https://www.galicia.ar", payoutEligible: true },
  { name: "Banco Santander Argentina", country: "Argentina", region: "Latin America & South America", website: "https://www.santander.com.ar", payoutEligible: true },
  { name: "Banco Macro", country: "Argentina", region: "Latin America & South America", website: "https://www.macro.com.ar", payoutEligible: true },
  { name: "BBVA Argentina", country: "Argentina", region: "Latin America & South America", website: "https://www.bbva.com.ar", payoutEligible: true },
  { name: "Banco Provincia", country: "Argentina", region: "Latin America & South America", category: "State-Owned / Development Bank", website: "https://www.bancoprovincia.com.ar", payoutEligible: true },
  { name: "Banco General", country: "Panama", region: "Latin America & South America", website: "https://www.bgeneral.com", payoutEligible: true },
  { name: "Banistmo", country: "Panama", region: "Latin America & South America", website: "https://www.banistmo.com", payoutEligible: true },
  { name: "BAC Credomatic", country: "Panama", region: "Latin America & South America", website: "https://www.baccredomatic.com", countries: ["Panama", "Costa Rica", "Guatemala", "Honduras", "El Salvador", "Nicaragua"], payoutEligible: true },
];

// ============================================================================
// SECTION D: PAYMENT PROVIDERS & MOBILE FINANCIAL SERVICES (SEPARATE CATEGORY) — 42 PROVIDERS
// ============================================================================
const PAYMENT_PROVIDERS_AND_MFS_SEED: RawSeedEntry[] = [
  // Mobile Financial Services (MFS)
  { name: "bKash", country: "Bangladesh", region: "Bangladesh", category: "Mobile Financial Service (MFS)", website: "https://www.bkash.com", currencies: ["BDT"], source: "Bangladesh Bank MFS Licensing Register", sourceUrl: "https://www.bb.org.bd/en/index.php/financialactivity/mfsdata", routingType: "11-Digit bKash Merchant / Personal Wallet Number", rails: ["bKash Merchant API", "bKash Disbursement"], payoutEligible: true },
  { name: "Nagad", country: "Bangladesh", region: "Bangladesh", category: "Mobile Financial Service (MFS)", website: "https://nagad.com.bd", currencies: ["BDT"], source: "Bangladesh Postal Department / Bangladesh Bank MFS", sourceUrl: "https://nagad.com.bd", routingType: "11-Digit Nagad Account Number", rails: ["Nagad Merchant Settlement"], payoutEligible: true },
  { name: "Rocket", country: "Bangladesh", region: "Bangladesh", category: "Mobile Financial Service (MFS)", website: "https://www.dutchbanglabank.com/rocket/rocket.html", aliases: ["DBBL Rocket Mobile Banking"], currencies: ["BDT"], source: "Bangladesh Bank MFS Register (Dutch-Bangla Bank)", routingType: "12-Digit Rocket Account Number", rails: ["Rocket MFS Transfer"], payoutEligible: true },
  { name: "Upay", country: "Bangladesh", region: "Bangladesh", category: "Mobile Financial Service (MFS)", website: "https://www.upaybd.com", aliases: ["UCB Fintech Company Limited"], currencies: ["BDT"], source: "Bangladesh Bank MFS Licensing Register", routingType: "11-Digit Upay Wallet Number", rails: ["Upay Merchant Payout"], payoutEligible: true },
  { name: "Tap (Trust Axiata Pay)", country: "Bangladesh", region: "Bangladesh", category: "Mobile Financial Service (MFS)", website: "https://www.tap.com.bd", currencies: ["BDT"], source: "Bangladesh Bank MFS Licensing Register", routingType: "11-Digit Tap Mobile Number", rails: ["Tap MFS"], payoutEligible: true },
  { name: "mCash", country: "Bangladesh", region: "Bangladesh", category: "Mobile Financial Service (MFS)", website: "https://www.islamibankbd.com/mcash", aliases: ["Islami Bank mCash"], currencies: ["BDT"], source: "Bangladesh Bank MFS Licensing Register", routingType: "mCash Mobile Account", rails: ["mCash"], payoutEligible: true },
  { name: "SureCash", country: "Bangladesh", region: "Bangladesh", category: "Mobile Financial Service (MFS)", website: "https://www.surecash.net", currencies: ["BDT"], source: "Bangladesh Bank MFS Licensing Register", routingType: "SureCash Mobile Wallet", rails: ["SureCash"], payoutEligible: false },
  { name: "M-Pesa", country: "Kenya", region: "Africa", category: "Mobile Financial Service (MFS)", website: "https://www.safaricom.co.ke/personal/m-pesa", countries: ["Kenya", "Tanzania", "Mozambique", "Ghana", "Egypt"], currencies: ["KES", "TZS", "GHS"], source: "Central Bank of Kenya Payment Service Provider Register", routingType: "M-Pesa Till / Paybill / Phone Number", rails: ["M-Pesa B2C / B2B"], payoutEligible: true },
  { name: "MTN MoMo", country: "Ghana", region: "Africa", category: "Mobile Financial Service (MFS)", website: "https://www.mtn.com/momo", aliases: ["MTN Mobile Money"], countries: ["Ghana", "Uganda", "Nigeria", "Ivory Coast", "Cameroon", "Rwanda", "Zambia"], currencies: ["GHS", "UGX", "NGN", "XOF", "XAF"], source: "Bank of Ghana / Regional Central Bank EMI Licenses", routingType: "MTN MoMo Registered Mobile Number", rails: ["MTN MoMo Disbursement API"], payoutEligible: true },
  { name: "Airtel Money", country: "Kenya", region: "Africa", category: "Mobile Financial Service (MFS)", website: "https://www.airtel.africa/airtel-money", countries: ["Kenya", "Uganda", "Tanzania", "Nigeria", "Zambia", "Malawi"], currencies: ["KES", "UGX", "TZS", "NGN"], source: "Central Bank of Kenya / BoU Mobile Money Register", routingType: "Airtel Money Wallet Number", rails: ["Airtel Money B2C"], payoutEligible: true },
  { name: "Orange Money", country: "Morocco", region: "Africa", category: "Mobile Financial Service (MFS)", website: "https://www.orange.com", countries: ["Morocco", "Ivory Coast", "Senegal", "Mali", "Cameroon", "Jordan"], currencies: ["MAD", "XOF", "XAF", "JOD"], source: "BCEAO / Bank Al-Maghrib E-Money Register", routingType: "Orange Money Mobile Number", rails: ["Orange Money Instant"], payoutEligible: true },
  { name: "GCash", country: "Philippines", region: "Asia-Pacific", category: "Mobile Financial Service (MFS)", website: "https://www.gcash.com", aliases: ["G-Xchange Inc."], currencies: ["PHP"], source: "Bangko Sentral ng Pilipinas EMI Register", routingType: "11-Digit PH Mobile Number / InstaPay", rails: ["GCash Disbursement", "InstaPay"], payoutEligible: true },
  { name: "Maya", country: "Philippines", region: "Asia-Pacific", category: "Mobile Financial Service (MFS)", website: "https://www.maya.ph", aliases: ["PayMaya"], currencies: ["PHP"], source: "Bangko Sentral ng Pilipinas EMI / Digital Bank Register", routingType: "Maya Mobile Number / Account", rails: ["Maya Payout", "InstaPay"], payoutEligible: true },
  { name: "GoPay", country: "Indonesia", region: "Asia-Pacific", category: "Mobile Financial Service (MFS)", website: "https://www.gopay.co.id", aliases: ["GoTo Financial"], currencies: ["IDR"], source: "Bank Indonesia Licensed E-Money Operator", routingType: "GoPay Registered Phone Number", rails: ["GoPay Merchant Payout"], payoutEligible: true },
  { name: "OVO", country: "Indonesia", region: "Asia-Pacific", category: "Mobile Financial Service (MFS)", website: "https://www.ovo.id", currencies: ["IDR"], source: "Bank Indonesia E-Money Register", routingType: "OVO Mobile Number", rails: ["OVO Instant Transfer"], payoutEligible: true },
  { name: "DANA", country: "Indonesia", region: "Asia-Pacific", category: "Mobile Financial Service (MFS)", website: "https://www.dana.id", currencies: ["IDR"], source: "Bank Indonesia E-Money Register", routingType: "DANA Registered Mobile Number", rails: ["DANA Disbursement"], payoutEligible: true },
  { name: "JazzCash", country: "Pakistan", region: "South Asia", category: "Mobile Financial Service (MFS)", website: "https://www.jazzcash.com.pk", currencies: ["PKR"], source: "State Bank of Pakistan EMI / Microfinance Register", routingType: "11-Digit JazzCash Mobile Wallet", rails: ["JazzCash IBFT / RAAST"], payoutEligible: true },
  { name: "Easypaisa", country: "Pakistan", region: "South Asia", category: "Mobile Financial Service (MFS)", website: "https://easypaisa.com.pk", aliases: ["Telenor Microfinance Bank Easypaisa"], currencies: ["PKR"], source: "State Bank of Pakistan EMI Register", routingType: "11-Digit Easypaisa Mobile Account", rails: ["Easypaisa RAAST / IBFT"], payoutEligible: true },
  { name: "eSewa", country: "Nepal", region: "South Asia", category: "Mobile Financial Service (MFS)", website: "https://esewa.com.np", currencies: ["NPR"], source: "Nepal Rastra Bank Licensed PSP", routingType: "eSewa ID (Mobile Number)", rails: ["eSewa Wallet Transfer"], payoutEligible: true },
  { name: "Khalti", country: "Nepal", region: "South Asia", category: "Mobile Financial Service (MFS)", website: "https://khalti.com", currencies: ["NPR"], source: "Nepal Rastra Bank Licensed PSP", routingType: "Khalti Mobile ID", rails: ["Khalti Merchant Settlement"], payoutEligible: true },

  // Global & Regional Payment Service Providers (PSP / E-Wallets)
  { name: "Payoneer", country: "United States", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.payoneer.com", countries: ["United States", "United Kingdom", "Bangladesh", "India", "Pakistan", "Philippines", "Vietnam"], currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "BDT", "INR", "PKR"], source: "FinCEN MSB / FCA / Cross-Border PSP Register", routingType: "Payoneer Account Email / Receiving Account ID", rails: ["Payoneer Global Bank Transfer", "Payoneer Wallet"], payoutEligible: true },
  { name: "WorldFirst", country: "United Kingdom", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.worldfirst.com", countries: ["United Kingdom", "Singapore", "Hong Kong", "China", "Australia"], currencies: ["USD", "GBP", "EUR", "CNY", "HKD", "SGD", "AUD"], source: "UK FCA Authorized Electronic Money Institution", routingType: "WorldFirst World Account Number", rails: ["WorldFirst Cross-Border Settlement"], payoutEligible: true },
  { name: "Wise", country: "United Kingdom", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://wise.com", aliases: ["TransferWise", "Wise Payments Limited"], countries: ["United Kingdom", "United States", "Belgium", "Singapore", "Australia", "Canada"], currencies: ["GBP", "EUR", "USD", "AUD", "CAD", "SGD", "BDT", "INR"], source: "UK FCA Electronic Money Register (FRN 900507)", routingType: "Wise Multi-Currency Account / Email", rails: ["Wise Local Rails", "SWIFT"], payoutEligible: true },
  { name: "PayPal", country: "United States", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.paypal.com", countries: ["United States", "United Kingdom", "Germany", "Australia", "Canada", "Singapore"], currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "SGD"], source: "US State Money Transmitter / CSSF Luxembourg Bank License", routingType: "PayPal Merchant Email / Payer ID", rails: ["PayPal Payouts API", "Hyperwallet"], payoutEligible: true },
  { name: "Skrill", country: "United Kingdom", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.skrill.com", aliases: ["Paysafe Group"], currencies: ["USD", "EUR", "GBP"], source: "UK FCA / Central Bank of Ireland EMI Register", routingType: "Skrill Verified Wallet Email", rails: ["Skrill Instant Payout"], payoutEligible: true },
  { name: "Neteller", country: "United Kingdom", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.neteller.com", currencies: ["USD", "EUR", "GBP"], source: "UK FCA / Central Bank of Ireland EMI Register", routingType: "Neteller Account ID / Email", rails: ["Neteller Transfer"], payoutEligible: true },
  { name: "Airwallex", country: "Australia", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.airwallex.com", countries: ["Australia", "Singapore", "Hong Kong", "United Kingdom", "United States", "Netherlands"], currencies: ["AUD", "USD", "EUR", "GBP", "HKD", "SGD", "CNY"], source: "ASIC / MAS / FCA / DNB EMI Licenses", routingType: "Airwallex Global Account ID", rails: ["Airwallex Local Payout Network"], payoutEligible: true },
  { name: "Stripe Connect", country: "United States", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://stripe.com/connect", countries: ["United States", "United Kingdom", "Canada", "Australia", "Singapore", "Japan", "India", "Brazil"], currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "JPY", "INR", "BRL"], source: "FinCEN / FCA / CBI Authorized Payment Institution", routingType: "Stripe Connected Account ID (acct_...)", rails: ["Stripe Instant Payouts", "Stripe Standard ACH/SEPA"], payoutEligible: true },
  { name: "Adyen", country: "Netherlands", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.adyen.com", countries: ["Netherlands", "United Kingdom", "United States", "Singapore", "Australia", "Brazil"], currencies: ["EUR", "USD", "GBP", "AUD", "SGD", "BRL"], source: "De Nederlandsche Bank (DNB) / ECB Banking License", routingType: "Adyen Balance Platform Account Holder ID", rails: ["Adyen MarketPay / Balance Platform Payout"], payoutEligible: true },
  { name: "Rapyd", country: "United Kingdom", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.rapyd.net", countries: ["United Kingdom", "Singapore", "United States", "Israel"], currencies: ["USD", "EUR", "GBP", "SGD", "MXN", "BRL"], source: "UK FCA / MAS Licensed Payment Institution", routingType: "Rapyd Beneficiary / eWallet ID", rails: ["Rapyd Disburse Network"], payoutEligible: true },
  { name: "Flutterwave", country: "Nigeria", region: "Africa", category: "Payment Service Provider", website: "https://flutterwave.com", countries: ["Nigeria", "Kenya", "Ghana", "South Africa", "Uganda", "Rwanda"], currencies: ["NGN", "KES", "GHS", "ZAR", "UGX", "USD"], source: "Central Bank of Nigeria PSSP / Switching License", routingType: "Flutterwave Subaccount / Merchant ID", rails: ["Flutterwave Payouts"], payoutEligible: true },
  { name: "Paystack", country: "Nigeria", region: "Africa", category: "Payment Service Provider", website: "https://paystack.com", aliases: ["Paystack by Stripe"], countries: ["Nigeria", "Ghana", "Kenya", "South Africa"], currencies: ["NGN", "GHS", "KES", "ZAR", "USD"], source: "Central Bank of Nigeria Licensed Payment Solution Service", routingType: "Paystack Transfer Recipient Code", rails: ["Paystack Transfers"], payoutEligible: true },
  { name: "ShopeePay", country: "Singapore", region: "Asia-Pacific", category: "Payment Service Provider", website: "https://shopeepay.com", aliases: ["AirPay / SeaMoney"], countries: ["Singapore", "Malaysia", "Indonesia", "Thailand", "Philippines", "Vietnam"], currencies: ["SGD", "MYR", "IDR", "THB", "PHP", "VND"], source: "MAS / Regional Central Bank E-Money Licenses", routingType: "ShopeePay Merchant / Mobile Wallet ID", rails: ["ShopeePay Wallet Settlement"], payoutEligible: true },
  { name: "GrabPay", country: "Singapore", region: "Asia-Pacific", category: "Payment Service Provider", website: "https://www.grab.com/sg/pay", countries: ["Singapore", "Malaysia", "Philippines", "Thailand"], currencies: ["SGD", "MYR", "PHP", "THB"], source: "MAS Major Payment Institution License", routingType: "GrabPay Merchant Wallet", rails: ["GrabPay Settlement"], payoutEligible: true },
  { name: "Alipay", country: "China", region: "Asia-Pacific", category: "Payment Service Provider", website: "https://global.alipay.com", aliases: ["Ant Group Alipay", "Alipay+"], countries: ["China", "Hong Kong", "Singapore"], currencies: ["CNY", "HKD", "USD"], source: "People's Bank of China (PBOC) Payment Business License", routingType: "Alipay Logon ID (Phone / Email)", rails: ["Alipay Instant Transfer", "Alipay+ Cross-Border"], payoutEligible: true },
  { name: "WeChat Pay", country: "China", region: "Asia-Pacific", category: "Payment Service Provider", website: "https://pay.weixin.qq.com", aliases: ["Tenpay / Weixin Pay"], countries: ["China", "Hong Kong"], currencies: ["CNY", "HKD"], source: "People's Bank of China (PBOC) Payment License (Tenpay)", routingType: "WeChat OpenID / Merchant Sub-MchID", rails: ["WeChat Pay Merchant Settlement"], payoutEligible: true },
  { name: "Mercado Pago", country: "Argentina", region: "Latin America & South America", category: "Payment Service Provider", website: "https://www.mercadopago.com", countries: ["Argentina", "Brazil", "Mexico", "Chile", "Colombia", "Peru", "Uruguay"], currencies: ["ARS", "BRL", "MXN", "CLP", "COP", "PEN"], source: "BCRA / Banco Central do Brasil / CNBV Payment Institution", routingType: "CVU / CLABE / Pix Key / Mercado Pago Account", rails: ["Mercado Pago Instant Settlement"], payoutEligible: true },
  { name: "Pix", country: "Brazil", region: "Latin America & South America", category: "Payment Service Provider", website: "https://www.bcb.gov.br/estabilidadefinanceira/pix", aliases: ["Banco Central do Brasil Pix Instant Payment Rail"], currencies: ["BRL"], source: "Banco Central do Brasil (Official Instant Payment System)", routingType: "Pix Key (CPF / CNPJ / Email / Phone / EVP)", rails: ["Pix Instant 24/7"], payoutEligible: true },
  { name: "Paytm", country: "India", region: "South Asia", category: "Payment Service Provider", website: "https://paytm.com", aliases: ["One97 Communications / Paytm UPI"], currencies: ["INR"], source: "NPCI Third-Party Application Provider (TPAP) / RBI", routingType: "Paytm UPI ID (@ptyes / @ptaxis)", rails: ["UPI", "IMPS"], payoutEligible: true },
  { name: "PhonePe", country: "India", region: "South Asia", category: "Payment Service Provider", website: "https://www.phonepe.com", currencies: ["INR"], source: "RBI Authorized Prepaid Payment Instrument & NPCI TPAP", routingType: "PhonePe UPI ID (@ybl / @ibl / @axl)", rails: ["UPI", "PhonePe Merchant Settlement"], payoutEligible: true },
  { name: "Google Pay", country: "United States", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://pay.google.com", aliases: ["GPay"], countries: ["United States", "India", "Singapore", "United Kingdom"], currencies: ["USD", "INR", "SGD", "GBP", "EUR"], source: "NPCI TPAP (India) / FinCEN MSB", routingType: "UPI VPA (India) / Linked Bank Token", rails: ["UPI", "Card Token Rail"], payoutEligible: false, adminNotes: "Consumer payment & UPI routing layer; direct seller payouts require underlying bank/UPI VPA." },
  { name: "Apple Pay", country: "United States", region: "Global Multi-Region", category: "Payment Service Provider", website: "https://www.apple.com/apple-pay", countries: ["United States", "United Kingdom", "Canada", "Australia", "Japan", "Singapore"], currencies: ["USD", "GBP", "EUR", "CAD", "AUD", "JPY", "SGD"], source: "Apple Payments Inc. / EMVCo Token Service Provider", routingType: "Device Account Number (DAN)", rails: ["Apple Pay Token Network"], payoutEligible: false, adminNotes: "Checkout acceptance wallet; not a direct marketplace seller settlement bank." },
];

function slugifyId(name: string, country: string, idx: number): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const cleanCountry = country
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `inst_${cleanCountry}_${cleanName}_${idx}`;
}

export function buildDeduplicatedBankDirectory(): BankDirectoryRecord[] {
  const allSeeds: RawSeedEntry[] = [
    ...BANGLADESH_BANKS_SEED,
    ...NORTH_AMERICA_BANKS_SEED,
    ...UK_EUROPE_BANKS_SEED,
    ...SOUTH_ASIA_BANKS_SEED,
    ...APAC_OCEANIA_BANKS_SEED,
    ...MIDDLE_EAST_BANKS_SEED,
    ...AFRICA_BANKS_SEED,
    ...LATAM_BANKS_SEED,
    ...PAYMENT_PROVIDERS_AND_MFS_SEED,
  ];

  const seenCanonicalKeys = new Set<string>();
  const seenGlobalAliasKeys = new Set<string>();
  const records: BankDirectoryRecord[] = [];

  for (let i = 0; i < allSeeds.length; i++) {
    const raw = allSeeds[i];
    const cleanName = raw.name.trim();
    const cleanCountry = raw.country.trim();
    const canonicalKey = `${cleanName.toLowerCase()}::${cleanCountry.toLowerCase()}`;

    if (seenCanonicalKeys.has(canonicalKey)) {
      continue;
    }
    seenCanonicalKeys.add(canonicalKey);

    const countryMeta = COUNTRY_DEFAULT_META[cleanCountry] || {
      currency: "USD",
      regulator: `${cleanCountry} Central Bank / Financial Supervisory Register`,
      regulatorUrl: raw.website || "https://www.bis.org/cbanks.htm",
      routingType: "SWIFT / BIC & Local Clearing Code",
      defaultRails: ["Local Bank Transfer", "SWIFT"],
    };

    const category: InstitutionCategory = raw.category || "Commercial Bank";
    const isTraditionalBank =
      category !== "Mobile Financial Service (MFS)" &&
      category !== "Payment Service Provider";

    const isRegulator = category === "Central Bank / Regulator";
    const regulatoryStatus: RegulatoryVerificationStatus =
      raw.regulatoryStatus ||
      (isRegulator ? "Central Bank / Regulator — Non-Payout" : "Verified Licensed");

    const verified = raw.verified !== undefined ? raw.verified : true;
    const payoutEligible =
      isRegulator
        ? false
        : raw.payoutEligible !== undefined
        ? raw.payoutEligible
        : true;

    const uniqueAliases: string[] = [];
    for (const al of raw.aliases || []) {
      const trimmed = al.trim();
      if (trimmed && trimmed.toLowerCase() !== cleanName.toLowerCase()) {
        uniqueAliases.push(trimmed);
        seenGlobalAliasKeys.add(`${trimmed.toLowerCase()}::${cleanCountry.toLowerCase()}`);
      }
    }

    const countriesOfOperation = Array.from(
      new Set([cleanCountry, ...(raw.countries || [])])
    );

    const supportedCurrencies = Array.from(
      new Set(raw.currencies && raw.currencies.length > 0 ? raw.currencies : [countryMeta.currency])
    );

    records.push({
      institutionId: slugifyId(cleanName, cleanCountry, records.length + 1),
      officialName: cleanName,
      aliases: uniqueAliases,
      country: cleanCountry,
      countriesOfOperation,
      region: raw.region,
      category,
      isTraditionalBank,
      officialWebsite: raw.website || "",
      supportedCurrencies,
      swiftBicCode: raw.swift || "",
      routingCodeType: raw.routingType || countryMeta.routingType,
      verificationSource: raw.source || countryMeta.regulator,
      verificationSourceUrl: raw.sourceUrl || countryMeta.regulatorUrl,
      regulatoryStatus,
      verified,
      payoutEligible,
      payoutSupportedCountries: payoutEligible ? countriesOfOperation : [],
      supportedPayoutRails: raw.rails || countryMeta.defaultRails,
      active: true,
      lastVerifiedDate: "2025-02-15",
      adminNotes: "",
    });
  }

  return records;
}

// Singleton runtime directory in memory synced with MongoDB
let runtimeBankDirectory: BankDirectoryRecord[] = buildDeduplicatedBankDirectory();
let mongoSynced = false;

export async function ensureBankDirectorySeeded(): Promise<BankDirectoryRecord[]> {
  if (!isMongoConnected() || mongoSynced) {
    return runtimeBankDirectory;
  }
  try {
    const existingCount = await BankInstitution.countDocuments();
    if (existingCount === 0) {
      await BankInstitution.insertMany(runtimeBankDirectory, { ordered: false }).catch(() => {});
    } else if (existingCount < runtimeBankDirectory.length) {
      // Upsert any missing seed institutions without overwriting admin edits
      const existingDocs = await BankInstitution.find({}, { institutionId: 1, officialName: 1, country: 1 }).lean();
      const existingKeys = new Set(
        existingDocs.map(
          (d: any) => `${String(d.officialName || "").toLowerCase()}::${String(d.country || "").toLowerCase()}`
        )
      );
      const toInsert = runtimeBankDirectory.filter(
        (r) => !existingKeys.has(`${r.officialName.toLowerCase()}::${r.country.toLowerCase()}`)
      );
      if (toInsert.length > 0) {
        await BankInstitution.insertMany(toInsert, { ordered: false }).catch(() => {});
      }
    }
    const allDb = await BankInstitution.find({}).lean();
    if (allDb.length >= 500) {
      runtimeBankDirectory = allDb.map((d: any) => ({
        institutionId: d.institutionId || String(d._id),
        officialName: d.officialName,
        aliases: Array.isArray(d.aliases) ? d.aliases : [],
        country: d.country,
        countriesOfOperation: Array.isArray(d.countriesOfOperation) ? d.countriesOfOperation : [d.country],
        region: d.region || "Global Multi-Region",
        category: d.category || "Commercial Bank",
        isTraditionalBank: d.isTraditionalBank !== false,
        officialWebsite: d.officialWebsite || "",
        supportedCurrencies: Array.isArray(d.supportedCurrencies) ? d.supportedCurrencies : ["USD"],
        swiftBicCode: d.swiftBicCode || "",
        routingCodeType: d.routingCodeType || "SWIFT / Local Routing",
        verificationSource: d.verificationSource || "Central Bank Register",
        verificationSourceUrl: d.verificationSourceUrl || "",
        regulatoryStatus: d.regulatoryStatus || "Verified Licensed",
        verified: Boolean(d.verified),
        payoutEligible: Boolean(d.payoutEligible),
        payoutSupportedCountries: Array.isArray(d.payoutSupportedCountries) ? d.payoutSupportedCountries : [],
        supportedPayoutRails: Array.isArray(d.supportedPayoutRails) ? d.supportedPayoutRails : [],
        active: d.active !== false,
        lastVerifiedDate: d.lastVerifiedDate || "2025-02-15",
        adminNotes: d.adminNotes || "",
      }));
    }
    mongoSynced = true;
  } catch (e) {
    console.warn("BankDirectory MongoDB sync fallback to in-memory seed:", e);
  }
  return runtimeBankDirectory;
}

export function getRuntimeBankDirectory(): BankDirectoryRecord[] {
  return runtimeBankDirectory;
}

export interface BankDirectoryQueryOptions {
  q?: string;
  country?: string;
  region?: string;
  category?: string;
  institutionType?: "all" | "traditional_banks" | "mfs_and_psp";
  payoutEligibleOnly?: boolean;
  verifiedOnly?: boolean;
  activeOnly?: boolean;
  page?: number;
  limit?: number;
}

export function queryBankDirectory(opts: BankDirectoryQueryOptions) {
  const {
    q = "",
    country = "",
    region = "",
    category = "",
    institutionType = "all",
    payoutEligibleOnly = false,
    verifiedOnly = false,
    activeOnly = false,
    page = 1,
    limit = 30,
  } = opts;

  const searchLower = q.trim().toLowerCase();
  const countryLower = country.trim().toLowerCase();
  const regionLower = region.trim().toLowerCase();
  const categoryLower = category.trim().toLowerCase();

  const filtered = runtimeBankDirectory.filter((item) => {
    if (activeOnly && !item.active) return false;
    if (payoutEligibleOnly && !item.payoutEligible) return false;
    if (verifiedOnly && !item.verified) return false;

    if (institutionType === "traditional_banks" && !item.isTraditionalBank) return false;
    if (institutionType === "mfs_and_psp" && item.isTraditionalBank) return false;

    if (countryLower && countryLower !== "all") {
      const inCountry =
        item.country.toLowerCase() === countryLower ||
        item.countriesOfOperation.some((c) => c.toLowerCase() === countryLower);
      if (!inCountry) return false;
    }

    if (regionLower && regionLower !== "all") {
      if (item.region.toLowerCase() !== regionLower) return false;
    }

    if (categoryLower && categoryLower !== "all") {
      if (item.category.toLowerCase() !== categoryLower) return false;
    }

    if (searchLower) {
      const matchesName = item.officialName.toLowerCase().includes(searchLower);
      const matchesAlias = item.aliases.some((a) => a.toLowerCase().includes(searchLower));
      const matchesCountry =
        item.country.toLowerCase().includes(searchLower) ||
        item.countriesOfOperation.some((c) => c.toLowerCase().includes(searchLower));
      const matchesCurrency = item.supportedCurrencies.some((cur) =>
        cur.toLowerCase().includes(searchLower)
      );
      const matchesCategory = item.category.toLowerCase().includes(searchLower);
      const matchesSource = item.verificationSource.toLowerCase().includes(searchLower);
      if (
        !matchesName &&
        !matchesAlias &&
        !matchesCountry &&
        !matchesCurrency &&
        !matchesCategory &&
        !matchesSource
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort Bangladesh first if no country filter, or alphabetical by country then officialName
  filtered.sort((a, b) => {
    if (a.country === "Bangladesh" && b.country !== "Bangladesh") return -1;
    if (b.country === "Bangladesh" && a.country !== "Bangladesh") return 1;
    const cCmp = a.country.localeCompare(b.country);
    if (cCmp !== 0) return cCmp;
    return a.officialName.localeCompare(b.officialName);
  });

  const safeLimit = Math.max(1, Math.min(250, Number(limit) || 30));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.max(1, Math.min(totalPages, Number(page) || 1));
  const startIdx = (safePage - 1) * safeLimit;
  const items = filtered.slice(startIdx, startIdx + safeLimit);

  return {
    items,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasMore: safePage < totalPages,
    },
  };
}

export function getBankDirectorySummaryStats() {
  const totalUnique = runtimeBankDirectory.length;
  let verifiedCount = 0;
  let unverifiedCount = 0;
  let payoutEligibleCount = 0;
  let activeCount = 0;
  let traditionalBankCount = 0;
  let mfsAndPspCount = 0;

  const byRegion: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byCountryMap: Record<string, number> = {};

  for (const inst of runtimeBankDirectory) {
    if (inst.verified) verifiedCount++;
    else unverifiedCount++;

    if (inst.payoutEligible && inst.active) payoutEligibleCount++;
    if (inst.active) activeCount++;
    if (inst.isTraditionalBank) traditionalBankCount++;
    else mfsAndPspCount++;

    byRegion[inst.region] = (byRegion[inst.region] || 0) + 1;
    byCategory[inst.category] = (byCategory[inst.category] || 0) + 1;
    byCountryMap[inst.country] = (byCountryMap[inst.country] || 0) + 1;
  }

  const countries = Object.keys(byCountryMap).sort((a, b) => {
    if (a === "Bangladesh") return -1;
    if (b === "Bangladesh") return 1;
    return a.localeCompare(b);
  });

  return {
    totalUnique,
    verifiedCount,
    unverifiedCount,
    payoutEligibleCount,
    activeCount,
    inactiveCount: totalUnique - activeCount,
    traditionalBankCount,
    mfsAndPspCount,
    totalCountriesCovered: countries.length,
    byRegion,
    byCategory,
    byCountry: byCountryMap,
    countries,
    regions: [
      "Bangladesh",
      "South Asia",
      "Asia-Pacific",
      "United Kingdom & Europe",
      "North America",
      "Middle East",
      "Africa",
      "Latin America & South America",
      "Oceania",
      "Global Multi-Region",
    ],
    categories: [
      "Commercial Bank",
      "Islamic Bank",
      "State-Owned / Development Bank",
      "Central Bank / Regulator",
      "Regional / Cooperative Bank",
      "Digital / Neobank",
      "Mobile Financial Service (MFS)",
      "Payment Service Provider",
    ],
  };
}

export async function addOrUpdateBankInstitution(
  payload: Partial<BankDirectoryRecord>,
  existingInstitutionId?: string
): Promise<{ record: BankDirectoryRecord; created: boolean }> {
  const cleanName = String(payload.officialName || "").trim();
  const cleanCountry = String(payload.country || "").trim();
  if (!cleanName || !cleanCountry) {
    throw new Error("Both official institution name and country are required.");
  }

  if (existingInstitutionId) {
    const idx = runtimeBankDirectory.findIndex(
      (r) => r.institutionId === existingInstitutionId
    );
    if (idx === -1) {
      throw new Error("Institution record not found.");
    }
    const current = runtimeBankDirectory[idx];
    const nextCategory = (payload.category as InstitutionCategory) || current.category;
    const isTraditionalBank =
      nextCategory !== "Mobile Financial Service (MFS)" &&
      nextCategory !== "Payment Service Provider";
    const isRegulator = nextCategory === "Central Bank / Regulator";

    const updated: BankDirectoryRecord = {
      ...current,
      officialName: cleanName || current.officialName,
      country: cleanCountry || current.country,
      region: (payload.region as any) || current.region,
      category: nextCategory,
      isTraditionalBank,
      aliases: Array.isArray(payload.aliases)
        ? payload.aliases.map((a) => String(a).trim()).filter(Boolean)
        : current.aliases,
      countriesOfOperation: Array.isArray(payload.countriesOfOperation)
        ? Array.from(new Set([cleanCountry, ...payload.countriesOfOperation]))
        : current.countriesOfOperation,
      officialWebsite:
        payload.officialWebsite !== undefined
          ? String(payload.officialWebsite).trim()
          : current.officialWebsite,
      supportedCurrencies: Array.isArray(payload.supportedCurrencies)
        ? payload.supportedCurrencies.map((c) => String(c).trim().toUpperCase()).filter(Boolean)
        : current.supportedCurrencies,
      swiftBicCode:
        payload.swiftBicCode !== undefined
          ? String(payload.swiftBicCode).trim().toUpperCase()
          : current.swiftBicCode,
      routingCodeType:
        payload.routingCodeType !== undefined
          ? String(payload.routingCodeType).trim()
          : current.routingCodeType,
      verificationSource:
        payload.verificationSource !== undefined
          ? String(payload.verificationSource).trim()
          : current.verificationSource,
      verificationSourceUrl:
        payload.verificationSourceUrl !== undefined
          ? String(payload.verificationSourceUrl).trim()
          : current.verificationSourceUrl,
      regulatoryStatus:
        (payload.regulatoryStatus as RegulatoryVerificationStatus) || current.regulatoryStatus,
      verified:
        payload.verified !== undefined ? Boolean(payload.verified) : current.verified,
      payoutEligible: isRegulator
        ? false
        : payload.payoutEligible !== undefined
        ? Boolean(payload.payoutEligible)
        : current.payoutEligible,
      payoutSupportedCountries: Array.isArray(payload.payoutSupportedCountries)
        ? payload.payoutSupportedCountries
        : current.payoutSupportedCountries,
      supportedPayoutRails: Array.isArray(payload.supportedPayoutRails)
        ? payload.supportedPayoutRails
        : current.supportedPayoutRails,
      active: payload.active !== undefined ? Boolean(payload.active) : current.active,
      lastVerifiedDate:
        payload.lastVerifiedDate || new Date().toISOString().slice(0, 10),
      adminNotes:
        payload.adminNotes !== undefined ? String(payload.adminNotes) : current.adminNotes,
    };

    runtimeBankDirectory[idx] = updated;
    if (isMongoConnected()) {
      await BankInstitution.findOneAndUpdate(
        { institutionId: existingInstitutionId },
        { $set: updated },
        { upsert: true }
      ).catch(() => {});
    }
    return { record: updated, created: false };
  }

  // Creating new institution — check for duplicate officialName or alias in the same country
  const dup = runtimeBankDirectory.find(
    (r) =>
      r.country.toLowerCase() === cleanCountry.toLowerCase() &&
      (r.officialName.toLowerCase() === cleanName.toLowerCase() ||
        r.aliases.some((a) => a.toLowerCase() === cleanName.toLowerCase()))
  );
  if (dup) {
    throw new Error(
      `Duplicate institution prevented: "${cleanName}" already exists in ${cleanCountry} as "${dup.officialName}". Add alternate spellings as aliases instead.`
    );
  }

  const category: InstitutionCategory =
    (payload.category as InstitutionCategory) || "Commercial Bank";
  const isTraditionalBank =
    category !== "Mobile Financial Service (MFS)" &&
    category !== "Payment Service Provider";
  const isRegulator = category === "Central Bank / Regulator";
  const countryMeta = COUNTRY_DEFAULT_META[cleanCountry] || {
    currency: "USD",
    regulator: `${cleanCountry} Central Bank / Financial Regulator`,
    regulatorUrl: "",
    routingType: "SWIFT / Local Routing",
    defaultRails: ["Bank Transfer"],
  };

  const newRecord: BankDirectoryRecord = {
    institutionId: slugifyId(cleanName, cleanCountry, runtimeBankDirectory.length + 1),
    officialName: cleanName,
    aliases: Array.isArray(payload.aliases)
      ? payload.aliases.map((a) => String(a).trim()).filter(Boolean)
      : [],
    country: cleanCountry,
    countriesOfOperation: Array.isArray(payload.countriesOfOperation)
      ? Array.from(new Set([cleanCountry, ...payload.countriesOfOperation]))
      : [cleanCountry],
    region:
      (payload.region as any) ||
      (cleanCountry === "Bangladesh" ? "Bangladesh" : "Global Multi-Region"),
    category,
    isTraditionalBank,
    officialWebsite: String(payload.officialWebsite || "").trim(),
    supportedCurrencies:
      Array.isArray(payload.supportedCurrencies) && payload.supportedCurrencies.length > 0
        ? payload.supportedCurrencies.map((c) => String(c).trim().toUpperCase())
        : [countryMeta.currency],
    swiftBicCode: String(payload.swiftBicCode || "").trim().toUpperCase(),
    routingCodeType: String(payload.routingCodeType || countryMeta.routingType).trim(),
    verificationSource: String(
      payload.verificationSource || countryMeta.regulator
    ).trim(),
    verificationSourceUrl: String(
      payload.verificationSourceUrl || countryMeta.regulatorUrl
    ).trim(),
    regulatoryStatus:
      (payload.regulatoryStatus as RegulatoryVerificationStatus) ||
      (isRegulator ? "Central Bank / Regulator — Non-Payout" : "Under Review"),
    verified: payload.verified !== undefined ? Boolean(payload.verified) : false,
    payoutEligible: isRegulator ? false : Boolean(payload.payoutEligible),
    payoutSupportedCountries: Boolean(payload.payoutEligible) ? [cleanCountry] : [],
    supportedPayoutRails:
      Array.isArray(payload.supportedPayoutRails) && payload.supportedPayoutRails.length > 0
        ? payload.supportedPayoutRails
        : countryMeta.defaultRails,
    active: payload.active !== undefined ? Boolean(payload.active) : true,
    lastVerifiedDate: new Date().toISOString().slice(0, 10),
    adminNotes: String(payload.adminNotes || "").trim(),
  };

  runtimeBankDirectory.unshift(newRecord);
  if (isMongoConnected()) {
    await BankInstitution.create(newRecord).catch(() => {});
  }
  return { record: newRecord, created: true };
}

export async function bulkImportBankInstitutions(
  format: "json" | "csv",
  rawContent: string | any[]
): Promise<{
  importedCount: number;
  skippedDuplicates: number;
  totalDirectoryCount: number;
  importedNames: string[];
}> {
  let rows: Array<Record<string, any>> = [];

  if (Array.isArray(rawContent)) {
    rows = rawContent;
  } else if (format === "json" && typeof rawContent === "string") {
    const parsed = JSON.parse(rawContent);
    rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed.institutions) ? parsed.institutions : [];
  } else if (format === "csv" && typeof rawContent === "string") {
    const lines = rawContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      throw new Error("CSV must include a header row and at least one institution row.");
    }
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const rowObj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = cols[idx] ?? "";
      });
      rows.push(rowObj);
    }
  }

  let importedCount = 0;
  let skippedDuplicates = 0;
  const importedNames: string[] = [];

  for (const row of rows) {
    const officialName = String(
      row.officialName || row.name || row.bankName || row.Institution || ""
    ).trim();
    const country = String(row.country || row.Country || "").trim();
    if (!officialName || !country) continue;

    try {
      const currenciesRaw = row.supportedCurrencies || row.currency || row.Currency;
      const currencies = Array.isArray(currenciesRaw)
        ? currenciesRaw
        : typeof currenciesRaw === "string" && currenciesRaw.trim()
        ? currenciesRaw.split(/[;|/]/).map((s) => s.trim())
        : undefined;

      const aliasesRaw = row.aliases || row.Aliases;
      const aliases = Array.isArray(aliasesRaw)
        ? aliasesRaw
        : typeof aliasesRaw === "string" && aliasesRaw.trim()
        ? aliasesRaw.split(/[;|]/).map((s) => s.trim())
        : [];

      const { record } = await addOrUpdateBankInstitution({
        officialName,
        country,
        region: row.region || row.Region || (country === "Bangladesh" ? "Bangladesh" : "Global Multi-Region"),
        category: row.category || row.Category || "Commercial Bank",
        officialWebsite: row.officialWebsite || row.website || row.Website || "",
        supportedCurrencies: currencies,
        verificationSource:
          row.verificationSource || row.source || "Admin CSV/JSON Import (Pending Verification)",
        regulatoryStatus: row.verified === true || row.verified === "true" ? "Verified Licensed" : "Under Review",
        verified: row.verified === true || row.verified === "true",
        payoutEligible: row.payoutEligible === true || row.payoutEligible === "true",
        aliases,
      });
      importedCount++;
      importedNames.push(record.officialName);
    } catch {
      skippedDuplicates++;
    }
  }

  return {
    importedCount,
    skippedDuplicates,
    totalDirectoryCount: runtimeBankDirectory.length,
    importedNames,
  };
}
