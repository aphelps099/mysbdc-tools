# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

https://norcal.neoserra.com/api/v1/contacts/{*Contact Reference*}

# Methods Supported

HTTP Methods: GET, POST
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| salutation | Edit | Salutation | Optional |
| first | Edit | First Name | Mandatory |
| last | Edit | Last Name | Mandatory |
| pronouns | Selection | PronounsThis field uses the following coded values:CodeDescription-(Undefined)namename onlysheshe/her/hershehe/him/histheythey/them/theirszehze/hir/hirzezze/zir/zir | Code | Description | - | (Undefined) | name | name only | she | she/her/hers | he | he/him/his | they | they/them/theirs | zeh | ze/hir/hir | zez | ze/zir/zir | Optional |
| Code | Description |
| - | (Undefined) |
| name | name only |
| she | she/her/hers |
| he | he/him/his |
| they | they/them/theirs |
| zeh | ze/hir/hir |
| zez | ze/zir/zir |
| email | EmailAddress | Email Address | Mandatory |
| emailAlt | EmailAddressList | Secondary Email Address | Optional |
| emailingLists | Boolean | Subscribe to emails?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| language | Selection | Preferred LanguageThis field uses the following coded values:CodeDescription-(Undefined)ARArabicHYArmenianYUECantonese/Yue ChineseZHChineseDRDariENEnglishFRFrenchDEGermanHIHindiHMHmongITItalianJAJapaneseKOKoreanLOLaoLVLatvianCMNMandarin ChinesePAPanjabi; PunjabiFAPersianPSPushto; PashtoRURussianSPSpanishSVSwedishTLTagalogTHThaiVIVietnamese | Code | Description | - | (Undefined) | AR | Arabic | HY | Armenian | YUE | Cantonese/Yue Chinese | ZH | Chinese | DR | Dari | EN | English | FR | French | DE | German | HI | Hindi | HM | Hmong | IT | Italian | JA | Japanese | KO | Korean | LO | Lao | LV | Latvian | CMN | Mandarin Chinese | PA | Panjabi; Punjabi | FA | Persian | PS | Pushto; Pashto | RU | Russian | SP | Spanish | SV | Swedish | TL | Tagalog | TH | Thai | VI | Vietnamese | Optional |
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
| position | Selection | PositionThis field uses the following coded values:CodeDescription-(Undefined)CEOCEOCOOCOOCTOCTOEMPEmployeeFOUFounderGMGeneral ManagerHBDHead of Business DevelopmentOWNOwnerPTRPartnerPRPresidentSPSole ProprietorCFOTreasurer or CFOVPRVice President | Code | Description | - | (Undefined) | CEO | CEO | COO | COO | CTO | CTO | EMP | Employee | FOU | Founder | GM | General Manager | HBD | Head of Business Development | OWN | Owner | PTR | Partner | PR | President | SP | Sole Proprietor | CFO | Treasurer or CFO | VPR | Vice President | Optional |
| Code | Description |
| - | (Undefined) |
| CEO | CEO |
| COO | COO |
| CTO | CTO |
| EMP | Employee |
| FOU | Founder |
| GM | General Manager |
| HBD | Head of Business Development |
| OWN | Owner |
| PTR | Partner |
| PR | President |
| SP | Sole Proprietor |
| CFO | Treasurer or CFO |
| VPR | Vice President |
| owner | Boolean | Business Owner?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| phone2 | PhoneNumber | Work Phone Number | Optional |
| phone | PhoneNumber | Phone Number | Mandatory |
| mobileph | PhoneNumber | Cell Phone | Optional |
| fax | PhoneNumber | Fax Number | Optional |
| centerId | Center | Center | Mandatory |
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
| county | AddressAdm2 | County | Mandatory |
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
| congDistFed | Representative | Federal Congressional District | Mandatory |
| houseDistState | Representative | State Representative District | Mandatory |
| senateDistState | Representative | State Senate/Assembly District | Mandatory |
|  | ReadOnly |  | Optional |
| specprog | Edit | Special Program | Optional |
| famincome | Selection | Family IncomeThis field uses the following coded values:CodeDescription-Extremely LowExtremely LowVery LowVery LowLowLowModerateModerateModerate to HighModerate to HighHighHighNot StatedNot Stated | Code | Description | - |  | Extremely Low | Extremely Low | Very Low | Very Low | Low | Low | Moderate | Moderate | Moderate to High | Moderate to High | High | High | Not Stated | Not Stated | Optional |
| Code | Description |
| - |  |
| Extremely Low | Extremely Low |
| Very Low | Very Low |
| Low | Low |
| Moderate | Moderate |
| Moderate to High | Moderate to High |
| High | High |
| Not Stated | Not Stated |
| afamincome | Currency | Annual Family Income | Optional |
| famsize | Selection | Family SizeThis field uses the following coded values:CodeDescription-1122334455667788>8>8 | Code | Description | - |  | 1 | 1 | 2 | 2 | 3 | 3 | 4 | 4 | 5 | 5 | 6 | 6 | 7 | 7 | 8 | 8 | >8 | >8 | Optional |
| Code | Description |
| - |  |
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 | 6 |
| 7 | 7 |
| 8 | 8 |
| >8 | >8 |
| singparent | Boolean | Single-Parent FamilyThis is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| date | Edit | CDBG Income Certification Date | Optional |
|  | ReadOnly |  | Optional |
| dob | DateSimple | Date of Birth | Optional |
| altemail | Edit | Alternate Email Address | Optional |
| age | Selection | AgeThis field uses the following coded values:CodeDescription225-35 years of age336-49 years of age450+ years of age1Less than 25 years of age5Unknown/Not Stated | Code | Description | 2 | 25-35 years of age | 3 | 36-49 years of age | 4 | 50+ years of age | 1 | Less than 25 years of age | 5 | Unknown/Not Stated | Optional |
| Code | Description |
| 2 | 25-35 years of age |
| 3 | 36-49 years of age |
| 4 | 50+ years of age |
| 1 | Less than 25 years of age |
| 5 | Unknown/Not Stated |
| dob | Date | Date of Birth | Optional |
| gender | Selection | SexThis field uses the following coded values:CodeDescription-(Undefined)FFemaleMMaleRPrefer not to say | Code | Description | - | (Undefined) | F | Female | M | Male | R | Prefer not to say | Optional |
| Code | Description |
| - | (Undefined) |
| F | Female |
| M | Male |
| R | Prefer not to say |
| orientation | Selection | LGBTQ+This field uses the following coded values:CodeDescriptionNNoYYes-(Undefined)CPrefer not to say | Code | Description | N | No | Y | Yes | - | (Undefined) | C | Prefer not to say | Optional |
| Code | Description |
| N | No |
| Y | Yes |
| - | (Undefined) |
| C | Prefer not to say |
| identType | Selection | Identification TypeThis field uses the following coded values:CodeDescription-(Undefined)PPassportDDriver LicenseIDState ID Card | Code | Description | - | (Undefined) | P | Passport | D | Driver License | ID | State ID Card | Optional |
| Code | Description |
| - | (Undefined) |
| P | Passport |
| D | Driver License |
| ID | State ID Card |
| ident | Edit | Identification Number | Optional |
| ethnic | Selection | RaceThis field uses the following coded values:CodeDescription-(Undefined)11Alaska Native2Asian3Black or African American12Middle Eastern1Native American4Native Hawaiian or Pacific Islander13North AfricanNRPrefer not to say5White/Caucasian | Code | Description | - | (Undefined) | 11 | Alaska Native | 2 | Asian | 3 | Black or African American | 12 | Middle Eastern | 1 | Native American | 4 | Native Hawaiian or Pacific Islander | 13 | North African | NR | Prefer not to say | 5 | White/Caucasian | Optional |
| Code | Description |
| - | (Undefined) |
| 11 | Alaska Native |
| 2 | Asian |
| 3 | Black or African American |
| 12 | Middle Eastern |
| 1 | Native American |
| 4 | Native Hawaiian or Pacific Islander |
| 13 | North African |
| NR | Prefer not to say |
| 5 | White/Caucasian |
| raceAdd | MultipleSelection | Additional Race(s)This field uses the following coded values:CodeDescription11Alaska Native2Asian3Black or African American12Middle Eastern1Native American4Native Hawaiian or Pacific Islander13North African5White/Caucasian | Code | Description | 11 | Alaska Native | 2 | Asian | 3 | Black or African American | 12 | Middle Eastern | 1 | Native American | 4 | Native Hawaiian or Pacific Islander | 13 | North African | 5 | White/Caucasian | Mandatory |
| Code | Description |
| 11 | Alaska Native |
| 2 | Asian |
| 3 | Black or African American |
| 12 | Middle Eastern |
| 1 | Native American |
| 4 | Native Hawaiian or Pacific Islander |
| 13 | North African |
| 5 | White/Caucasian |
| hispanic | Selection | Hispanic OriginThis field uses the following coded values:CodeDescription-(Undefined)YHispanic, Latino, or Spanish originNNot of Hispanic, Latino, or Spanish originRPrefer not to say | Code | Description | - | (Undefined) | Y | Hispanic, Latino, or Spanish origin | N | Not of Hispanic, Latino, or Spanish origin | R | Prefer not to say | Optional |
| Code | Description |
| - | (Undefined) |
| Y | Hispanic, Latino, or Spanish origin |
| N | Not of Hispanic, Latino, or Spanish origin |
| R | Prefer not to say |
| tribe | Selection | Indian Tribal Entity | Optional |
| veteran | Selection | Veteran StatusThis field uses the following coded values:CodeDescription-(Undefined)NANon-veteranNRPrefer not to sayDSService-Disabled VeteranVEVeteran | Code | Description | - | (Undefined) | NA | Non-veteran | NR | Prefer not to say | DS | Service-Disabled Veteran | VE | Veteran | Optional |
| Code | Description |
| - | (Undefined) |
| NA | Non-veteran |
| NR | Prefer not to say |
| DS | Service-Disabled Veteran |
| VE | Veteran |
| militaryRank | Selection | Highest Military RankThis field uses the following coded values:CodeDescription6Dependent1E1 to E52E6 to E97Not applicable4O1 to O35O4 or above8Unknown/Not Stated3WO1 to WO5 | Code | Description | 6 | Dependent | 1 | E1 to E5 | 2 | E6 to E9 | 7 | Not applicable | 4 | O1 to O3 | 5 | O4 or above | 8 | Unknown/Not Stated | 3 | WO1 to WO5 | Optional |
| Code | Description |
| 6 | Dependent |
| 1 | E1 to E5 |
| 2 | E6 to E9 |
| 7 | Not applicable |
| 4 | O1 to O3 |
| 5 | O4 or above |
| 8 | Unknown/Not Stated |
| 3 | WO1 to WO5 |
| reservist | Selection | Military StatusThis field uses the following coded values:CodeDescription-(Undefined)AActive DutySPMilitary SpouseGNational GuardNANoneRReservist | Code | Description | - | (Undefined) | A | Active Duty | SP | Military Spouse | G | National Guard | NA | None | R | Reservist | Optional |
| Code | Description |
| - | (Undefined) |
| A | Active Duty |
| SP | Military Spouse |
| G | National Guard |
| NA | None |
| R | Reservist |
| militaryBranch | Selection | Military BranchThis field uses the following coded values:CodeDescription-(Undefined)AFAir ForceAArmyCGCoast GuardMMarine CorpsNNavyCPrefer not to saySFSpace Force | Code | Description | - | (Undefined) | AF | Air Force | A | Army | CG | Coast Guard | M | Marine Corps | N | Navy | C | Prefer not to say | SF | Space Force | Mandatory |
| Code | Description |
| - | (Undefined) |
| AF | Air Force |
| A | Army |
| CG | Coast Guard |
| M | Marine Corps |
| N | Navy |
| C | Prefer not to say |
| SF | Space Force |
| handicapped | Selection | Disabled/Handicapped?This field uses the following coded values:CodeDescription-(Undefined)NNoRPrefer not to sayYYes | Code | Description | - | (Undefined) | N | No | R | Prefer not to say | Y | Yes | Optional |
| Code | Description |
| - | (Undefined) |
| N | No |
| R | Prefer not to say |
| Y | Yes |
| education | Selection | Education Level CompletedThis field uses the following coded values:CodeDescription-(Undefined)0None1Elementary/Primary2Middle School/Lower Secondary3High School/Upper Secondary4Associate/Technical Degree5Bachelor's Degree6Master’s Degree7Doctorate Degree8Professional Degree (MD, JD or equivalent) | Code | Description | - | (Undefined) | 0 | None | 1 | Elementary/Primary | 2 | Middle School/Lower Secondary | 3 | High School/Upper Secondary | 4 | Associate/Technical Degree | 5 | Bachelor's Degree | 6 | Master’s Degree | 7 | Doctorate Degree | 8 | Professional Degree (MD, JD or equivalent) | Optional |
| Code | Description |
| - | (Undefined) |
| 0 | None |
| 1 | Elementary/Primary |
| 2 | Middle School/Lower Secondary |
| 3 | High School/Upper Secondary |
| 4 | Associate/Technical Degree |
| 5 | Bachelor's Degree |
| 6 | Master’s Degree |
| 7 | Doctorate Degree |
| 8 | Professional Degree (MD, JD or equivalent) |
| loginLocked | Boolean | eCenter account login locked?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| loginFailures | Integer | eCenter Login Failures | Optional |
| lastLogin | DateTime | Last eCenter Login | Optional |
| notes | TextArea | Contact Notes | Optional |