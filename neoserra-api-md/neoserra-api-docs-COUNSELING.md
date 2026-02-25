# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

https://norcal.neoserra.com/api/v1/counseling/{*Counseling Reference*}

# Methods Supported

HTTP Methods: GET, POST
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| clients | ClientsList | Clients | Optional |
| contacts | ContactsList | Contacts | Optional |
| counselors | CounselorList | Counselors | Optional |
| contact | Duration | Contact Time | Mandatory |
| date | Date | Session Date | Mandatory |
| type | Selection | Session TypeThis field uses the following coded values:CodeDescription-(Undefined)AAdministrativeFFollow-upIInitial/New | Code | Description | - | (Undefined) | A | Administrative | F | Follow-up | I | Initial/New | Mandatory |
| Code | Description |
| - | (Undefined) |
| A | Administrative |
| F | Follow-up |
| I | Initial/New |
| contactType | Selection | Contact TypeThis field uses the following coded values:CodeDescription-(Undefined)ONCenter Site (face-to-face)ATClient Site (face-to-face)EMOnline (email or chat)PHPhoneVCVideo-conferencing (face-to-face) | Code | Description | - | (Undefined) | ON | Center Site (face-to-face) | AT | Client Site (face-to-face) | EM | Online (email or chat) | PH | Phone | VC | Video-conferencing (face-to-face) | Mandatory |
| Code | Description |
| - | (Undefined) |
| ON | Center Site (face-to-face) |
| AT | Client Site (face-to-face) |
| EM | Online (email or chat) |
| PH | Phone |
| VC | Video-conferencing (face-to-face) |
| sbaArea | Selection | Counseling AreaThis field uses the following coded values:CodeDescription?(Undefined)AIArtificial Intelligence (AI)TOAttend Training Event Only5Business Accounting/BudgetBPBusiness Plan12Buy/Sell Business6Cash Flow ManagementNGFLCredit Counseling or Financial LiteracyWFCrowd-FundingCRCustomer RelationsAP-CYBCybersecurity AssistanceDPDisaster Planning/RecoveryECeCommerce8Engineering R&D2Financing/CapitalFRFranchising4Government Contracting9Human Resources/Managing EmployeesIAAIntake Assessment20Intellectual Property11International TradeI1Investment Funding7Managing a Business3Marketing/SalesOTOtherRMRisk ManagementAP-GIPSBIR/STTR/Other Innovation ProgramsSMSocial Media1Start-up AssistanceAP-STState/Local Registration SystemTATalent AcquisitionT1Technology Commercialization10Technology/Computers | Code | Description | ? | (Undefined) | AI | Artificial Intelligence (AI) | TO | Attend Training Event Only | 5 | Business Accounting/Budget | BP | Business Plan | 12 | Buy/Sell Business | 6 | Cash Flow Management | NGFL | Credit Counseling or Financial Literacy | WF | Crowd-Funding | CR | Customer Relations | AP-CYB | Cybersecurity Assistance | DP | Disaster Planning/Recovery | EC | eCommerce | 8 | Engineering R&D | 2 | Financing/Capital | FR | Franchising | 4 | Government Contracting | 9 | Human Resources/Managing Employees | IAA | Intake Assessment | 20 | Intellectual Property | 11 | International Trade | I1 | Investment Funding | 7 | Managing a Business | 3 | Marketing/Sales | OT | Other | RM | Risk Management | AP-GIP | SBIR/STTR/Other Innovation Programs | SM | Social Media | 1 | Start-up Assistance | AP-ST | State/Local Registration System | TA | Talent Acquisition | T1 | Technology Commercialization | 10 | Technology/Computers | Mandatory |
| Code | Description |
| ? | (Undefined) |
| AI | Artificial Intelligence (AI) |
| TO | Attend Training Event Only |
| 5 | Business Accounting/Budget |
| BP | Business Plan |
| 12 | Buy/Sell Business |
| 6 | Cash Flow Management |
| NGFL | Credit Counseling or Financial Literacy |
| WF | Crowd-Funding |
| CR | Customer Relations |
| AP-CYB | Cybersecurity Assistance |
| DP | Disaster Planning/Recovery |
| EC | eCommerce |
| 8 | Engineering R&D |
| 2 | Financing/Capital |
| FR | Franchising |
| 4 | Government Contracting |
| 9 | Human Resources/Managing Employees |
| IAA | Intake Assessment |
| 20 | Intellectual Property |
| 11 | International Trade |
| I1 | Investment Funding |
| 7 | Managing a Business |
| 3 | Marketing/Sales |
| OT | Other |
| RM | Risk Management |
| AP-GIP | SBIR/STTR/Other Innovation Programs |
| SM | Social Media |
| 1 | Start-up Assistance |
| AP-ST | State/Local Registration System |
| TA | Talent Acquisition |
| T1 | Technology Commercialization |
| 10 | Technology/Computers |
| sbaAreaExtra | MultipleSelection | Additional AreasThis field uses the following coded values:CodeDescription?(Undefined)AIArtificial Intelligence (AI)TOAttend Training Event Only5Business Accounting/BudgetBPBusiness Plan12Buy/Sell Business6Cash Flow ManagementNGFLCredit Counseling or Financial LiteracyWFCrowd-FundingCRCustomer RelationsAP-CYBCybersecurity AssistanceDPDisaster Planning/RecoveryECeCommerce8Engineering R&D2Financing/CapitalFRFranchising4Government Contracting9Human Resources/Managing EmployeesIAAIntake Assessment20Intellectual Property11International TradeI1Investment Funding7Managing a Business3Marketing/SalesOTOtherRMRisk ManagementAP-GIPSBIR/STTR/Other Innovation ProgramsSMSocial Media1Start-up AssistanceAP-STState/Local Registration SystemTATalent AcquisitionT1Technology Commercialization10Technology/Computers | Code | Description | ? | (Undefined) | AI | Artificial Intelligence (AI) | TO | Attend Training Event Only | 5 | Business Accounting/Budget | BP | Business Plan | 12 | Buy/Sell Business | 6 | Cash Flow Management | NGFL | Credit Counseling or Financial Literacy | WF | Crowd-Funding | CR | Customer Relations | AP-CYB | Cybersecurity Assistance | DP | Disaster Planning/Recovery | EC | eCommerce | 8 | Engineering R&D | 2 | Financing/Capital | FR | Franchising | 4 | Government Contracting | 9 | Human Resources/Managing Employees | IAA | Intake Assessment | 20 | Intellectual Property | 11 | International Trade | I1 | Investment Funding | 7 | Managing a Business | 3 | Marketing/Sales | OT | Other | RM | Risk Management | AP-GIP | SBIR/STTR/Other Innovation Programs | SM | Social Media | 1 | Start-up Assistance | AP-ST | State/Local Registration System | TA | Talent Acquisition | T1 | Technology Commercialization | 10 | Technology/Computers | Optional |
| Code | Description |
| ? | (Undefined) |
| AI | Artificial Intelligence (AI) |
| TO | Attend Training Event Only |
| 5 | Business Accounting/Budget |
| BP | Business Plan |
| 12 | Buy/Sell Business |
| 6 | Cash Flow Management |
| NGFL | Credit Counseling or Financial Literacy |
| WF | Crowd-Funding |
| CR | Customer Relations |
| AP-CYB | Cybersecurity Assistance |
| DP | Disaster Planning/Recovery |
| EC | eCommerce |
| 8 | Engineering R&D |
| 2 | Financing/Capital |
| FR | Franchising |
| 4 | Government Contracting |
| 9 | Human Resources/Managing Employees |
| IAA | Intake Assessment |
| 20 | Intellectual Property |
| 11 | International Trade |
| I1 | Investment Funding |
| 7 | Managing a Business |
| 3 | Marketing/Sales |
| OT | Other |
| RM | Risk Management |
| AP-GIP | SBIR/STTR/Other Innovation Programs |
| SM | Social Media |
| 1 | Start-up Assistance |
| AP-ST | State/Local Registration System |
| TA | Talent Acquisition |
| T1 | Technology Commercialization |
| 10 | Technology/Computers |
| sbaAreaAddl | Selection | Additional AssistanceThis field uses the following coded values:CodeDescription?(Undefined)8A8A CertificationAQAcquisitionABAdvertising/BrandingBKBookkeepingBABBusiness Accounting/BudgetingBBusiness PlanBSBuying/Selling a BusinessCTCCertifications/ContractingCGCompensation PlanningCMCost ManagementCRCredit RepairCYCybersecurity AssistanceDADisaster AssistanceECMeCommerceEGEconomic GardeningERDEngineering R&DEAEnvironmental AssistanceEXSCExpansion/ScalingEXPExportingFIFinancial AnalysisFRAFranchisingFLAFunding/Loan AssistanceGCGovernment CertificationGSGSA ScheduleHRHR/Managing EmployeesHZHUBZoneIPIntellectual PropertyLALayoff AversionLSLegal StructureLCLicensureMABManaging a BusinessMAManufacturingMSMarketing/SalesNPNew Product DevelopmentPWAProposal Writing AssistancePRPublic RelationsRERelocation AssistanceDRestructuring DebtRBRural Business DevelopmentSBSBIRSMMSocial Media MarketingSMSolicitation MatchingSOSolicitation ReviewSTUAStart Up AssistanceINVSupply Chain/Inventory ManagementTETechnology/ComputersTSTrade ShowVCVeteran Certification (CVE)WBWOSB/EDWOSB | Code | Description | ? | (Undefined) | 8A | 8A Certification | AQ | Acquisition | AB | Advertising/Branding | BK | Bookkeeping | BAB | Business Accounting/Budgeting | B | Business Plan | BS | Buying/Selling a Business | CTC | Certifications/Contracting | CG | Compensation Planning | CM | Cost Management | CR | Credit Repair | CY | Cybersecurity Assistance | DA | Disaster Assistance | ECM | eCommerce | EG | Economic Gardening | ERD | Engineering R&D | EA | Environmental Assistance | EXSC | Expansion/Scaling | EXP | Exporting | FI | Financial Analysis | FRA | Franchising | FLA | Funding/Loan Assistance | GC | Government Certification | GS | GSA Schedule | HR | HR/Managing Employees | HZ | HUBZone | IP | Intellectual Property | LA | Layoff Aversion | LS | Legal Structure | LC | Licensure | MAB | Managing a Business | MA | Manufacturing | MS | Marketing/Sales | NP | New Product Development | PWA | Proposal Writing Assistance | PR | Public Relations | RE | Relocation Assistance | D | Restructuring Debt | RB | Rural Business Development | SB | SBIR | SMM | Social Media Marketing | SM | Solicitation Matching | SO | Solicitation Review | STUA | Start Up Assistance | INV | Supply Chain/Inventory Management | TE | Technology/Computers | TS | Trade Show | VC | Veteran Certification (CVE) | WB | WOSB/EDWOSB | Optional |
| Code | Description |
| ? | (Undefined) |
| 8A | 8A Certification |
| AQ | Acquisition |
| AB | Advertising/Branding |
| BK | Bookkeeping |
| BAB | Business Accounting/Budgeting |
| B | Business Plan |
| BS | Buying/Selling a Business |
| CTC | Certifications/Contracting |
| CG | Compensation Planning |
| CM | Cost Management |
| CR | Credit Repair |
| CY | Cybersecurity Assistance |
| DA | Disaster Assistance |
| ECM | eCommerce |
| EG | Economic Gardening |
| ERD | Engineering R&D |
| EA | Environmental Assistance |
| EXSC | Expansion/Scaling |
| EXP | Exporting |
| FI | Financial Analysis |
| FRA | Franchising |
| FLA | Funding/Loan Assistance |
| GC | Government Certification |
| GS | GSA Schedule |
| HR | HR/Managing Employees |
| HZ | HUBZone |
| IP | Intellectual Property |
| LA | Layoff Aversion |
| LS | Legal Structure |
| LC | Licensure |
| MAB | Managing a Business |
| MA | Manufacturing |
| MS | Marketing/Sales |
| NP | New Product Development |
| PWA | Proposal Writing Assistance |
| PR | Public Relations |
| RE | Relocation Assistance |
| D | Restructuring Debt |
| RB | Rural Business Development |
| SB | SBIR |
| SMM | Social Media Marketing |
| SM | Solicitation Matching |
| SO | Solicitation Review |
| STUA | Start Up Assistance |
| INV | Supply Chain/Inventory Management |
| TE | Technology/Computers |
| TS | Trade Show |
| VC | Veteran Certification (CVE) |
| WB | WOSB/EDWOSB |
| covid19 | Boolean | COVID-19 related?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| text | Edit | Subject | Mandatory |
| language | Selection | Language UsedThis field uses the following coded values:CodeDescription-(Undefined)ARArabicHYArmenianYUECantonese/Yue ChineseZHChineseDRDariENEnglishFRFrenchDEGermanHIHindiHMHmongITItalianJAJapaneseKOKoreanLOLaoLVLatvianCMNMandarin ChinesePAPanjabi; PunjabiFAPersianPSPushto; PashtoRURussianSPSpanishSVSwedishTLTagalogTHThaiVIVietnamese | Code | Description | - | (Undefined) | AR | Arabic | HY | Armenian | YUE | Cantonese/Yue Chinese | ZH | Chinese | DR | Dari | EN | English | FR | French | DE | German | HI | Hindi | HM | Hmong | IT | Italian | JA | Japanese | KO | Korean | LO | Lao | LV | Latvian | CMN | Mandarin Chinese | PA | Panjabi; Punjabi | FA | Persian | PS | Pushto; Pashto | RU | Russian | SP | Spanish | SV | Swedish | TL | Tagalog | TH | Thai | VI | Vietnamese | Optional |
| Code | Description |
| - | (Undefined) |
| AR | Arabic |
| HY | Armenian |
| YUE | Cantonese/Yue Chinese |
| ZH | Chinese |
| DR | Dari |
| EN | English |
| FR | French |
| DE | German |
| HI | Hindi |
| HM | Hmong |
| IT | Italian |
| JA | Japanese |
| KO | Korean |
| LO | Lao |
| LV | Latvian |
| CMN | Mandarin Chinese |
| PA | Panjabi; Punjabi |
| FA | Persian |
| PS | Pushto; Pashto |
| RU | Russian |
| SP | Spanish |
| SV | Swedish |
| TL | Tagalog |
| TH | Thai |
| VI | Vietnamese |
| fundarea | Selection | Funding SourceThis field uses the following coded values:CodeDescription?(Undefined)}AHEAD FoodEAlameda County4ARPA&ARPA RT@CAMEOCCDBG/City of Alameda+City of Antioch.City of Brentwood<City of ConcordQCity of PittsburgCTPCity of Sacramento cTAP[City of San Leandro^FAST CALPLead PRIMELLocal*Noyo PilotOOther0ProBiz Wells]Program IncomeSJCSan Joaquin CountySSBA+SSSBCI3State (CIP)ITAPP2TAP PRIME!USDA2WBC EPZWDBP1West PRIME | Code | Description | ? | (Undefined) | } | AHEAD Food | E | Alameda County | 4 | ARPA | & | ARPA RT | @ | CAMEO | C | CDBG | / | City of Alameda | + | City of Antioch | . | City of Brentwood | < | City of Concord | Q | City of Pittsburg | CTP | City of Sacramento cTAP | [ | City of San Leandro | ^ | FAST CA | LP | Lead PRIME | L | Local | * | Noyo Pilot | O | Other | 0 | ProBiz Wells | ] | Program Income | SJC | San Joaquin County | S | SBA | +S | SSBCI | 3 | State (CIP) | I | TAP | P2 | TAP PRIME | ! | USDA | 2 | WBC EP | Z | WDB | P1 | West PRIME | Mandatory |
| Code | Description |
| ? | (Undefined) |
| } | AHEAD Food |
| E | Alameda County |
| 4 | ARPA |
| & | ARPA RT |
| @ | CAMEO |
| C | CDBG |
| / | City of Alameda |
| + | City of Antioch |
| . | City of Brentwood |
| < | City of Concord |
| Q | City of Pittsburg |
| CTP | City of Sacramento cTAP |
| [ | City of San Leandro |
| ^ | FAST CA |
| LP | Lead PRIME |
| L | Local |
| * | Noyo Pilot |
| O | Other |
| 0 | ProBiz Wells |
| ] | Program Income |
| SJC | San Joaquin County |
| S | SBA |
| +S | SSBCI |
| 3 | State (CIP) |
| I | TAP |
| P2 | TAP PRIME |
| ! | USDA |
| 2 | WBC EP |
| Z | WDB |
| P1 | West PRIME |
| femaEnergy | Selection | Sub-funding SourceThis field uses the following coded values:CodeDescription-(Undefined)23PA2303Portable Assistance (PA2303) | Code | Description | - | (Undefined) | 23PA2303 | Portable Assistance (PA2303) | Optional |
| Code | Description |
| - | (Undefined) |
| 23PA2303 | Portable Assistance (PA2303) |
| ssbci | Boolean | SSBCI?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| ssbciTaArea | Selection | Legal/Accounting/Financial ServicesThis field uses the following coded values:CodeDescription-(Undefined)SSBCI-19Accounting Services - OtherSSBCI-13Advisory services/training on accounting practices, recordkeeping, or accounting softwareSSBCI-12Digitizing financial recordsSSBCI-11Preparing audits, financial statements, or business recordsSSBCI-24Advising on factors that may impede access to business financingSSBCI-25Advising on financial managementSSBCI-22Assisting with applications for government small business programs, incl. preparing financial analysesSSBCI-21Assisting with the establishment of banking relationships or other financial servicesSSBCI-26Developing presentations to potential investors, financial models, and business plansSSBCI-29Financial advisory services - OtherSSBCI-23Identifying sources of credit, capital, grants, and other financingSSBCI-03Advising on, or preparing documents for, the business to enter into contractsSSBCI-01Assisting with business formation or adopting corporate governance documentsSSBCI-09Legal services - OtherSSBCI-05Legal services related to a transfer of ownership interests incl. ESOPsSSBCI-04Legal services related to the business obtaining capital from investorsSSBCI-02Obtaining needed registrations, licenses, filings, and certifications | Code | Description | - | (Undefined) | SSBCI-19 | Accounting Services - Other | SSBCI-13 | Advisory services/training on accounting practices, recordkeeping, or accounting software | SSBCI-12 | Digitizing financial records | SSBCI-11 | Preparing audits, financial statements, or business records | SSBCI-24 | Advising on factors that may impede access to business financing | SSBCI-25 | Advising on financial management | SSBCI-22 | Assisting with applications for government small business programs, incl. preparing financial analyses | SSBCI-21 | Assisting with the establishment of banking relationships or other financial services | SSBCI-26 | Developing presentations to potential investors, financial models, and business plans | SSBCI-29 | Financial advisory services - Other | SSBCI-23 | Identifying sources of credit, capital, grants, and other financing | SSBCI-03 | Advising on, or preparing documents for, the business to enter into contracts | SSBCI-01 | Assisting with business formation or adopting corporate governance documents | SSBCI-09 | Legal services - Other | SSBCI-05 | Legal services related to a transfer of ownership interests incl. ESOPs | SSBCI-04 | Legal services related to the business obtaining capital from investors | SSBCI-02 | Obtaining needed registrations, licenses, filings, and certifications | Optional |
| Code | Description |
| - | (Undefined) |
| SSBCI-19 | Accounting Services - Other |
| SSBCI-13 | Advisory services/training on accounting practices, recordkeeping, or accounting software |
| SSBCI-12 | Digitizing financial records |
| SSBCI-11 | Preparing audits, financial statements, or business records |
| SSBCI-24 | Advising on factors that may impede access to business financing |
| SSBCI-25 | Advising on financial management |
| SSBCI-22 | Assisting with applications for government small business programs, incl. preparing financial analyses |
| SSBCI-21 | Assisting with the establishment of banking relationships or other financial services |
| SSBCI-26 | Developing presentations to potential investors, financial models, and business plans |
| SSBCI-29 | Financial advisory services - Other |
| SSBCI-23 | Identifying sources of credit, capital, grants, and other financing |
| SSBCI-03 | Advising on, or preparing documents for, the business to enter into contracts |
| SSBCI-01 | Assisting with business formation or adopting corporate governance documents |
| SSBCI-09 | Legal services - Other |
| SSBCI-05 | Legal services related to a transfer of ownership interests incl. ESOPs |
| SSBCI-04 | Legal services related to the business obtaining capital from investors |
| SSBCI-02 | Obtaining needed registrations, licenses, filings, and certifications |
| ssbciSbPgm | Selection | Small Business Program ReferralThis field uses the following coded values:CodeDescription-(Undefined)SSBCI-3Other federal small business programSSBCI-4Other small business programSSBCI-2SSBCI-supported equity/venture capital programSSBCI-1SSBCI-supported lending program | Code | Description | - | (Undefined) | SSBCI-3 | Other federal small business program | SSBCI-4 | Other small business program | SSBCI-2 | SSBCI-supported equity/venture capital program | SSBCI-1 | SSBCI-supported lending program | Optional |
| Code | Description |
| - | (Undefined) |
| SSBCI-3 | Other federal small business program |
| SSBCI-4 | Other small business program |
| SSBCI-2 | SSBCI-supported equity/venture capital program |
| SSBCI-1 | SSBCI-supported lending program |
| ssbciSbPgmName | Edit | Name of Small Business Program | Optional |
| ssbciRefTo | Selection | Referral to Source of CapitalThis field uses the following coded values:CodeDescription-(Undefined)SSBCI-13Angel investor or angel fundSSBCI-5CDFI bank, thrift, or depository institution holding companySSBCI-8CDFI loan fundSSBCI-17CDFI venture capital fundSSBCI-16Corporate venture capital fundSSBCI-14For-profit venture capital fundSSBCI-12Growth equity capital fundSSBCI-6Non-CDFI community bankSSBCI-9Non-CDFI credit unionSSBCI-11Non-CDFI debt or loan fundSSBCI-10Nonbank lender or nonbank payment services providerSSBCI-15Nonprofit venture capital fund or venture/entrepreneurial development organizationSSBCI-19OtherSSBCI-7Other bank, thrift, or depository institution holding companySSBCI-18University/technology transfer office | Code | Description | - | (Undefined) | SSBCI-13 | Angel investor or angel fund | SSBCI-5 | CDFI bank, thrift, or depository institution holding company | SSBCI-8 | CDFI loan fund | SSBCI-17 | CDFI venture capital fund | SSBCI-16 | Corporate venture capital fund | SSBCI-14 | For-profit venture capital fund | SSBCI-12 | Growth equity capital fund | SSBCI-6 | Non-CDFI community bank | SSBCI-9 | Non-CDFI credit union | SSBCI-11 | Non-CDFI debt or loan fund | SSBCI-10 | Nonbank lender or nonbank payment services provider | SSBCI-15 | Nonprofit venture capital fund or venture/entrepreneurial development organization | SSBCI-19 | Other | SSBCI-7 | Other bank, thrift, or depository institution holding company | SSBCI-18 | University/technology transfer office | Optional |
| Code | Description |
| - | (Undefined) |
| SSBCI-13 | Angel investor or angel fund |
| SSBCI-5 | CDFI bank, thrift, or depository institution holding company |
| SSBCI-8 | CDFI loan fund |
| SSBCI-17 | CDFI venture capital fund |
| SSBCI-16 | Corporate venture capital fund |
| SSBCI-14 | For-profit venture capital fund |
| SSBCI-12 | Growth equity capital fund |
| SSBCI-6 | Non-CDFI community bank |
| SSBCI-9 | Non-CDFI credit union |
| SSBCI-11 | Non-CDFI debt or loan fund |
| SSBCI-10 | Nonbank lender or nonbank payment services provider |
| SSBCI-15 | Nonprofit venture capital fund or venture/entrepreneurial development organization |
| SSBCI-19 | Other |
| SSBCI-7 | Other bank, thrift, or depository institution holding company |
| SSBCI-18 | University/technology transfer office |
| ssbciRefName | Edit | Name of Other Lender or Investor | Optional |
| centerId | Center | CenterThis field uses the following coded values:CodeDescription110[TEST] Lenders Database107Aaron Phelps Test Center 12377Access SBDC39Butte College SBDC97California Black Chamber - Affiliate71East Bay SBDC105Lake County SBDC36Marin SBDC24Mendocino SBDC26Mendocino WBC63NorCal SBDC EATS13North Coast SBDC23Northern California SBDC Regional Lead Center108Pitch Globally - Affiliate47Regional Training72Sacramento Valley SBDC15San Francisco SBDC68San Joaquin SBDC69San Mateo SBDC9Santa Cruz SBDC75SBDCtech @ UCB Haas 40Shasta-Cascade SBDC43Sierra SBDC70Silicon Valley SBDC94Silicon Valley Successes - Affiliate18Solano-Napa SBDC73Sonoma SBDC34Tech Futures Group38The Finance Center76z_CA Hispanic SBDC (FY22-25)11z_Napa-Sonoma SBDC (closed 12/31/21)14z_North Coast SBDC (Crescent City)60z_The Inclusivity Project (FY21-25)109~AIU87~Beauty Boss84~CA Shop Small106~ProBiz86~San Francisco Grant Program96~SBDC Health85~Source Diverse Source Local111~Startup World Cup 2025 | Code | Description | 110 | [TEST] Lenders Database | 107 | Aaron Phelps Test Center 123 | 77 | Access SBDC | 39 | Butte College SBDC | 97 | California Black Chamber - Affiliate | 71 | East Bay SBDC | 105 | Lake County SBDC | 36 | Marin SBDC | 24 | Mendocino SBDC | 26 | Mendocino WBC | 63 | NorCal SBDC EATS | 13 | North Coast SBDC | 23 | Northern California SBDC Regional Lead Center | 108 | Pitch Globally - Affiliate | 47 | Regional Training | 72 | Sacramento Valley SBDC | 15 | San Francisco SBDC | 68 | San Joaquin SBDC | 69 | San Mateo SBDC | 9 | Santa Cruz SBDC | 75 | SBDCtech @ UCB Haas | 40 | Shasta-Cascade SBDC | 43 | Sierra SBDC | 70 | Silicon Valley SBDC | 94 | Silicon Valley Successes - Affiliate | 18 | Solano-Napa SBDC | 73 | Sonoma SBDC | 34 | Tech Futures Group | 38 | The Finance Center | 76 | z_CA Hispanic SBDC (FY22-25) | 11 | z_Napa-Sonoma SBDC (closed 12/31/21) | 14 | z_North Coast SBDC (Crescent City) | 60 | z_The Inclusivity Project (FY21-25) | 109 | ~AIU | 87 | ~Beauty Boss | 84 | ~CA Shop Small | 106 | ~ProBiz | 86 | ~San Francisco Grant Program | 96 | ~SBDC Health | 85 | ~Source Diverse Source Local | 111 | ~Startup World Cup 2025 | Mandatory |
| Code | Description |
| 110 | [TEST] Lenders Database |
| 107 | Aaron Phelps Test Center 123 |
| 77 | Access SBDC |
| 39 | Butte College SBDC |
| 97 | California Black Chamber - Affiliate |
| 71 | East Bay SBDC |
| 105 | Lake County SBDC |
| 36 | Marin SBDC |
| 24 | Mendocino SBDC |
| 26 | Mendocino WBC |
| 63 | NorCal SBDC EATS |
| 13 | North Coast SBDC |
| 23 | Northern California SBDC Regional Lead Center |
| 108 | Pitch Globally - Affiliate |
| 47 | Regional Training |
| 72 | Sacramento Valley SBDC |
| 15 | San Francisco SBDC |
| 68 | San Joaquin SBDC |
| 69 | San Mateo SBDC |
| 9 | Santa Cruz SBDC |
| 75 | SBDCtech @ UCB Haas |
| 40 | Shasta-Cascade SBDC |
| 43 | Sierra SBDC |
| 70 | Silicon Valley SBDC |
| 94 | Silicon Valley Successes - Affiliate |
| 18 | Solano-Napa SBDC |
| 73 | Sonoma SBDC |
| 34 | Tech Futures Group |
| 38 | The Finance Center |
| 76 | z_CA Hispanic SBDC (FY22-25) |
| 11 | z_Napa-Sonoma SBDC (closed 12/31/21) |
| 14 | z_North Coast SBDC (Crescent City) |
| 60 | z_The Inclusivity Project (FY21-25) |
| 109 | ~AIU |
| 87 | ~Beauty Boss |
| 84 | ~CA Shop Small |
| 106 | ~ProBiz |
| 86 | ~San Francisco Grant Program |
| 96 | ~SBDC Health |
| 85 | ~Source Diverse Source Local |
| 111 | ~Startup World Cup 2025 |
| memo | TextArea | Session Notes | Optional |
| nbrpeople | Integer | Number of People Attending | Mandatory |
| refto | Selection | Referral ToThis field uses the following coded values:CodeDescription?(Undefined)AAccountantPAPEX AcceleratorBABank of AmericaFBusiness License OfficeITCenter for International Trade DevHChamber of CommerceUCollege/UniversityCCounselingAGDepartment of Agriculture (USDA)DCDepartment of Commerce/Commercial ServicesDSDepartment of State (DOS)DADisaster AssistanceEXExport/Import Bank (EIB)FILFederal Innovation LaboratoryGGovernment AgencyLELender or Funding SourceLLender/BankELocal Economic Development Center (EDC)NRNon-Profit ResourcesOOtherOPOverseas Private Investment Corporation (OPIC)SWSawyer CenterSBACASBA Capital Access (PPP)SBADASBA Disaster AssistanceISBA Office of International Trade (OIT)RSCORESSmall Business Administration District Office (SBA)DSmall Business Development Center (SBDC)STState Trade AgencyLOCALState/Local COVID-19 AssistanceTTraining SeminarEAU.S. Export Assistance Center (USEAC)TRU.S. Trade & Development Agency (USTDA)VBVeteran Business Outreach CenterWCWomen's Business Center (WBC)CTEWorkforce Development/Career and Technical Education (CTE) | Code | Description | ? | (Undefined) | A | Accountant | P | APEX Accelerator | BA | Bank of America | F | Business License Office | IT | Center for International Trade Dev | H | Chamber of Commerce | U | College/University | C | Counseling | AG | Department of Agriculture (USDA) | DC | Department of Commerce/Commercial Services | DS | Department of State (DOS) | DA | Disaster Assistance | EX | Export/Import Bank (EIB) | FIL | Federal Innovation Laboratory | G | Government Agency | LE | Lender or Funding Source | L | Lender/Bank | E | Local Economic Development Center (EDC) | NR | Non-Profit Resources | O | Other | OP | Overseas Private Investment Corporation (OPIC) | SW | Sawyer Center | SBACA | SBA Capital Access (PPP) | SBADA | SBA Disaster Assistance | I | SBA Office of International Trade (OIT) | R | SCORE | S | Small Business Administration District Office (SBA) | D | Small Business Development Center (SBDC) | ST | State Trade Agency | LOCAL | State/Local COVID-19 Assistance | T | Training Seminar | EA | U.S. Export Assistance Center (USEAC) | TR | U.S. Trade & Development Agency (USTDA) | VB | Veteran Business Outreach Center | WC | Women's Business Center (WBC) | CTE | Workforce Development/Career and Technical Education (CTE) | Optional |
| Code | Description |
| ? | (Undefined) |
| A | Accountant |
| P | APEX Accelerator |
| BA | Bank of America |
| F | Business License Office |
| IT | Center for International Trade Dev |
| H | Chamber of Commerce |
| U | College/University |
| C | Counseling |
| AG | Department of Agriculture (USDA) |
| DC | Department of Commerce/Commercial Services |
| DS | Department of State (DOS) |
| DA | Disaster Assistance |
| EX | Export/Import Bank (EIB) |
| FIL | Federal Innovation Laboratory |
| G | Government Agency |
| LE | Lender or Funding Source |
| L | Lender/Bank |
| E | Local Economic Development Center (EDC) |
| NR | Non-Profit Resources |
| O | Other |
| OP | Overseas Private Investment Corporation (OPIC) |
| SW | Sawyer Center |
| SBACA | SBA Capital Access (PPP) |
| SBADA | SBA Disaster Assistance |
| I | SBA Office of International Trade (OIT) |
| R | SCORE |
| S | Small Business Administration District Office (SBA) |
| D | Small Business Development Center (SBDC) |
| ST | State Trade Agency |
| LOCAL | State/Local COVID-19 Assistance |
| T | Training Seminar |
| EA | U.S. Export Assistance Center (USEAC) |
| TR | U.S. Trade & Development Agency (USTDA) |
| VB | Veteran Business Outreach Center |
| WC | Women's Business Center (WBC) |
| CTE | Workforce Development/Career and Technical Education (CTE) |
| reftoDesc | Edit | Referral To Description | Optional |
| isReportable | Boolean | Reportable?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
|  | ReadOnly |  | Optional |
| pft | Edit | For program/funding tracking (optional) | Optional |
| disastreco | MultipleSelection | Disaster Recovery TypeThis field uses the following coded values:CodeDescriptionAir Quality IssueAir Quality IssueCoastal ErosionCoastal ErosionCyberattackCyberattackDroughtDroughtEarthquakeEarthquakeExtreme Heat WaveExtreme Heat WaveFloodingFloodingHealth PandemicHealth PandemicHousing Market CrisisHousing Market CrisisInflationInflationInterest Rate IncreaseInterest Rate IncreaseLabor ShortageLabor ShortageLandslideLandslideLocal Industry ShiftLocal Industry ShiftPests and Agricultural DiseasePests and Agricultural DiseaseRecessions and Economic DownturnRecessions and Economic DownturnRolling Blackouts/Planned Power OutageRolling Blackouts/Planned Power OutageSevere StormSevere StormSupply Chain DisruptionSupply Chain DisruptionTax Policy ChangeTax Policy ChangeTrade Wars or Tariff ChangeTrade Wars or Tariff ChangeTsunamiTsunamiUninsured LossUninsured LossWildfireWildfire | Code | Description | Air Quality Issue | Air Quality Issue | Coastal Erosion | Coastal Erosion | Cyberattack | Cyberattack | Drought | Drought | Earthquake | Earthquake | Extreme Heat Wave | Extreme Heat Wave | Flooding | Flooding | Health Pandemic | Health Pandemic | Housing Market Crisis | Housing Market Crisis | Inflation | Inflation | Interest Rate Increase | Interest Rate Increase | Labor Shortage | Labor Shortage | Landslide | Landslide | Local Industry Shift | Local Industry Shift | Pests and Agricultural Disease | Pests and Agricultural Disease | Recessions and Economic Downturn | Recessions and Economic Downturn | Rolling Blackouts/Planned Power Outage | Rolling Blackouts/Planned Power Outage | Severe Storm | Severe Storm | Supply Chain Disruption | Supply Chain Disruption | Tax Policy Change | Tax Policy Change | Trade Wars or Tariff Change | Trade Wars or Tariff Change | Tsunami | Tsunami | Uninsured Loss | Uninsured Loss | Wildfire | Wildfire | Optional |
| Code | Description |
| Air Quality Issue | Air Quality Issue |
| Coastal Erosion | Coastal Erosion |
| Cyberattack | Cyberattack |
| Drought | Drought |
| Earthquake | Earthquake |
| Extreme Heat Wave | Extreme Heat Wave |
| Flooding | Flooding |
| Health Pandemic | Health Pandemic |
| Housing Market Crisis | Housing Market Crisis |
| Inflation | Inflation |
| Interest Rate Increase | Interest Rate Increase |
| Labor Shortage | Labor Shortage |
| Landslide | Landslide |
| Local Industry Shift | Local Industry Shift |
| Pests and Agricultural Disease | Pests and Agricultural Disease |
| Recessions and Economic Downturn | Recessions and Economic Downturn |
| Rolling Blackouts/Planned Power Outage | Rolling Blackouts/Planned Power Outage |
| Severe Storm | Severe Storm |
| Supply Chain Disruption | Supply Chain Disruption |
| Tax Policy Change | Tax Policy Change |
| Trade Wars or Tariff Change | Trade Wars or Tariff Change |
| Tsunami | Tsunami |
| Uninsured Loss | Uninsured Loss |
| Wildfire | Wildfire |
| break | ReadOnly | carrie | Optional |
| crei | MultipleSelection | EI Pipeline / reported during sessionThis field uses the following coded values:CodeDescriptionBusiness StartBusiness StartCapital InfusionCapital InfusionJobs CreatedJobs CreatedSales/Gross RevenueSales/Gross Revenue | Code | Description | Business Start | Business Start | Capital Infusion | Capital Infusion | Jobs Created | Jobs Created | Sales/Gross Revenue | Sales/Gross Revenue | Optional |
| Code | Description |
| Business Start | Business Start |
| Capital Infusion | Capital Infusion |
| Jobs Created | Jobs Created |
| Sales/Gross Revenue | Sales/Gross Revenue |
| eipamt | Currency | EI Pipeline / $ amount capital funding reported during session | Optional |
| nexusclng | Edit | For NEXUS use only | Optional |