# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

https://norcal.neoserra.com/api/v1/events/{*Training Event Reference*}

# Methods Supported

HTTP Methods: GET, POST
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| conference | Edit | Training Event ID | Mandatory |
| is888 | Boolean | Is SBA888?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| title | Edit | Event Title | Mandatory |
| startDate | Date | Start Date | Mandatory |
| endDate | Date | End Date | Optional |
| date | Date | Reporting Date | Mandatory |
| deadline | DateTime | Registration Deadline | Optional |
| timeSpan | Edit | Scheduled Time(s) | Optional |
| hours | Duration | Total Hours | Mandatory |
| ecTimezone | Selection | Time Zone | Optional |
| nbrsessions | Integer | Number of Reportable Sessions | Mandatory |
| sessions | ConferenceSessions | SessionsRead-only field. | Optional |
| text | TextArea | Description | Optional |
| topics | MultipleSelection | Training TopicsThis field uses the following coded values:CodeDescription-(Undefined)GAccounting/BudgetAGAgricultureAIArtificial Intelligence (AI)UBusiness FinancingCBusiness PlanABusiness Start-up/PreplanningSBuy/Sell BusinessHCash Flow ManagementCOCommercialization+CCCredit CounselingFCustomer RelationsAP-CYBCybersecurity AssistanceDSDigital/Social Media Marketing and Skills+DDisaster Planning/RecoveryTeCommerceEOEmployee OwnershipVFranchisingKGovernment ContractingDHuman ResourcesLInternational TradeLALayoff AversionJLegal IssuesBManaging a BusinessMNManufacturingMAMarketingMBMinority Business CertificationOROrientationROtherOUOutreachIPPatents & Intellectual PropertyPFProcurement FairRLReal Estate/Leasing+CRisk ManagementRTRound-TableNRural Business Devel.AP-GIPSBIR/STTR/Other Innovation ProgramsGVSelling to GovernmentSASelling/SalesSDSmall Disadvantaged BusinessesSPSpecial ProgramsSCSubcontractingITax PlanningQTechnologyPVeterans Outreach Conf.WBWebsite BuildingOWoman-owned Businesses | Code | Description | - | (Undefined) | G | Accounting/Budget | AG | Agriculture | AI | Artificial Intelligence (AI) | U | Business Financing | C | Business Plan | A | Business Start-up/Preplanning | S | Buy/Sell Business | H | Cash Flow Management | CO | Commercialization | +CC | Credit Counseling | F | Customer Relations | AP-CYB | Cybersecurity Assistance | DS | Digital/Social Media Marketing and Skills | +D | Disaster Planning/Recovery | T | eCommerce | EO | Employee Ownership | V | Franchising | K | Government Contracting | D | Human Resources | L | International Trade | LA | Layoff Aversion | J | Legal Issues | B | Managing a Business | MN | Manufacturing | MA | Marketing | MB | Minority Business Certification | OR | Orientation | R | Other | OU | Outreach | IP | Patents & Intellectual Property | PF | Procurement Fair | RL | Real Estate/Leasing | +C | Risk Management | RT | Round-Table | N | Rural Business Devel. | AP-GIP | SBIR/STTR/Other Innovation Programs | GV | Selling to Government | SA | Selling/Sales | SD | Small Disadvantaged Businesses | SP | Special Programs | SC | Subcontracting | I | Tax Planning | Q | Technology | P | Veterans Outreach Conf. | WB | Website Building | O | Woman-owned Businesses | Optional |
| Code | Description |
| - | (Undefined) |
| G | Accounting/Budget |
| AG | Agriculture |
| AI | Artificial Intelligence (AI) |
| U | Business Financing |
| C | Business Plan |
| A | Business Start-up/Preplanning |
| S | Buy/Sell Business |
| H | Cash Flow Management |
| CO | Commercialization |
| +CC | Credit Counseling |
| F | Customer Relations |
| AP-CYB | Cybersecurity Assistance |
| DS | Digital/Social Media Marketing and Skills |
| +D | Disaster Planning/Recovery |
| T | eCommerce |
| EO | Employee Ownership |
| V | Franchising |
| K | Government Contracting |
| D | Human Resources |
| L | International Trade |
| LA | Layoff Aversion |
| J | Legal Issues |
| B | Managing a Business |
| MN | Manufacturing |
| MA | Marketing |
| MB | Minority Business Certification |
| OR | Orientation |
| R | Other |
| OU | Outreach |
| IP | Patents & Intellectual Property |
| PF | Procurement Fair |
| RL | Real Estate/Leasing |
| +C | Risk Management |
| RT | Round-Table |
| N | Rural Business Devel. |
| AP-GIP | SBIR/STTR/Other Innovation Programs |
| GV | Selling to Government |
| SA | Selling/Sales |
| SD | Small Disadvantaged Businesses |
| SP | Special Programs |
| SC | Subcontracting |
| I | Tax Planning |
| Q | Technology |
| P | Veterans Outreach Conf. |
| WB | Website Building |
| O | Woman-owned Businesses |
| topic | Selection | Primary Training TopicThis field uses the following coded values:CodeDescription-(Undefined)GAccounting/BudgetAGAgricultureAIArtificial Intelligence (AI)UBusiness FinancingCBusiness PlanABusiness Start-up/PreplanningSBuy/Sell BusinessHCash Flow ManagementCOCommercialization+CCCredit CounselingFCustomer RelationsAP-CYBCybersecurity AssistanceDSDigital/Social Media Marketing and Skills+DDisaster Planning/RecoveryTeCommerceEOEmployee OwnershipVFranchisingKGovernment ContractingDHuman ResourcesLInternational TradeLALayoff AversionJLegal IssuesBManaging a BusinessMNManufacturingMAMarketingMBMinority Business CertificationOROrientationROtherOUOutreachIPPatents & Intellectual PropertyPFProcurement FairRLReal Estate/Leasing+CRisk ManagementRTRound-TableNRural Business Devel.AP-GIPSBIR/STTR/Other Innovation ProgramsGVSelling to GovernmentSASelling/SalesSDSmall Disadvantaged BusinessesSPSpecial ProgramsSCSubcontractingITax PlanningQTechnologyPVeterans Outreach Conf.WBWebsite BuildingOWoman-owned Businesses | Code | Description | - | (Undefined) | G | Accounting/Budget | AG | Agriculture | AI | Artificial Intelligence (AI) | U | Business Financing | C | Business Plan | A | Business Start-up/Preplanning | S | Buy/Sell Business | H | Cash Flow Management | CO | Commercialization | +CC | Credit Counseling | F | Customer Relations | AP-CYB | Cybersecurity Assistance | DS | Digital/Social Media Marketing and Skills | +D | Disaster Planning/Recovery | T | eCommerce | EO | Employee Ownership | V | Franchising | K | Government Contracting | D | Human Resources | L | International Trade | LA | Layoff Aversion | J | Legal Issues | B | Managing a Business | MN | Manufacturing | MA | Marketing | MB | Minority Business Certification | OR | Orientation | R | Other | OU | Outreach | IP | Patents & Intellectual Property | PF | Procurement Fair | RL | Real Estate/Leasing | +C | Risk Management | RT | Round-Table | N | Rural Business Devel. | AP-GIP | SBIR/STTR/Other Innovation Programs | GV | Selling to Government | SA | Selling/Sales | SD | Small Disadvantaged Businesses | SP | Special Programs | SC | Subcontracting | I | Tax Planning | Q | Technology | P | Veterans Outreach Conf. | WB | Website Building | O | Woman-owned Businesses | Mandatory |
| Code | Description |
| - | (Undefined) |
| G | Accounting/Budget |
| AG | Agriculture |
| AI | Artificial Intelligence (AI) |
| U | Business Financing |
| C | Business Plan |
| A | Business Start-up/Preplanning |
| S | Buy/Sell Business |
| H | Cash Flow Management |
| CO | Commercialization |
| +CC | Credit Counseling |
| F | Customer Relations |
| AP-CYB | Cybersecurity Assistance |
| DS | Digital/Social Media Marketing and Skills |
| +D | Disaster Planning/Recovery |
| T | eCommerce |
| EO | Employee Ownership |
| V | Franchising |
| K | Government Contracting |
| D | Human Resources |
| L | International Trade |
| LA | Layoff Aversion |
| J | Legal Issues |
| B | Managing a Business |
| MN | Manufacturing |
| MA | Marketing |
| MB | Minority Business Certification |
| OR | Orientation |
| R | Other |
| OU | Outreach |
| IP | Patents & Intellectual Property |
| PF | Procurement Fair |
| RL | Real Estate/Leasing |
| +C | Risk Management |
| RT | Round-Table |
| N | Rural Business Devel. |
| AP-GIP | SBIR/STTR/Other Innovation Programs |
| GV | Selling to Government |
| SA | Selling/Sales |
| SD | Small Disadvantaged Businesses |
| SP | Special Programs |
| SC | Subcontracting |
| I | Tax Planning |
| Q | Technology |
| P | Veterans Outreach Conf. |
| WB | Website Building |
| O | Woman-owned Businesses |
| taTopic | Selection | SSBCI TA TopicThis field uses the following coded values:CodeDescription-(Undefined)SSBCI-19Accounting Services - OtherSSBCI-13Advisory services/training on accounting practices, recordkeeping, or accounting softwareSSBCI-12Digitizing financial recordsSSBCI-11Preparing audits, financial statements, or business recordsSSBCI-24Advising on factors that may impede access to business financingSSBCI-25Advising on financial managementSSBCI-22Assisting with applications for government small business programs, incl. preparing financial analysesSSBCI-21Assisting with the establishment of banking relationships or other financial servicesSSBCI-26Developing presentations to potential investors, financial models, and business plansSSBCI-29Financial advisory services - OtherSSBCI-23Identifying sources of credit, capital, grants, and other financingSSBCI-03Advising on, or preparing documents for, the business to enter into contractsSSBCI-01Assisting with business formation or adopting corporate governance documentsSSBCI-09Legal services - OtherSSBCI-05Legal services related to a transfer of ownership interests incl. ESOPsSSBCI-04Legal services related to the business obtaining capital from investorsSSBCI-02Obtaining needed registrations, licenses, filings, and certifications | Code | Description | - | (Undefined) | SSBCI-19 | Accounting Services - Other | SSBCI-13 | Advisory services/training on accounting practices, recordkeeping, or accounting software | SSBCI-12 | Digitizing financial records | SSBCI-11 | Preparing audits, financial statements, or business records | SSBCI-24 | Advising on factors that may impede access to business financing | SSBCI-25 | Advising on financial management | SSBCI-22 | Assisting with applications for government small business programs, incl. preparing financial analyses | SSBCI-21 | Assisting with the establishment of banking relationships or other financial services | SSBCI-26 | Developing presentations to potential investors, financial models, and business plans | SSBCI-29 | Financial advisory services - Other | SSBCI-23 | Identifying sources of credit, capital, grants, and other financing | SSBCI-03 | Advising on, or preparing documents for, the business to enter into contracts | SSBCI-01 | Assisting with business formation or adopting corporate governance documents | SSBCI-09 | Legal services - Other | SSBCI-05 | Legal services related to a transfer of ownership interests incl. ESOPs | SSBCI-04 | Legal services related to the business obtaining capital from investors | SSBCI-02 | Obtaining needed registrations, licenses, filings, and certifications | Optional |
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
| format | Selection | Program FormatThis field uses the following coded values:CodeDescription?(Undefined)CMulti-session CourseWOnline Course (Prerecorded)OOnline Meeting (Live)BWorkshop/Seminar | Code | Description | ? | (Undefined) | C | Multi-session Course | W | Online Course (Prerecorded) | O | Online Meeting (Live) | B | Workshop/Seminar | Mandatory |
| Code | Description |
| ? | (Undefined) |
| C | Multi-session Course |
| W | Online Course (Prerecorded) |
| O | Online Meeting (Live) |
| B | Workshop/Seminar |
| hybrid | Boolean | Hybrid event (online and in-person)This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| confstatus | Selection | StatusThis field uses the following coded values:CodeDescription-(Undefined)CACanceledCLClosedFUFullNANo eCenter SignupOPOpenPHPhone Registration RequiredPOPostponed | Code | Description | - | (Undefined) | CA | Canceled | CL | Closed | FU | Full | NA | No eCenter Signup | OP | Open | PH | Phone Registration Required | PO | Postponed | Optional |
| Code | Description |
| - | (Undefined) |
| CA | Canceled |
| CL | Closed |
| FU | Full |
| NA | No eCenter Signup |
| OP | Open |
| PH | Phone Registration Required |
| PO | Postponed |
| maxAttendees | Integer | Maximum Attendees | Optional |
| allowWaitlist | Boolean | Allow Waitlist?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| signupUrl | URL | Signup URL | Optional |
| onlineUrl | URL | Online Training URL | Optional |
| centerId | Center | Center | Mandatory |
| matchmaker | Selection | Matchmaker EventThis field uses the following coded values:CodeDescriptionCCo-HostedHHostedNNo | Code | Description | C | Co-Hosted | H | Hosted | N | No | Optional |
| Code | Description |
| C | Co-Hosted |
| H | Hosted |
| N | No |
| wasHosted | Boolean | Hosted by Center?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| wassponser | Boolean | Participated by Center?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| inKindLoc | Boolean | Location was an in-kind donation?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| coPoc | Edit | Cosponsor POC(s) | Optional |
| resources | MultipleSelection | Partner(s) ParticipatingThis field uses the following coded values:CodeDescriptionRES_DODAPEX AcceleratorRES_COMMChamber of CommerceRES_EDUEducational InstitutionRES_FPORGFor-profit OrganizationRES_NATNative American CenterRES_OTROnline Training ResourceRES_GOVTOther Government AgencyRES_SBASBA District OfficeRES_SBAOFCSBA OfficeRES_SCORESCORERES_TRADTrade or Professional SocietyRES_USDAUSDARES_VBOCVBOCRES_WBCWBC | Code | Description | RES_DOD | APEX Accelerator | RES_COMM | Chamber of Commerce | RES_EDU | Educational Institution | RES_FPORG | For-profit Organization | RES_NAT | Native American Center | RES_OTR | Online Training Resource | RES_GOVT | Other Government Agency | RES_SBA | SBA District Office | RES_SBAOFC | SBA Office | RES_SCORE | SCORE | RES_TRAD | Trade or Professional Society | RES_USDA | USDA | RES_VBOC | VBOC | RES_WBC | WBC | Mandatory |
| Code | Description |
| RES_DOD | APEX Accelerator |
| RES_COMM | Chamber of Commerce |
| RES_EDU | Educational Institution |
| RES_FPORG | For-profit Organization |
| RES_NAT | Native American Center |
| RES_OTR | Online Training Resource |
| RES_GOVT | Other Government Agency |
| RES_SBA | SBA District Office |
| RES_SBAOFC | SBA Office |
| RES_SCORE | SCORE |
| RES_TRAD | Trade or Professional Society |
| RES_USDA | USDA |
| RES_VBOC | VBOC |
| RES_WBC | WBC |
| poc | Edit | Point of Contact | Optional |
| pocEmail | EmailAddress | Point of Contact Email Address | Mandatory |
| pocPhone | PhoneNumber | Point of Contact Phone Number | Optional |
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
| unit | Selection | Unit HistoryThis field uses the following coded values:CodeDescriptionANewBOngoing | Code | Description | A | New | B | Ongoing | Optional |
| Code | Description |
| A | New |
| B | Ongoing |
| sbaInitiative | MultipleSelection | SBA InitiativeThis field uses the following coded values:CodeDescription3Affordable Care Act5Clusters6Economy, Energy and Environment4Emerging Leaders1Encore Entrepreneurship8National Export Initiative99Other2Start Young7Transition Assistance Program Entrepreneurship Track (Boots to Business) | Code | Description | 3 | Affordable Care Act | 5 | Clusters | 6 | Economy, Energy and Environment | 4 | Emerging Leaders | 1 | Encore Entrepreneurship | 8 | National Export Initiative | 99 | Other | 2 | Start Young | 7 | Transition Assistance Program Entrepreneurship Track (Boots to Business) | Optional |
| Code | Description |
| 3 | Affordable Care Act |
| 5 | Clusters |
| 6 | Economy, Energy and Environment |
| 4 | Emerging Leaders |
| 1 | Encore Entrepreneurship |
| 8 | National Export Initiative |
| 99 | Other |
| 2 | Start Young |
| 7 | Transition Assistance Program Entrepreneurship Track (Boots to Business) |
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
| isReportable | Boolean | Reportable?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| location | Address | Location | Optional |
| locCity | Edit | Training Address City | Mandatory |
| locState | Selection | Training Address StateThis field uses the following coded values:CodeDescription-(Undefined)ALAlabamaAKAlaskaASAmerican SamoaAZArizonaARArkansasCACaliforniaCOColoradoCTConnecticutDEDelawareFMFederated States of MicronesiaFLFloridaGAGeorgiaGUGuamHIHawaiiIDIdahoILIllinoisINIndianaIAIowaKSKansasKYKentuckyLALouisianaMEMaineMHMarshall IslandsMDMarylandMAMassachusettsMIMichiganMNMinnesotaMSMississippiMOMissouriMTMontanaNENebraskaNVNevadaNHNew HampshireNJNew JerseyNMNew MexicoNYNew YorkNCNorth CarolinaNDNorth DakotaMPNorthern Mariana IslandsOHOhioOKOklahomaOROregonPWPalauPAPennsylvaniaPRPuerto RicoRIRhode IslandSCSouth CarolinaSDSouth DakotaTNTennesseeTXTexasVIUS Virgin IslandsUTUtahVTVermontVAVirginiaWAWashingtonDCWashington DCWVWest VirginiaWIWisconsinWYWyoming | Code | Description | - | (Undefined) | AL | Alabama | AK | Alaska | AS | American Samoa | AZ | Arizona | AR | Arkansas | CA | California | CO | Colorado | CT | Connecticut | DE | Delaware | FM | Federated States of Micronesia | FL | Florida | GA | Georgia | GU | Guam | HI | Hawaii | ID | Idaho | IL | Illinois | IN | Indiana | IA | Iowa | KS | Kansas | KY | Kentucky | LA | Louisiana | ME | Maine | MH | Marshall Islands | MD | Maryland | MA | Massachusetts | MI | Michigan | MN | Minnesota | MS | Mississippi | MO | Missouri | MT | Montana | NE | Nebraska | NV | Nevada | NH | New Hampshire | NJ | New Jersey | NM | New Mexico | NY | New York | NC | North Carolina | ND | North Dakota | MP | Northern Mariana Islands | OH | Ohio | OK | Oklahoma | OR | Oregon | PW | Palau | PA | Pennsylvania | PR | Puerto Rico | RI | Rhode Island | SC | South Carolina | SD | South Dakota | TN | Tennessee | TX | Texas | VI | US Virgin Islands | UT | Utah | VT | Vermont | VA | Virginia | WA | Washington | DC | Washington DC | WV | West Virginia | WI | Wisconsin | WY | Wyoming | Mandatory |
| Code | Description |
| - | (Undefined) |
| AL | Alabama |
| AK | Alaska |
| AS | American Samoa |
| AZ | Arizona |
| AR | Arkansas |
| CA | California |
| CO | Colorado |
| CT | Connecticut |
| DE | Delaware |
| FM | Federated States of Micronesia |
| FL | Florida |
| GA | Georgia |
| GU | Guam |
| HI | Hawaii |
| ID | Idaho |
| IL | Illinois |
| IN | Indiana |
| IA | Iowa |
| KS | Kansas |
| KY | Kentucky |
| LA | Louisiana |
| ME | Maine |
| MH | Marshall Islands |
| MD | Maryland |
| MA | Massachusetts |
| MI | Michigan |
| MN | Minnesota |
| MS | Mississippi |
| MO | Missouri |
| MT | Montana |
| NE | Nebraska |
| NV | Nevada |
| NH | New Hampshire |
| NJ | New Jersey |
| NM | New Mexico |
| NY | New York |
| NC | North Carolina |
| ND | North Dakota |
| MP | Northern Mariana Islands |
| OH | Ohio |
| OK | Oklahoma |
| OR | Oregon |
| PW | Palau |
| PA | Pennsylvania |
| PR | Puerto Rico |
| RI | Rhode Island |
| SC | South Carolina |
| SD | South Dakota |
| TN | Tennessee |
| TX | Texas |
| VI | US Virgin Islands |
| UT | Utah |
| VT | Vermont |
| VA | Virginia |
| WA | Washington |
| DC | Washington DC |
| WV | West Virginia |
| WI | Wisconsin |
| WY | Wyoming |
| locZip | Edit | Training Address ZIP Code | Mandatory |
| county | AddressAdm2 | County | Mandatory |
| locCountry | Selection | Training Address CountryThis field uses the following coded values:CodeDescription-(Undefined)AFAfghanistanAXAland IslandsALAlbaniaDZAlgeriaADAndorraAOAngolaAIAnguillaAQAntarcticaAGAntigua and BarbudaARArgentinaAMArmeniaAWArubaAUAustraliaATAustriaAZAzerbaijanBSBahamasBHBahrainBDBangladeshBBBarbadosBYBelarusBEBelgiumBZBelizeBJBeninBMBermudaBTBhutanBOBoliviaBQBonaire/St. Eustatius/SabaBABosnia and HerzegovinaBWBotswanaBVBouvet IslandBRBrazilIOBritish Indian Ocean Terr.BNBrunei DarussalamBGBulgariaBFBurkina FasoBIBurundiKHCambodiaCMCameroonCACanadaCVCape VerdeKYCayman IslandsCFCentral African RepublicTDChadCLChileCNChinaCXChristmas IslandCCCocos (Keeling) IslandCOColombiaKMComorosCGCongoCDCongo, Dem. Rep. of theCKCook IslandsCRCosta RicaCICote d'IvoireHRCroatiaCUCubaCWCuracaoCYCyprusCZCzech RepublicDKDenmarkDJDjiboutiDMDominicaDODominican RepublicECEcuadorEGEgyptSVEl SalvadorGQEquatorial GuineaEREritreaEEEstoniaSZEswatiniETEthiopiaFKFalkland IslandsFOFaroe IslandsFJFijiFIFinlandFRFranceGFFrench GuianaPFFrench PolynesiaTFFrench Southern TerritoriesGAGabonGMGambiaGEGeorgiaDEGermanyGHGhanaGIGibraltarGRGreeceGLGreenlandGDGrenadaGPGuadeloupeGTGuatemalaGGGuernseyGNGuineaGWGuinea-BissauGYGuyanaHTHaitiHMHeard/McDonald IslandsHNHondurasHKHong KongHUHungaryISIcelandINIndiaIDIndonesiaIRIran, Islamic Republic ofIQIraqIEIrelandIMIsle of ManILIsraelITItalyJMJamaicaJPJapanJEJerseyJOJordanKZKazakhstanKEKenyaKIKiribatiKPKorea, DPR (North)KRKorea, Republic of (South)KWKuwaitKGKyrgyzstanLALaosLVLatviaLBLebanonLSLesothoLRLiberiaLYLibyaLILiechtensteinLTLithuaniaLULuxembourgMOMacaoMGMadagascarMWMalawiMYMalaysiaMVMaldivesMLMaliMTMaltaMHMarshall IslandsMQMartiniqueMRMauritaniaMUMauritiusYTMayotteMXMexicoFMMicronesiaMDMoldovaMCMonacoMNMongoliaMEMontenegroMSMontserratMAMoroccoMZMozambiqueMMMyanmar or BurmaNANamibiaNRNauruNPNepalNLNetherlandsNCNew CaledoniaNZNew ZealandNINicaraguaNENigerNGNigeriaNUNiueNFNorfolk IslandMKNorth MacedoniaNONorwayOMOmanPKPakistanPWPalauPSPalestinian TerritoryPAPanamaPGPapua New GuineaPYParaguayPEPeruPHPhilippinesPNPitcairnPLPolandPTPortugalQAQatarREReunionRORomaniaRURussian FederationRWRwandaBLSaint BarthelemySHSaint HelenaKNSaint Kitts and NevisLCSaint LuciaSXSaint Maarten (Dutch part)MFSaint Martin (French Part)PMSaint Pierre and MiquelonVCSaint Vincent/GrenadinesWSSamoaSMSan MarinoSTSao Tome and PrincipeSASaudi ArabiaSNSenegalRSSerbiaSCSeychellesSLSierra LeoneSGSingaporeSKSlovakiaSISloveniaSBSoloman IslandsSOSomaliaZASouth AfricaGSSouth Georgia/Sandwich Is.SSSouth SudanESSpainLKSri LankaSDSudanSRSurinameSJSvalbard and Jan MayenSESwedenCHSwitzerlandSYSyrian Arab RepublicTWTaiwanTJTajikistanTZTanzaniaTHThailandTLTimor-LesteTGTogoTKTokelauTOTongaTTTrinidad and TobagoTNTunisiaTRTurkeyTMTurkmenistanTCTurks and Caicos IslandsTVTuvaluUGUgandaUAUkraineAEUnited Arab EmiratesGBUnited KingdomUSUnited StatesUYUruguayUZUzbekistanVUVanuatuVAVatican CityVEVenezuelaVNVietnamVGVirgin Islands, BritishWFWallis and FutunaEHWestern SaharaYEYemenZMZambiaZWZimbabwe | Code | Description | - | (Undefined) | AF | Afghanistan | AX | Aland Islands | AL | Albania | DZ | Algeria | AD | Andorra | AO | Angola | AI | Anguilla | AQ | Antarctica | AG | Antigua and Barbuda | AR | Argentina | AM | Armenia | AW | Aruba | AU | Australia | AT | Austria | AZ | Azerbaijan | BS | Bahamas | BH | Bahrain | BD | Bangladesh | BB | Barbados | BY | Belarus | BE | Belgium | BZ | Belize | BJ | Benin | BM | Bermuda | BT | Bhutan | BO | Bolivia | BQ | Bonaire/St. Eustatius/Saba | BA | Bosnia and Herzegovina | BW | Botswana | BV | Bouvet Island | BR | Brazil | IO | British Indian Ocean Terr. | BN | Brunei Darussalam | BG | Bulgaria | BF | Burkina Faso | BI | Burundi | KH | Cambodia | CM | Cameroon | CA | Canada | CV | Cape Verde | KY | Cayman Islands | CF | Central African Republic | TD | Chad | CL | Chile | CN | China | CX | Christmas Island | CC | Cocos (Keeling) Island | CO | Colombia | KM | Comoros | CG | Congo | CD | Congo, Dem. Rep. of the | CK | Cook Islands | CR | Costa Rica | CI | Cote d'Ivoire | HR | Croatia | CU | Cuba | CW | Curacao | CY | Cyprus | CZ | Czech Republic | DK | Denmark | DJ | Djibouti | DM | Dominica | DO | Dominican Republic | EC | Ecuador | EG | Egypt | SV | El Salvador | GQ | Equatorial Guinea | ER | Eritrea | EE | Estonia | SZ | Eswatini | ET | Ethiopia | FK | Falkland Islands | FO | Faroe Islands | FJ | Fiji | FI | Finland | FR | France | GF | French Guiana | PF | French Polynesia | TF | French Southern Territories | GA | Gabon | GM | Gambia | GE | Georgia | DE | Germany | GH | Ghana | GI | Gibraltar | GR | Greece | GL | Greenland | GD | Grenada | GP | Guadeloupe | GT | Guatemala | GG | Guernsey | GN | Guinea | GW | Guinea-Bissau | GY | Guyana | HT | Haiti | HM | Heard/McDonald Islands | HN | Honduras | HK | Hong Kong | HU | Hungary | IS | Iceland | IN | India | ID | Indonesia | IR | Iran, Islamic Republic of | IQ | Iraq | IE | Ireland | IM | Isle of Man | IL | Israel | IT | Italy | JM | Jamaica | JP | Japan | JE | Jersey | JO | Jordan | KZ | Kazakhstan | KE | Kenya | KI | Kiribati | KP | Korea, DPR (North) | KR | Korea, Republic of (South) | KW | Kuwait | KG | Kyrgyzstan | LA | Laos | LV | Latvia | LB | Lebanon | LS | Lesotho | LR | Liberia | LY | Libya | LI | Liechtenstein | LT | Lithuania | LU | Luxembourg | MO | Macao | MG | Madagascar | MW | Malawi | MY | Malaysia | MV | Maldives | ML | Mali | MT | Malta | MH | Marshall Islands | MQ | Martinique | MR | Mauritania | MU | Mauritius | YT | Mayotte | MX | Mexico | FM | Micronesia | MD | Moldova | MC | Monaco | MN | Mongolia | ME | Montenegro | MS | Montserrat | MA | Morocco | MZ | Mozambique | MM | Myanmar or Burma | NA | Namibia | NR | Nauru | NP | Nepal | NL | Netherlands | NC | New Caledonia | NZ | New Zealand | NI | Nicaragua | NE | Niger | NG | Nigeria | NU | Niue | NF | Norfolk Island | MK | North Macedonia | NO | Norway | OM | Oman | PK | Pakistan | PW | Palau | PS | Palestinian Territory | PA | Panama | PG | Papua New Guinea | PY | Paraguay | PE | Peru | PH | Philippines | PN | Pitcairn | PL | Poland | PT | Portugal | QA | Qatar | RE | Reunion | RO | Romania | RU | Russian Federation | RW | Rwanda | BL | Saint Barthelemy | SH | Saint Helena | KN | Saint Kitts and Nevis | LC | Saint Lucia | SX | Saint Maarten (Dutch part) | MF | Saint Martin (French Part) | PM | Saint Pierre and Miquelon | VC | Saint Vincent/Grenadines | WS | Samoa | SM | San Marino | ST | Sao Tome and Principe | SA | Saudi Arabia | SN | Senegal | RS | Serbia | SC | Seychelles | SL | Sierra Leone | SG | Singapore | SK | Slovakia | SI | Slovenia | SB | Soloman Islands | SO | Somalia | ZA | South Africa | GS | South Georgia/Sandwich Is. | SS | South Sudan | ES | Spain | LK | Sri Lanka | SD | Sudan | SR | Suriname | SJ | Svalbard and Jan Mayen | SE | Sweden | CH | Switzerland | SY | Syrian Arab Republic | TW | Taiwan | TJ | Tajikistan | TZ | Tanzania | TH | Thailand | TL | Timor-Leste | TG | Togo | TK | Tokelau | TO | Tonga | TT | Trinidad and Tobago | TN | Tunisia | TR | Turkey | TM | Turkmenistan | TC | Turks and Caicos Islands | TV | Tuvalu | UG | Uganda | UA | Ukraine | AE | United Arab Emirates | GB | United Kingdom | US | United States | UY | Uruguay | UZ | Uzbekistan | VU | Vanuatu | VA | Vatican City | VE | Venezuela | VN | Vietnam | VG | Virgin Islands, British | WF | Wallis and Futuna | EH | Western Sahara | YE | Yemen | ZM | Zambia | ZW | Zimbabwe | Optional |
| Code | Description |
| - | (Undefined) |
| AF | Afghanistan |
| AX | Aland Islands |
| AL | Albania |
| DZ | Algeria |
| AD | Andorra |
| AO | Angola |
| AI | Anguilla |
| AQ | Antarctica |
| AG | Antigua and Barbuda |
| AR | Argentina |
| AM | Armenia |
| AW | Aruba |
| AU | Australia |
| AT | Austria |
| AZ | Azerbaijan |
| BS | Bahamas |
| BH | Bahrain |
| BD | Bangladesh |
| BB | Barbados |
| BY | Belarus |
| BE | Belgium |
| BZ | Belize |
| BJ | Benin |
| BM | Bermuda |
| BT | Bhutan |
| BO | Bolivia |
| BQ | Bonaire/St. Eustatius/Saba |
| BA | Bosnia and Herzegovina |
| BW | Botswana |
| BV | Bouvet Island |
| BR | Brazil |
| IO | British Indian Ocean Terr. |
| BN | Brunei Darussalam |
| BG | Bulgaria |
| BF | Burkina Faso |
| BI | Burundi |
| KH | Cambodia |
| CM | Cameroon |
| CA | Canada |
| CV | Cape Verde |
| KY | Cayman Islands |
| CF | Central African Republic |
| TD | Chad |
| CL | Chile |
| CN | China |
| CX | Christmas Island |
| CC | Cocos (Keeling) Island |
| CO | Colombia |
| KM | Comoros |
| CG | Congo |
| CD | Congo, Dem. Rep. of the |
| CK | Cook Islands |
| CR | Costa Rica |
| CI | Cote d'Ivoire |
| HR | Croatia |
| CU | Cuba |
| CW | Curacao |
| CY | Cyprus |
| CZ | Czech Republic |
| DK | Denmark |
| DJ | Djibouti |
| DM | Dominica |
| DO | Dominican Republic |
| EC | Ecuador |
| EG | Egypt |
| SV | El Salvador |
| GQ | Equatorial Guinea |
| ER | Eritrea |
| EE | Estonia |
| SZ | Eswatini |
| ET | Ethiopia |
| FK | Falkland Islands |
| FO | Faroe Islands |
| FJ | Fiji |
| FI | Finland |
| FR | France |
| GF | French Guiana |
| PF | French Polynesia |
| TF | French Southern Territories |
| GA | Gabon |
| GM | Gambia |
| GE | Georgia |
| DE | Germany |
| GH | Ghana |
| GI | Gibraltar |
| GR | Greece |
| GL | Greenland |
| GD | Grenada |
| GP | Guadeloupe |
| GT | Guatemala |
| GG | Guernsey |
| GN | Guinea |
| GW | Guinea-Bissau |
| GY | Guyana |
| HT | Haiti |
| HM | Heard/McDonald Islands |
| HN | Honduras |
| HK | Hong Kong |
| HU | Hungary |
| IS | Iceland |
| IN | India |
| ID | Indonesia |
| IR | Iran, Islamic Republic of |
| IQ | Iraq |
| IE | Ireland |
| IM | Isle of Man |
| IL | Israel |
| IT | Italy |
| JM | Jamaica |
| JP | Japan |
| JE | Jersey |
| JO | Jordan |
| KZ | Kazakhstan |
| KE | Kenya |
| KI | Kiribati |
| KP | Korea, DPR (North) |
| KR | Korea, Republic of (South) |
| KW | Kuwait |
| KG | Kyrgyzstan |
| LA | Laos |
| LV | Latvia |
| LB | Lebanon |
| LS | Lesotho |
| LR | Liberia |
| LY | Libya |
| LI | Liechtenstein |
| LT | Lithuania |
| LU | Luxembourg |
| MO | Macao |
| MG | Madagascar |
| MW | Malawi |
| MY | Malaysia |
| MV | Maldives |
| ML | Mali |
| MT | Malta |
| MH | Marshall Islands |
| MQ | Martinique |
| MR | Mauritania |
| MU | Mauritius |
| YT | Mayotte |
| MX | Mexico |
| FM | Micronesia |
| MD | Moldova |
| MC | Monaco |
| MN | Mongolia |
| ME | Montenegro |
| MS | Montserrat |
| MA | Morocco |
| MZ | Mozambique |
| MM | Myanmar or Burma |
| NA | Namibia |
| NR | Nauru |
| NP | Nepal |
| NL | Netherlands |
| NC | New Caledonia |
| NZ | New Zealand |
| NI | Nicaragua |
| NE | Niger |
| NG | Nigeria |
| NU | Niue |
| NF | Norfolk Island |
| MK | North Macedonia |
| NO | Norway |
| OM | Oman |
| PK | Pakistan |
| PW | Palau |
| PS | Palestinian Territory |
| PA | Panama |
| PG | Papua New Guinea |
| PY | Paraguay |
| PE | Peru |
| PH | Philippines |
| PN | Pitcairn |
| PL | Poland |
| PT | Portugal |
| QA | Qatar |
| RE | Reunion |
| RO | Romania |
| RU | Russian Federation |
| RW | Rwanda |
| BL | Saint Barthelemy |
| SH | Saint Helena |
| KN | Saint Kitts and Nevis |
| LC | Saint Lucia |
| SX | Saint Maarten (Dutch part) |
| MF | Saint Martin (French Part) |
| PM | Saint Pierre and Miquelon |
| VC | Saint Vincent/Grenadines |
| WS | Samoa |
| SM | San Marino |
| ST | Sao Tome and Principe |
| SA | Saudi Arabia |
| SN | Senegal |
| RS | Serbia |
| SC | Seychelles |
| SL | Sierra Leone |
| SG | Singapore |
| SK | Slovakia |
| SI | Slovenia |
| SB | Soloman Islands |
| SO | Somalia |
| ZA | South Africa |
| GS | South Georgia/Sandwich Is. |
| SS | South Sudan |
| ES | Spain |
| LK | Sri Lanka |
| SD | Sudan |
| SR | Suriname |
| SJ | Svalbard and Jan Mayen |
| SE | Sweden |
| CH | Switzerland |
| SY | Syrian Arab Republic |
| TW | Taiwan |
| TJ | Tajikistan |
| TZ | Tanzania |
| TH | Thailand |
| TL | Timor-Leste |
| TG | Togo |
| TK | Tokelau |
| TO | Tonga |
| TT | Trinidad and Tobago |
| TN | Tunisia |
| TR | Turkey |
| TM | Turkmenistan |
| TC | Turks and Caicos Islands |
| TV | Tuvalu |
| UG | Uganda |
| UA | Ukraine |
| AE | United Arab Emirates |
| GB | United Kingdom |
| US | United States |
| UY | Uruguay |
| UZ | Uzbekistan |
| VU | Vanuatu |
| VA | Vatican City |
| VE | Venezuela |
| VN | Vietnam |
| VG | Virgin Islands, British |
| WF | Wallis and Futuna |
| EH | Western Sahara |
| YE | Yemen |
| ZM | Zambia |
| ZW | Zimbabwe |
| congDistFed | Representative | Federal Congressional District | Mandatory |
| houseDistState | Representative | State Representative District | Mandatory |
| senateDistState | Representative | State Senate District | Mandatory |
| paidcurriculum | Boolean | Paid Curriculum?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| ectrPublic | Selection | Post this event on eCenter?This field uses the following coded values:CodeDescriptionNNoPRPrivate (Unlisted)PUPublic | Code | Description | N | No | PR | Private (Unlisted) | PU | Public | Optional |
| Code | Description |
| N | No |
| PR | Private (Unlisted) |
| PU | Public |
| publicCenterId | Center | Publishing Center | Optional |
| ecSignupInfoLevel | Selection | Event registration information requiredThis field uses the following coded values:CodeDescription0(Use center's selection)1Contact2Client3Client + Agreement | Code | Description | 0 | (Use center's selection) | 1 | Contact | 2 | Client | 3 | Client + Agreement | Optional |
| Code | Description |
| 0 | (Use center's selection) |
| 1 | Contact |
| 2 | Client |
| 3 | Client + Agreement |
| ecPayeeId | Selection | eCenter PayeeThis field uses the following coded values:CodeDescription0(No selection)27Mendocino WBC26North Coast CASHnet 2022 25Santa Cruz SBDC19Z-DO NOT USE (CASHnet 3 (North Coast))9Z-DO NOT USE (Marin-Old)18Z-DO NOT USE (North Coast 2) CASHNET16Z-DO NOT USE (North Coast Old)4Z-DO NOT USE (North Coast)15Z-DO NOT USE (North Coast)14Z-DO NOT USE (Solano)7Z-DO NOT USE (Solano-Old)12Z-DO NOT USE (Solano-Old)13Z-DO NOT USE (Solano-Old)24Z-DO NOT USE Capital Region Paypal2Z-DO NOT USE Central Coast11Z-DO NOT USE Marin SBDC23Z-DO NOT USE Sac Sierra paypal21Z-DO NOT USE San Mateo SBDC22Z-DO NOT USE Shasta Paypal20z_DO NOT USE CASHnet 4 (North Coast)6z_DO NOT USE Mendocino SBDC | Code | Description | 0 | (No selection) | 27 | Mendocino WBC | 26 | North Coast CASHnet 2022 | 25 | Santa Cruz SBDC | 19 | Z-DO NOT USE (CASHnet 3 (North Coast)) | 9 | Z-DO NOT USE (Marin-Old) | 18 | Z-DO NOT USE (North Coast 2) CASHNET | 16 | Z-DO NOT USE (North Coast Old) | 4 | Z-DO NOT USE (North Coast) | 15 | Z-DO NOT USE (North Coast) | 14 | Z-DO NOT USE (Solano) | 7 | Z-DO NOT USE (Solano-Old) | 12 | Z-DO NOT USE (Solano-Old) | 13 | Z-DO NOT USE (Solano-Old) | 24 | Z-DO NOT USE Capital Region Paypal | 2 | Z-DO NOT USE Central Coast | 11 | Z-DO NOT USE Marin SBDC | 23 | Z-DO NOT USE Sac Sierra paypal | 21 | Z-DO NOT USE San Mateo SBDC | 22 | Z-DO NOT USE Shasta Paypal | 20 | z_DO NOT USE CASHnet 4 (North Coast) | 6 | z_DO NOT USE Mendocino SBDC | Mandatory |
| Code | Description |
| 0 | (No selection) |
| 27 | Mendocino WBC |
| 26 | North Coast CASHnet 2022 |
| 25 | Santa Cruz SBDC |
| 19 | Z-DO NOT USE (CASHnet 3 (North Coast)) |
| 9 | Z-DO NOT USE (Marin-Old) |
| 18 | Z-DO NOT USE (North Coast 2) CASHNET |
| 16 | Z-DO NOT USE (North Coast Old) |
| 4 | Z-DO NOT USE (North Coast) |
| 15 | Z-DO NOT USE (North Coast) |
| 14 | Z-DO NOT USE (Solano) |
| 7 | Z-DO NOT USE (Solano-Old) |
| 12 | Z-DO NOT USE (Solano-Old) |
| 13 | Z-DO NOT USE (Solano-Old) |
| 24 | Z-DO NOT USE Capital Region Paypal |
| 2 | Z-DO NOT USE Central Coast |
| 11 | Z-DO NOT USE Marin SBDC |
| 23 | Z-DO NOT USE Sac Sierra paypal |
| 21 | Z-DO NOT USE San Mateo SBDC |
| 22 | Z-DO NOT USE Shasta Paypal |
| 20 | z_DO NOT USE CASHnet 4 (North Coast) |
| 6 | z_DO NOT USE Mendocino SBDC |
| srsetId1 | Selection | Pre-event SurveyThis field uses the following coded values:CodeDescription0(No selection)3063Post Event Survey3060Pre-Survey - Food Based Business 3007Santa Cruz SBDC 2020 Training Event Survey3059SVSBDC Client Affirmation of Business Success (Training)2001Training Evaluation Survey | Code | Description | 0 | (No selection) | 3063 | Post Event Survey | 3060 | Pre-Survey - Food Based Business | 3007 | Santa Cruz SBDC 2020 Training Event Survey | 3059 | SVSBDC Client Affirmation of Business Success (Training) | 2001 | Training Evaluation Survey | Optional |
| Code | Description |
| 0 | (No selection) |
| 3063 | Post Event Survey |
| 3060 | Pre-Survey - Food Based Business |
| 3007 | Santa Cruz SBDC 2020 Training Event Survey |
| 3059 | SVSBDC Client Affirmation of Business Success (Training) |
| 2001 | Training Evaluation Survey |
| srsetId2 | Selection | Post-event SurveyThis field uses the following coded values:CodeDescription0(No selection)3063Post Event Survey3060Pre-Survey - Food Based Business 3007Santa Cruz SBDC 2020 Training Event Survey3059SVSBDC Client Affirmation of Business Success (Training)2001Training Evaluation Survey | Code | Description | 0 | (No selection) | 3063 | Post Event Survey | 3060 | Pre-Survey - Food Based Business | 3007 | Santa Cruz SBDC 2020 Training Event Survey | 3059 | SVSBDC Client Affirmation of Business Success (Training) | 2001 | Training Evaluation Survey | Optional |
| Code | Description |
| 0 | (No selection) |
| 3063 | Post Event Survey |
| 3060 | Pre-Survey - Food Based Business |
| 3007 | Santa Cruz SBDC 2020 Training Event Survey |
| 3059 | SVSBDC Client Affirmation of Business Success (Training) |
| 2001 | Training Evaluation Survey |
| instructions | TextArea | Public Instructions | Optional |
| registrantInstructions | TextArea | Attendee Instructions | Optional |
| autoTotal | Boolean | Neoserra will calculate all fee and attendee demographic data based upon attendees listedThis is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| addAttTotal | Integer | Attendees, Unlisted | Optional |
| attInbus | Integer | Attendees, In Business | Mandatory |
| attMin | Integer | Attendees, Total Minorities | Mandatory |
| attNotInbus | Integer | Attendees, Not In Business | Mandatory |
| attAsn | Integer | Attendees, Asian/Asian-American | Mandatory |
| attBus | Integer | Attendees, Business Owners | Mandatory |
| attAfr | Integer | Attendees, African/African-American | Mandatory |
| attStp | Integer | Attendees, Start-up Businesses | Mandatory |
| attNat | Integer | Attendees, Native American/Alaskan Native | Mandatory |
| attDis | Integer | Attendees, Disabled | Mandatory |
| attHwi | Integer | Attendees, Hawaiian/Pacific Islanders | Mandatory |
| attWom | Integer | Attendees, Female | Mandatory |
| attMale | Integer | Attendees, Male | Mandatory |
| attWhi | Integer | Attendees, Caucasian/White | Mandatory |
| attVets | Integer | Attendees, Veterans | Mandatory |
| attHsp | Integer | Attendees, Hispanic/Latino | Mandatory |
| attSdis | Integer | Attendees, Service-Disabled Veteran | Mandatory |
| attRsv | Integer | Attendees, Reservist/Nat'l Guard | Mandatory |
| attMsp | Integer | Attendees, Military Spouse | Mandatory |
| attMrace | Integer | Attendees, Multiracial | Mandatory |
| attLgbtq | Integer | Attendees, LGBTQ+ | Mandatory |
| attTot | Integer | Attendees, Total | Mandatory |
| noshowTot | Integer | Total "no shows" | Mandatory |
| amounts | ConferenceAmounts | Fee Types | Optional |
| grossAttendees | Currency | Total Attendee  Income | Mandatory |
| grossNoshow | Currency | Total "No Show"  Income | Mandatory |
| grossOther | Currency | Other Income | Mandatory |
| gross | Currency | Total Gross Income | Mandatory |
| grossSba | Currency | Distribution to SBA | Mandatory |
| grossScor | Currency | Distribution to SCORE | Mandatory |
| grossSbdc | Currency | Distribution to SBDC/VBOC/WBC | Mandatory |
| grossCo | Currency | Distribution to Cosponsor | Mandatory |
| cost | Currency | Event Expenses | Optional |
| notes | TextArea | Event Notes | Optional |