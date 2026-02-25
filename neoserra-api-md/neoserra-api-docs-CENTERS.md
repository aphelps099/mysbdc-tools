# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

https://norcal.neoserra.com/api/v1/centers/{*Center Reference*}

# Methods Supported

HTTP Methods: GET (this record type is read-only)
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| center | Edit | Center ID | Mandatory |
| centerName | Edit | Center Name | Mandatory |
| visibility | Selection | StatusThis field uses the following coded values:CodeDescriptionYActiveNInactivePPublic | Code | Description | Y | Active | N | Inactive | P | Public | Mandatory |
| Code | Description |
| Y | Active |
| N | Inactive |
| P | Public |
| centerType | Selection | Center TypeThis field uses the following coded values:CodeDescriptionOOtherSSBDCISSBCI10StakeholderWWBC | Code | Description | O | Other | S | SBDC | I | SSBCI | 10 | Stakeholder | W | WBC | Mandatory |
| Code | Description |
| O | Other |
| S | SBDC |
| I | SSBCI |
| 10 | Stakeholder |
| W | WBC |
| orgType | Selection | Organization TypeThis field uses the following coded values:CodeDescription-(Undefined)PROFITFor-profit EntityHEDHigher EducationNONPROFNon-profit EntityOTHEROtherSTATEState Entity | Code | Description | - | (Undefined) | PROFIT | For-profit Entity | HED | Higher Education | NONPROF | Non-profit Entity | OTHER | Other | STATE | State Entity | Optional |
| Code | Description |
| - | (Undefined) |
| PROFIT | For-profit Entity |
| HED | Higher Education |
| NONPROF | Non-profit Entity |
| OTHER | Other |
| STATE | State Entity |
| taRel | Selection | Relationship to TA GrantThis field uses the following coded values:CodeDescription-(Undefined)24TA Grant Contactor20TA Grant Recipient23TA Grant Subrecipient - external firm21TA Grant Subrecipient - subentity | Code | Description | - | (Undefined) | 24 | TA Grant Contactor | 20 | TA Grant Recipient | 23 | TA Grant Subrecipient - external firm | 21 | TA Grant Subrecipient - subentity | Optional |
| Code | Description |
| - | (Undefined) |
| 24 | TA Grant Contactor |
| 20 | TA Grant Recipient |
| 23 | TA Grant Subrecipient - external firm |
| 21 | TA Grant Subrecipient - subentity |
| taServices | MultipleSelection | TA Services ProvidedThis field uses the following coded values:CodeDescription-(Undefined)SSBCI-19Accounting Services - OtherSSBCI-13Advisory services/training on accounting practices, recordkeeping, or accounting softwareSSBCI-12Digitizing financial recordsSSBCI-11Preparing audits, financial statements, or business recordsSSBCI-24Advising on factors that may impede access to business financingSSBCI-25Advising on financial managementSSBCI-22Assisting with applications for government small business programs, incl. preparing financial analysesSSBCI-21Assisting with the establishment of banking relationships or other financial servicesSSBCI-26Developing presentations to potential investors, financial models, and business plansSSBCI-29Financial advisory services - OtherSSBCI-23Identifying sources of credit, capital, grants, and other financingSSBCI-03Advising on, or preparing documents for, the business to enter into contractsSSBCI-01Assisting with business formation or adopting corporate governance documentsSSBCI-09Legal services - OtherSSBCI-05Legal services related to a transfer of ownership interests incl. ESOPsSSBCI-04Legal services related to the business obtaining capital from investorsSSBCI-02Obtaining needed registrations, licenses, filings, and certifications | Code | Description | - | (Undefined) | SSBCI-19 | Accounting Services - Other | SSBCI-13 | Advisory services/training on accounting practices, recordkeeping, or accounting software | SSBCI-12 | Digitizing financial records | SSBCI-11 | Preparing audits, financial statements, or business records | SSBCI-24 | Advising on factors that may impede access to business financing | SSBCI-25 | Advising on financial management | SSBCI-22 | Assisting with applications for government small business programs, incl. preparing financial analyses | SSBCI-21 | Assisting with the establishment of banking relationships or other financial services | SSBCI-26 | Developing presentations to potential investors, financial models, and business plans | SSBCI-29 | Financial advisory services - Other | SSBCI-23 | Identifying sources of credit, capital, grants, and other financing | SSBCI-03 | Advising on, or preparing documents for, the business to enter into contracts | SSBCI-01 | Assisting with business formation or adopting corporate governance documents | SSBCI-09 | Legal services - Other | SSBCI-05 | Legal services related to a transfer of ownership interests incl. ESOPs | SSBCI-04 | Legal services related to the business obtaining capital from investors | SSBCI-02 | Obtaining needed registrations, licenses, filings, and certifications | Optional |
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
| taBudget | Currency | TA Grant Funds Budget | Optional |
| sediOwned | Boolean | SEDI-Owned Provider?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| region | Edit | Region | Optional |
| sbaLoc | Edit | Nexus Location Code | Optional |
| commnavs | Edit | Navigator Location ID | Optional |
| counselId | Counselor | Default Contact | Optional |
| phone | PhoneNumber | Phone | Optional |
| fax | PhoneNumber | Fax | Optional |
| email | EmailAddress | Email | Optional |
| url | URL | Website | Optional |
| account | Edit | Outreach Account | Optional |
| accountPassword | Password | Outreach Account Password | Optional |
| mailaddr | Address | Address | Optional |
| mailcity | Edit | City | Optional |
| mailst | Selection | StateThis field uses the following coded values:CodeDescription-(Undefined)ALAlabamaAKAlaskaASAmerican SamoaAZArizonaARArkansasCACaliforniaCOColoradoCTConnecticutDEDelawareFMFederated States of MicronesiaFLFloridaGAGeorgiaGUGuamHIHawaiiIDIdahoILIllinoisINIndianaIAIowaKSKansasKYKentuckyLALouisianaMEMaineMHMarshall IslandsMDMarylandMAMassachusettsMIMichiganMNMinnesotaMSMississippiMOMissouriMTMontanaNENebraskaNVNevadaNHNew HampshireNJNew JerseyNMNew MexicoNYNew YorkNCNorth CarolinaNDNorth DakotaMPNorthern Mariana IslandsOHOhioOKOklahomaOROregonPWPalauPAPennsylvaniaPRPuerto RicoRIRhode IslandSCSouth CarolinaSDSouth DakotaTNTennesseeTXTexasVIUS Virgin IslandsUTUtahVTVermontVAVirginiaWAWashingtonDCWashington DCWVWest VirginiaWIWisconsinWYWyoming | Code | Description | - | (Undefined) | AL | Alabama | AK | Alaska | AS | American Samoa | AZ | Arizona | AR | Arkansas | CA | California | CO | Colorado | CT | Connecticut | DE | Delaware | FM | Federated States of Micronesia | FL | Florida | GA | Georgia | GU | Guam | HI | Hawaii | ID | Idaho | IL | Illinois | IN | Indiana | IA | Iowa | KS | Kansas | KY | Kentucky | LA | Louisiana | ME | Maine | MH | Marshall Islands | MD | Maryland | MA | Massachusetts | MI | Michigan | MN | Minnesota | MS | Mississippi | MO | Missouri | MT | Montana | NE | Nebraska | NV | Nevada | NH | New Hampshire | NJ | New Jersey | NM | New Mexico | NY | New York | NC | North Carolina | ND | North Dakota | MP | Northern Mariana Islands | OH | Ohio | OK | Oklahoma | OR | Oregon | PW | Palau | PA | Pennsylvania | PR | Puerto Rico | RI | Rhode Island | SC | South Carolina | SD | South Dakota | TN | Tennessee | TX | Texas | VI | US Virgin Islands | UT | Utah | VT | Vermont | VA | Virginia | WA | Washington | DC | Washington DC | WV | West Virginia | WI | Wisconsin | WY | Wyoming | Optional |
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
| mailzip | Edit | ZIP Code | Optional |
| county | AddressAdm2 | Physical Address County | Optional |
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
|  | ReadOnly |  | Optional |
| dirname | Edit | Director Name | Optional |
| diremail | Edit | Director Email | Optional |
|  | ReadOnly |  | Optional |
|  | ReadOnly |  | Optional |
| aar | TextArea | Advisor Accountability Report | Optional |
| inf | TextArea | Initial/No Follow-up Report | Optional |
| spscore | TextArea | Scorecard (for regional centers & programs) | Optional |
| leadership | TextArea | Leadership Scorecard | Optional |
| rhd | TextArea | Regional Historical Data | Optional |
| clientidmask | Edit | Client ID Format | Optional |
| nextclientnbr | Integer | Next New Client ID | Optional |
| conferenceidmask | Edit | Training Event ID Format | Optional |
| nextconferencenbr | Integer | Next New ID | Optional |
| ecCenterId | Center | eCenter Referral CenterThis field uses the following coded values:CodeDescription110[TEST] Lenders Database107Aaron Phelps Test Center 12377Access SBDC39Butte College SBDC97California Black Chamber - Affiliate71East Bay SBDC105Lake County SBDC36Marin SBDC24Mendocino SBDC26Mendocino WBC63NorCal SBDC EATS13North Coast SBDC23Northern California SBDC Regional Lead Center108Pitch Globally - Affiliate47Regional Training72Sacramento Valley SBDC15San Francisco SBDC68San Joaquin SBDC69San Mateo SBDC9Santa Cruz SBDC75SBDCtech @ UCB Haas 40Shasta-Cascade SBDC43Sierra SBDC70Silicon Valley SBDC94Silicon Valley Successes - Affiliate18Solano-Napa SBDC73Sonoma SBDC34Tech Futures Group38The Finance Center76z_CA Hispanic SBDC (FY22-25)11z_Napa-Sonoma SBDC (closed 12/31/21)14z_North Coast SBDC (Crescent City)60z_The Inclusivity Project (FY21-25)109~AIU87~Beauty Boss84~CA Shop Small106~ProBiz86~San Francisco Grant Program96~SBDC Health85~Source Diverse Source Local111~Startup World Cup 2025 | Code | Description | 110 | [TEST] Lenders Database | 107 | Aaron Phelps Test Center 123 | 77 | Access SBDC | 39 | Butte College SBDC | 97 | California Black Chamber - Affiliate | 71 | East Bay SBDC | 105 | Lake County SBDC | 36 | Marin SBDC | 24 | Mendocino SBDC | 26 | Mendocino WBC | 63 | NorCal SBDC EATS | 13 | North Coast SBDC | 23 | Northern California SBDC Regional Lead Center | 108 | Pitch Globally - Affiliate | 47 | Regional Training | 72 | Sacramento Valley SBDC | 15 | San Francisco SBDC | 68 | San Joaquin SBDC | 69 | San Mateo SBDC | 9 | Santa Cruz SBDC | 75 | SBDCtech @ UCB Haas | 40 | Shasta-Cascade SBDC | 43 | Sierra SBDC | 70 | Silicon Valley SBDC | 94 | Silicon Valley Successes - Affiliate | 18 | Solano-Napa SBDC | 73 | Sonoma SBDC | 34 | Tech Futures Group | 38 | The Finance Center | 76 | z_CA Hispanic SBDC (FY22-25) | 11 | z_Napa-Sonoma SBDC (closed 12/31/21) | 14 | z_North Coast SBDC (Crescent City) | 60 | z_The Inclusivity Project (FY21-25) | 109 | ~AIU | 87 | ~Beauty Boss | 84 | ~CA Shop Small | 106 | ~ProBiz | 86 | ~San Francisco Grant Program | 96 | ~SBDC Health | 85 | ~Source Diverse Source Local | 111 | ~Startup World Cup 2025 | Mandatory |
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
| ecCenterName | Edit | eCenter Display Name | Mandatory |
| ecDescription | TextArea | Description of Services Offered | Mandatory |
| ecBannerLogo | Edit | Banner Logo | Optional |
| ecBannerBkgd | Edit | Banner Background Image | Optional |
| ecBannerTextColor | Selection | Banner Text ColorThis field uses the following coded values:CodeDescriptionblackBlackwhiteWhite | Code | Description | black | Black | white | White | Optional |
| Code | Description |
| black | Black |
| white | White |
| urlEctrBanner | URL | eCenter Banner Link | Optional |
| ecPocFirst | Edit | eCenter Contact First Name | Mandatory |
| ecPocLast | Edit | eCenter Contact Last Name | Mandatory |
| ecPocEmail | EmailAddress | eCenter POC Email Address | Mandatory |
| ecPocPhone | PhoneNumber | eCenter POC Phone Number | Mandatory |
| sbaAreas | MultipleSelection | Sign-up Areas of AssistanceThis field uses the following coded values:CodeDescription?(Undefined)AIArtificial Intelligence (AI)TOAttend Training Event Only5Business Accounting/BudgetBPBusiness Plan12Buy/Sell Business6Cash Flow ManagementNGFLCredit Counseling or Financial LiteracyWFCrowd-FundingCRCustomer RelationsAP-CYBCybersecurity AssistanceDPDisaster Planning/RecoveryECeCommerce8Engineering R&D2Financing/CapitalFRFranchising4Government Contracting9Human Resources/Managing EmployeesIAAIntake Assessment20Intellectual Property11International TradeI1Investment Funding7Managing a Business3Marketing/SalesOTOtherRMRisk ManagementAP-GIPSBIR/STTR/Other Innovation ProgramsSMSocial Media1Start-up AssistanceAP-STState/Local Registration SystemTATalent AcquisitionT1Technology Commercialization10Technology/Computers | Code | Description | ? | (Undefined) | AI | Artificial Intelligence (AI) | TO | Attend Training Event Only | 5 | Business Accounting/Budget | BP | Business Plan | 12 | Buy/Sell Business | 6 | Cash Flow Management | NGFL | Credit Counseling or Financial Literacy | WF | Crowd-Funding | CR | Customer Relations | AP-CYB | Cybersecurity Assistance | DP | Disaster Planning/Recovery | EC | eCommerce | 8 | Engineering R&D | 2 | Financing/Capital | FR | Franchising | 4 | Government Contracting | 9 | Human Resources/Managing Employees | IAA | Intake Assessment | 20 | Intellectual Property | 11 | International Trade | I1 | Investment Funding | 7 | Managing a Business | 3 | Marketing/Sales | OT | Other | RM | Risk Management | AP-GIP | SBIR/STTR/Other Innovation Programs | SM | Social Media | 1 | Start-up Assistance | AP-ST | State/Local Registration System | TA | Talent Acquisition | T1 | Technology Commercialization | 10 | Technology/Computers | Optional |
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
| ecSignupInfoLevel | Selection | Event registration information requiredThis field uses the following coded values:CodeDescription1Contact2Client3Client + Agreement | Code | Description | 1 | Contact | 2 | Client | 3 | Client + Agreement | Optional |
| Code | Description |
| 1 | Contact |
| 2 | Client |
| 3 | Client + Agreement |
| ecPayeeId | Selection | Default eCenter Training Event PayeeThis field uses the following coded values:CodeDescription0(No selection)27Mendocino WBC26North Coast CASHnet 2022 25Santa Cruz SBDC19Z-DO NOT USE (CASHnet 3 (North Coast))9Z-DO NOT USE (Marin-Old)18Z-DO NOT USE (North Coast 2) CASHNET16Z-DO NOT USE (North Coast Old)4Z-DO NOT USE (North Coast)15Z-DO NOT USE (North Coast)14Z-DO NOT USE (Solano)7Z-DO NOT USE (Solano-Old)12Z-DO NOT USE (Solano-Old)13Z-DO NOT USE (Solano-Old)24Z-DO NOT USE Capital Region Paypal2Z-DO NOT USE Central Coast11Z-DO NOT USE Marin SBDC23Z-DO NOT USE Sac Sierra paypal21Z-DO NOT USE San Mateo SBDC22Z-DO NOT USE Shasta Paypal20z_DO NOT USE CASHnet 4 (North Coast)6z_DO NOT USE Mendocino SBDC | Code | Description | 0 | (No selection) | 27 | Mendocino WBC | 26 | North Coast CASHnet 2022 | 25 | Santa Cruz SBDC | 19 | Z-DO NOT USE (CASHnet 3 (North Coast)) | 9 | Z-DO NOT USE (Marin-Old) | 18 | Z-DO NOT USE (North Coast 2) CASHNET | 16 | Z-DO NOT USE (North Coast Old) | 4 | Z-DO NOT USE (North Coast) | 15 | Z-DO NOT USE (North Coast) | 14 | Z-DO NOT USE (Solano) | 7 | Z-DO NOT USE (Solano-Old) | 12 | Z-DO NOT USE (Solano-Old) | 13 | Z-DO NOT USE (Solano-Old) | 24 | Z-DO NOT USE Capital Region Paypal | 2 | Z-DO NOT USE Central Coast | 11 | Z-DO NOT USE Marin SBDC | 23 | Z-DO NOT USE Sac Sierra paypal | 21 | Z-DO NOT USE San Mateo SBDC | 22 | Z-DO NOT USE Shasta Paypal | 20 | z_DO NOT USE CASHnet 4 (North Coast) | 6 | z_DO NOT USE Mendocino SBDC | Mandatory |
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
| url1Type | Selection | Social Media Website Type #1This field uses the following coded values:CodeDescription-(None)FBFacebookIInstagramLILinkedInOOtherTHThreadsTWTwitter | Code | Description | - | (None) | FB | Facebook | I | Instagram | LI | LinkedIn | O | Other | TH | Threads | TW | Twitter | Optional |
| Code | Description |
| - | (None) |
| FB | Facebook |
| I | Instagram |
| LI | LinkedIn |
| O | Other |
| TH | Threads |
| TW | Twitter |
| url1 | URL | Social Media Website #1 | Optional |
| url2Type | Selection | Social Media Website Type #2This field uses the following coded values:CodeDescription-(None)FBFacebookIInstagramLILinkedInOOtherTHThreadsTWTwitter | Code | Description | - | (None) | FB | Facebook | I | Instagram | LI | LinkedIn | O | Other | TH | Threads | TW | Twitter | Optional |
| Code | Description |
| - | (None) |
| FB | Facebook |
| I | Instagram |
| LI | LinkedIn |
| O | Other |
| TH | Threads |
| TW | Twitter |
| url2 | URL | Social Media Website #2 | Optional |
| url3Type | Selection | Social Media Website Type #3This field uses the following coded values:CodeDescription-(None)FBFacebookIInstagramLILinkedInOOtherTHThreadsTWTwitter | Code | Description | - | (None) | FB | Facebook | I | Instagram | LI | LinkedIn | O | Other | TH | Threads | TW | Twitter | Optional |
| Code | Description |
| - | (None) |
| FB | Facebook |
| I | Instagram |
| LI | LinkedIn |
| O | Other |
| TH | Threads |
| TW | Twitter |
| url3 | URL | Social Media Website #3 | Optional |
| centerNotes | TextArea | Notes | Optional |