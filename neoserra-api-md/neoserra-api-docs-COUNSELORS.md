# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

https://norcal.neoserra.com/api/v1/counselors/{*Counselor Reference*}

# Methods Supported

HTTP Methods: GET, POST
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| first | Edit | First Name | Optional |
| mi | Edit | MI | Optional |
| last | Edit | Last Name | Optional |
| counsel | Edit | ID | Optional |
| status | Selection | StatusThis field uses the following coded values:CodeDescriptionAActiveIInactive | Code | Description | A | Active | I | Inactive | Optional |
| Code | Description |
| A | Active |
| I | Inactive |
| resource | Selection | Resource TypeThis field uses the following coded values:CodeDescription?(Undefined)7ConsultantDIRDirector4Employee10InstructorIInternNCNon-Counseling ContractorSAStaff AdvisorSISummer InternUSUndergraduate Student | Code | Description | ? | (Undefined) | 7 | Consultant | DIR | Director | 4 | Employee | 10 | Instructor | I | Intern | NC | Non-Counseling Contractor | SA | Staff Advisor | SI | Summer Intern | US | Undergraduate Student | Optional |
| Code | Description |
| ? | (Undefined) |
| 7 | Consultant |
| DIR | Director |
| 4 | Employee |
| 10 | Instructor |
| I | Intern |
| NC | Non-Counseling Contractor |
| SA | Staff Advisor |
| SI | Summer Intern |
| US | Undergraduate Student |
| counselorTitle | Edit | Title | Optional |
| centerId | Center | CenterThis field uses the following coded values:CodeDescription110[TEST] Lenders Database107Aaron Phelps Test Center 12377Access SBDC39Butte College SBDC97California Black Chamber - Affiliate71East Bay SBDC105Lake County SBDC36Marin SBDC24Mendocino SBDC26Mendocino WBC63NorCal SBDC EATS13North Coast SBDC23Northern California SBDC Regional Lead Center108Pitch Globally - Affiliate47Regional Training72Sacramento Valley SBDC15San Francisco SBDC68San Joaquin SBDC69San Mateo SBDC9Santa Cruz SBDC75SBDCtech @ UCB Haas 40Shasta-Cascade SBDC43Sierra SBDC70Silicon Valley SBDC94Silicon Valley Successes - Affiliate18Solano-Napa SBDC73Sonoma SBDC34Tech Futures Group38The Finance Center76z_CA Hispanic SBDC (FY22-25)11z_Napa-Sonoma SBDC (closed 12/31/21)14z_North Coast SBDC (Crescent City)60z_The Inclusivity Project (FY21-25)109~AIU87~Beauty Boss84~CA Shop Small106~ProBiz86~San Francisco Grant Program96~SBDC Health85~Source Diverse Source Local111~Startup World Cup 2025 | Code | Description | 110 | [TEST] Lenders Database | 107 | Aaron Phelps Test Center 123 | 77 | Access SBDC | 39 | Butte College SBDC | 97 | California Black Chamber - Affiliate | 71 | East Bay SBDC | 105 | Lake County SBDC | 36 | Marin SBDC | 24 | Mendocino SBDC | 26 | Mendocino WBC | 63 | NorCal SBDC EATS | 13 | North Coast SBDC | 23 | Northern California SBDC Regional Lead Center | 108 | Pitch Globally - Affiliate | 47 | Regional Training | 72 | Sacramento Valley SBDC | 15 | San Francisco SBDC | 68 | San Joaquin SBDC | 69 | San Mateo SBDC | 9 | Santa Cruz SBDC | 75 | SBDCtech @ UCB Haas | 40 | Shasta-Cascade SBDC | 43 | Sierra SBDC | 70 | Silicon Valley SBDC | 94 | Silicon Valley Successes - Affiliate | 18 | Solano-Napa SBDC | 73 | Sonoma SBDC | 34 | Tech Futures Group | 38 | The Finance Center | 76 | z_CA Hispanic SBDC (FY22-25) | 11 | z_Napa-Sonoma SBDC (closed 12/31/21) | 14 | z_North Coast SBDC (Crescent City) | 60 | z_The Inclusivity Project (FY21-25) | 109 | ~AIU | 87 | ~Beauty Boss | 84 | ~CA Shop Small | 106 | ~ProBiz | 86 | ~San Francisco Grant Program | 96 | ~SBDC Health | 85 | ~Source Diverse Source Local | 111 | ~Startup World Cup 2025 | Optional |
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
| tel | PhoneNumber | Office Phone | Optional |
| fax | PhoneNumber | Fax | Optional |
| homeph | PhoneNumber | Home Phone | Optional |
| mobileph | PhoneNumber | Cell Phone | Optional |
| email | EmailAddress | Email Address | Optional |
| scheduler | URL | External Scheduler | Optional |
| hiredate | Date | Hire Date | Optional |
| expertise | MultipleSelection | Area(s) of ExpertiseThis field uses the following coded values:CodeDescriptionCRTGCertified: GeneralACAccountingAGAgricultureZGBookkeepingBPBusiness PlanningECOMeCommerceZPECFinancingGOVGovernment ContractingGBGreen (Sustainable) BusinessHRHuman ResourcesINTInternational TradeLMLean ManufacturingMGTManagementMFGManufacturingMKTMarketing/SalesRLESReal EstateRERestaurantsSGSales GrowthZEMPStrategic DevelopmentSPSuccession PlanningTECHTechnology | Code | Description | CRTG | Certified: General | AC | Accounting | AG | Agriculture | ZG | Bookkeeping | BP | Business Planning | ECOM | eCommerce | ZPEC | Financing | GOV | Government Contracting | GB | Green (Sustainable) Business | HR | Human Resources | INT | International Trade | LM | Lean Manufacturing | MGT | Management | MFG | Manufacturing | MKT | Marketing/Sales | RLES | Real Estate | RE | Restaurants | SG | Sales Growth | ZEMP | Strategic Development | SP | Succession Planning | TECH | Technology | Optional |
| Code | Description |
| CRTG | Certified: General |
| AC | Accounting |
| AG | Agriculture |
| ZG | Bookkeeping |
| BP | Business Planning |
| ECOM | eCommerce |
| ZPEC | Financing |
| GOV | Government Contracting |
| GB | Green (Sustainable) Business |
| HR | Human Resources |
| INT | International Trade |
| LM | Lean Manufacturing |
| MGT | Management |
| MFG | Manufacturing |
| MKT | Marketing/Sales |
| RLES | Real Estate |
| RE | Restaurants |
| SG | Sales Growth |
| ZEMP | Strategic Development |
| SP | Succession Planning |
| TECH | Technology |
| geoArea | MultipleSelection | Geographic TerritoryThis field uses the following coded values:CodeDescriptionsf San Francisco CountygebCounties of Alameda, Contra Costa, Solano, or NapancCounties of Mendocino, Humboldt and Del NortesvCounties of San Mateo and Santa ClaranbCounties of Sonoma or MarinoOtherscSanta Cruz or Northern Monterey Counties | Code | Description | sf | San Francisco County | geb | Counties of Alameda, Contra Costa, Solano, or Napa | nc | Counties of Mendocino, Humboldt and Del Norte | sv | Counties of San Mateo and Santa Clara | nb | Counties of Sonoma or Marin | o | Other | sc | Santa Cruz or Northern Monterey Counties | Optional |
| Code | Description |
| sf | San Francisco County |
| geb | Counties of Alameda, Contra Costa, Solano, or Napa |
| nc | Counties of Mendocino, Humboldt and Del Norte |
| sv | Counties of San Mateo and Santa Clara |
| nb | Counties of Sonoma or Marin |
| o | Other |
| sc | Santa Cruz or Northern Monterey Counties |
| addr | Address | Address | Optional |
| city | Edit | City | Optional |
| state | Selection | StateThis field uses the following coded values:CodeDescription-(Undefined)ALAlabamaAKAlaskaASAmerican SamoaAZArizonaARArkansasCACaliforniaCOColoradoCTConnecticutDEDelawareFMFederated States of MicronesiaFLFloridaGAGeorgiaGUGuamHIHawaiiIDIdahoILIllinoisINIndianaIAIowaKSKansasKYKentuckyLALouisianaMEMaineMHMarshall IslandsMDMarylandMAMassachusettsMIMichiganMNMinnesotaMSMississippiMOMissouriMTMontanaNENebraskaNVNevadaNHNew HampshireNJNew JerseyNMNew MexicoNYNew YorkNCNorth CarolinaNDNorth DakotaMPNorthern Mariana IslandsOHOhioOKOklahomaOROregonPWPalauPAPennsylvaniaPRPuerto RicoRIRhode IslandSCSouth CarolinaSDSouth DakotaTNTennesseeTXTexasVIUS Virgin IslandsUTUtahVTVermontVAVirginiaWAWashingtonDCWashington DCWVWest VirginiaWIWisconsinWYWyoming | Code | Description | - | (Undefined) | AL | Alabama | AK | Alaska | AS | American Samoa | AZ | Arizona | AR | Arkansas | CA | California | CO | Colorado | CT | Connecticut | DE | Delaware | FM | Federated States of Micronesia | FL | Florida | GA | Georgia | GU | Guam | HI | Hawaii | ID | Idaho | IL | Illinois | IN | Indiana | IA | Iowa | KS | Kansas | KY | Kentucky | LA | Louisiana | ME | Maine | MH | Marshall Islands | MD | Maryland | MA | Massachusetts | MI | Michigan | MN | Minnesota | MS | Mississippi | MO | Missouri | MT | Montana | NE | Nebraska | NV | Nevada | NH | New Hampshire | NJ | New Jersey | NM | New Mexico | NY | New York | NC | North Carolina | ND | North Dakota | MP | Northern Mariana Islands | OH | Ohio | OK | Oklahoma | OR | Oregon | PW | Palau | PA | Pennsylvania | PR | Puerto Rico | RI | Rhode Island | SC | South Carolina | SD | South Dakota | TN | Tennessee | TX | Texas | VI | US Virgin Islands | UT | Utah | VT | Vermont | VA | Virginia | WA | Washington | DC | Washington DC | WV | West Virginia | WI | Wisconsin | WY | Wyoming | Optional |
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
| zip | Edit | ZIP Code | Optional |
| county | AddressAdm2 | County | Optional |
| country | Selection | CountryThis field uses the following coded values:CodeDescription-(Undefined)AFAfghanistanAXAland IslandsALAlbaniaDZAlgeriaADAndorraAOAngolaAIAnguillaAQAntarcticaAGAntigua and BarbudaARArgentinaAMArmeniaAWArubaAUAustraliaATAustriaAZAzerbaijanBSBahamasBHBahrainBDBangladeshBBBarbadosBYBelarusBEBelgiumBZBelizeBJBeninBMBermudaBTBhutanBOBoliviaBQBonaire/St. Eustatius/SabaBABosnia and HerzegovinaBWBotswanaBVBouvet IslandBRBrazilIOBritish Indian Ocean Terr.BNBrunei DarussalamBGBulgariaBFBurkina FasoBIBurundiKHCambodiaCMCameroonCACanadaCVCape VerdeKYCayman IslandsCFCentral African RepublicTDChadCLChileCNChinaCXChristmas IslandCCCocos (Keeling) IslandCOColombiaKMComorosCGCongoCDCongo, Dem. Rep. of theCKCook IslandsCRCosta RicaCICote d'IvoireHRCroatiaCUCubaCWCuracaoCYCyprusCZCzech RepublicDKDenmarkDJDjiboutiDMDominicaDODominican RepublicECEcuadorEGEgyptSVEl SalvadorGQEquatorial GuineaEREritreaEEEstoniaSZEswatiniETEthiopiaFKFalkland IslandsFOFaroe IslandsFJFijiFIFinlandFRFranceGFFrench GuianaPFFrench PolynesiaTFFrench Southern TerritoriesGAGabonGMGambiaGEGeorgiaDEGermanyGHGhanaGIGibraltarGRGreeceGLGreenlandGDGrenadaGPGuadeloupeGTGuatemalaGGGuernseyGNGuineaGWGuinea-BissauGYGuyanaHTHaitiHMHeard/McDonald IslandsHNHondurasHKHong KongHUHungaryISIcelandINIndiaIDIndonesiaIRIran, Islamic Republic ofIQIraqIEIrelandIMIsle of ManILIsraelITItalyJMJamaicaJPJapanJEJerseyJOJordanKZKazakhstanKEKenyaKIKiribatiKPKorea, DPR (North)KRKorea, Republic of (South)KWKuwaitKGKyrgyzstanLALaosLVLatviaLBLebanonLSLesothoLRLiberiaLYLibyaLILiechtensteinLTLithuaniaLULuxembourgMOMacaoMGMadagascarMWMalawiMYMalaysiaMVMaldivesMLMaliMTMaltaMHMarshall IslandsMQMartiniqueMRMauritaniaMUMauritiusYTMayotteMXMexicoFMMicronesiaMDMoldovaMCMonacoMNMongoliaMEMontenegroMSMontserratMAMoroccoMZMozambiqueMMMyanmar or BurmaNANamibiaNRNauruNPNepalNLNetherlandsNCNew CaledoniaNZNew ZealandNINicaraguaNENigerNGNigeriaNUNiueNFNorfolk IslandMKNorth MacedoniaNONorwayOMOmanPKPakistanPWPalauPSPalestinian TerritoryPAPanamaPGPapua New GuineaPYParaguayPEPeruPHPhilippinesPNPitcairnPLPolandPTPortugalQAQatarREReunionRORomaniaRURussian FederationRWRwandaBLSaint BarthelemySHSaint HelenaKNSaint Kitts and NevisLCSaint LuciaSXSaint Maarten (Dutch part)MFSaint Martin (French Part)PMSaint Pierre and MiquelonVCSaint Vincent/GrenadinesWSSamoaSMSan MarinoSTSao Tome and PrincipeSASaudi ArabiaSNSenegalRSSerbiaSCSeychellesSLSierra LeoneSGSingaporeSKSlovakiaSISloveniaSBSoloman IslandsSOSomaliaZASouth AfricaGSSouth Georgia/Sandwich Is.SSSouth SudanESSpainLKSri LankaSDSudanSRSurinameSJSvalbard and Jan MayenSESwedenCHSwitzerlandSYSyrian Arab RepublicTWTaiwanTJTajikistanTZTanzaniaTHThailandTLTimor-LesteTGTogoTKTokelauTOTongaTTTrinidad and TobagoTNTunisiaTRTurkeyTMTurkmenistanTCTurks and Caicos IslandsTVTuvaluUGUgandaUAUkraineAEUnited Arab EmiratesGBUnited KingdomUSUnited StatesUYUruguayUZUzbekistanVUVanuatuVAVatican CityVEVenezuelaVNVietnamVGVirgin Islands, BritishWFWallis and FutunaEHWestern SaharaYEYemenZMZambiaZWZimbabwe | Code | Description | - | (Undefined) | AF | Afghanistan | AX | Aland Islands | AL | Albania | DZ | Algeria | AD | Andorra | AO | Angola | AI | Anguilla | AQ | Antarctica | AG | Antigua and Barbuda | AR | Argentina | AM | Armenia | AW | Aruba | AU | Australia | AT | Austria | AZ | Azerbaijan | BS | Bahamas | BH | Bahrain | BD | Bangladesh | BB | Barbados | BY | Belarus | BE | Belgium | BZ | Belize | BJ | Benin | BM | Bermuda | BT | Bhutan | BO | Bolivia | BQ | Bonaire/St. Eustatius/Saba | BA | Bosnia and Herzegovina | BW | Botswana | BV | Bouvet Island | BR | Brazil | IO | British Indian Ocean Terr. | BN | Brunei Darussalam | BG | Bulgaria | BF | Burkina Faso | BI | Burundi | KH | Cambodia | CM | Cameroon | CA | Canada | CV | Cape Verde | KY | Cayman Islands | CF | Central African Republic | TD | Chad | CL | Chile | CN | China | CX | Christmas Island | CC | Cocos (Keeling) Island | CO | Colombia | KM | Comoros | CG | Congo | CD | Congo, Dem. Rep. of the | CK | Cook Islands | CR | Costa Rica | CI | Cote d'Ivoire | HR | Croatia | CU | Cuba | CW | Curacao | CY | Cyprus | CZ | Czech Republic | DK | Denmark | DJ | Djibouti | DM | Dominica | DO | Dominican Republic | EC | Ecuador | EG | Egypt | SV | El Salvador | GQ | Equatorial Guinea | ER | Eritrea | EE | Estonia | SZ | Eswatini | ET | Ethiopia | FK | Falkland Islands | FO | Faroe Islands | FJ | Fiji | FI | Finland | FR | France | GF | French Guiana | PF | French Polynesia | TF | French Southern Territories | GA | Gabon | GM | Gambia | GE | Georgia | DE | Germany | GH | Ghana | GI | Gibraltar | GR | Greece | GL | Greenland | GD | Grenada | GP | Guadeloupe | GT | Guatemala | GG | Guernsey | GN | Guinea | GW | Guinea-Bissau | GY | Guyana | HT | Haiti | HM | Heard/McDonald Islands | HN | Honduras | HK | Hong Kong | HU | Hungary | IS | Iceland | IN | India | ID | Indonesia | IR | Iran, Islamic Republic of | IQ | Iraq | IE | Ireland | IM | Isle of Man | IL | Israel | IT | Italy | JM | Jamaica | JP | Japan | JE | Jersey | JO | Jordan | KZ | Kazakhstan | KE | Kenya | KI | Kiribati | KP | Korea, DPR (North) | KR | Korea, Republic of (South) | KW | Kuwait | KG | Kyrgyzstan | LA | Laos | LV | Latvia | LB | Lebanon | LS | Lesotho | LR | Liberia | LY | Libya | LI | Liechtenstein | LT | Lithuania | LU | Luxembourg | MO | Macao | MG | Madagascar | MW | Malawi | MY | Malaysia | MV | Maldives | ML | Mali | MT | Malta | MH | Marshall Islands | MQ | Martinique | MR | Mauritania | MU | Mauritius | YT | Mayotte | MX | Mexico | FM | Micronesia | MD | Moldova | MC | Monaco | MN | Mongolia | ME | Montenegro | MS | Montserrat | MA | Morocco | MZ | Mozambique | MM | Myanmar or Burma | NA | Namibia | NR | Nauru | NP | Nepal | NL | Netherlands | NC | New Caledonia | NZ | New Zealand | NI | Nicaragua | NE | Niger | NG | Nigeria | NU | Niue | NF | Norfolk Island | MK | North Macedonia | NO | Norway | OM | Oman | PK | Pakistan | PW | Palau | PS | Palestinian Territory | PA | Panama | PG | Papua New Guinea | PY | Paraguay | PE | Peru | PH | Philippines | PN | Pitcairn | PL | Poland | PT | Portugal | QA | Qatar | RE | Reunion | RO | Romania | RU | Russian Federation | RW | Rwanda | BL | Saint Barthelemy | SH | Saint Helena | KN | Saint Kitts and Nevis | LC | Saint Lucia | SX | Saint Maarten (Dutch part) | MF | Saint Martin (French Part) | PM | Saint Pierre and Miquelon | VC | Saint Vincent/Grenadines | WS | Samoa | SM | San Marino | ST | Sao Tome and Principe | SA | Saudi Arabia | SN | Senegal | RS | Serbia | SC | Seychelles | SL | Sierra Leone | SG | Singapore | SK | Slovakia | SI | Slovenia | SB | Soloman Islands | SO | Somalia | ZA | South Africa | GS | South Georgia/Sandwich Is. | SS | South Sudan | ES | Spain | LK | Sri Lanka | SD | Sudan | SR | Suriname | SJ | Svalbard and Jan Mayen | SE | Sweden | CH | Switzerland | SY | Syrian Arab Republic | TW | Taiwan | TJ | Tajikistan | TZ | Tanzania | TH | Thailand | TL | Timor-Leste | TG | Togo | TK | Tokelau | TO | Tonga | TT | Trinidad and Tobago | TN | Tunisia | TR | Turkey | TM | Turkmenistan | TC | Turks and Caicos Islands | TV | Tuvalu | UG | Uganda | UA | Ukraine | AE | United Arab Emirates | GB | United Kingdom | US | United States | UY | Uruguay | UZ | Uzbekistan | VU | Vanuatu | VA | Vatican City | VE | Venezuela | VN | Vietnam | VG | Virgin Islands, British | WF | Wallis and Futuna | EH | Western Sahara | YE | Yemen | ZM | Zambia | ZW | Zimbabwe | Optional |
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
| personalemail | Edit | Alt. Email Address | Optional |
| othcent | MultipleSelection | Other Centers Contracted withThis field uses the following coded values:CodeDescriptionAIUAIUButte SBDCButte SBDCEast Bay SBDCEast Bay SBDCFinance CenterFinance CenterLake County SBDCLake County SBDCMarin SBDCMarin SBDCMendo SBDCMendo SBDCNorCal SBDC EATSNorCal SBDC EATSNorth Coast SBDCNorth Coast SBDCProBizProBizRegional TrainingRegional TrainingSac Valley SBDCSac Valley SBDCSan Francisco SBDCSan Francisco SBDCSan Joaquin SBDCSan Joaquin SBDCSan Mateo SBDCSan Mateo SBDCSanta Cruz SBDCSanta Cruz SBDCShasta-Cascade SBDCShasta-Cascade SBDCSierra SBDCSierra SBDCSilicon Valley SBDCSilicon Valley SBDCSolano-Napa SBDCSolano-Napa SBDCSonoma SBDCSonoma SBDCTech Futures GroupTech Futures GroupAffiliate ProgramAffiliate Program | Code | Description | AIU | AIU | Butte SBDC | Butte SBDC | East Bay SBDC | East Bay SBDC | Finance Center | Finance Center | Lake County SBDC | Lake County SBDC | Marin SBDC | Marin SBDC | Mendo SBDC | Mendo SBDC | NorCal SBDC EATS | NorCal SBDC EATS | North Coast SBDC | North Coast SBDC | ProBiz | ProBiz | Regional Training | Regional Training | Sac Valley SBDC | Sac Valley SBDC | San Francisco SBDC | San Francisco SBDC | San Joaquin SBDC | San Joaquin SBDC | San Mateo SBDC | San Mateo SBDC | Santa Cruz SBDC | Santa Cruz SBDC | Shasta-Cascade SBDC | Shasta-Cascade SBDC | Sierra SBDC | Sierra SBDC | Silicon Valley SBDC | Silicon Valley SBDC | Solano-Napa SBDC | Solano-Napa SBDC | Sonoma SBDC | Sonoma SBDC | Tech Futures Group | Tech Futures Group | Affiliate Program | Affiliate Program | Optional |
| Code | Description |
| AIU | AIU |
| Butte SBDC | Butte SBDC |
| East Bay SBDC | East Bay SBDC |
| Finance Center | Finance Center |
| Lake County SBDC | Lake County SBDC |
| Marin SBDC | Marin SBDC |
| Mendo SBDC | Mendo SBDC |
| NorCal SBDC EATS | NorCal SBDC EATS |
| North Coast SBDC | North Coast SBDC |
| ProBiz | ProBiz |
| Regional Training | Regional Training |
| Sac Valley SBDC | Sac Valley SBDC |
| San Francisco SBDC | San Francisco SBDC |
| San Joaquin SBDC | San Joaquin SBDC |
| San Mateo SBDC | San Mateo SBDC |
| Santa Cruz SBDC | Santa Cruz SBDC |
| Shasta-Cascade SBDC | Shasta-Cascade SBDC |
| Sierra SBDC | Sierra SBDC |
| Silicon Valley SBDC | Silicon Valley SBDC |
| Solano-Napa SBDC | Solano-Napa SBDC |
| Sonoma SBDC | Sonoma SBDC |
| Tech Futures Group | Tech Futures Group |
| Affiliate Program | Affiliate Program |
| language | MultipleSelection | Languages SpokenThis field uses the following coded values:CodeDescriptionArabicArabicCantoneseCantoneseDutchDutchFarsiFarsiFrenchFrenchGermanGermanHindiHindiHmongHmongItalianItalianMandarinMandarinPunjabiPunjabiRussianRussianSpanishSpanishTagalogTagalogUkrainianUkrainianVietnameseVietnamese | Code | Description | Arabic | Arabic | Cantonese | Cantonese | Dutch | Dutch | Farsi | Farsi | French | French | German | German | Hindi | Hindi | Hmong | Hmong | Italian | Italian | Mandarin | Mandarin | Punjabi | Punjabi | Russian | Russian | Spanish | Spanish | Tagalog | Tagalog | Ukrainian | Ukrainian | Vietnamese | Vietnamese | Optional |
| Code | Description |
| Arabic | Arabic |
| Cantonese | Cantonese |
| Dutch | Dutch |
| Farsi | Farsi |
| French | French |
| German | German |
| Hindi | Hindi |
| Hmong | Hmong |
| Italian | Italian |
| Mandarin | Mandarin |
| Punjabi | Punjabi |
| Russian | Russian |
| Spanish | Spanish |
| Tagalog | Tagalog |
| Ukrainian | Ukrainian |
| Vietnamese | Vietnamese |
|  | ReadOnly |  | Optional |
|  | ReadOnly |  | Optional |
| naso | Boolean | New Advisor/Staff Orientation?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| nasod | DateSimple | New Advisor/Staff Orientation Date | Optional |
| rt | Boolean | Refresher Training?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| rtd | DateSimple | Refresher Training Date | Optional |
| at | Boolean | Attribution Training?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| atd | DateSimple | Attribution Training Date | Optional |
| attrdsgnee | Boolean | Attribution Designee?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
|  | ReadOnly |  | Optional |
| clientlist | Boolean | Transfer Client List?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| notes | TextArea | Counselor Notes | Optional |