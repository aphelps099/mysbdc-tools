# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

https://norcal.neoserra.com/api/v1/clients/{*Client Reference*}

# Methods Supported

HTTP Methods: GET, POST
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| client | Edit | Client IDThis is the public ID which is based upon a mask set in the center record; this value can be reassigned by the user.  

It should not be confused with the internal Reference ID which is immutable. | Mandatory |
| intake | Boolean | For new clients, if true, an Online Update will be created which marks the new client as an Intake and will appear under the eCenter New Sign-ups. | Optional |
| intakeMemo | Edit | For new records where intake = true (see above), the intake record's notes section may be optionally set (special remarks, questions, etc.) | Optional |
| contact | Contact | For new clients, a primary contact object can be embedded.  This allows for a single transaction to create a new client and primary contact pair.  We recommend that the contract's position and owner attributes are included.NOTE: This attribute is not available for update or retrieval. | Optional |
| type2 | Selection | Client/Pre-client TypeThis field uses the following coded values:CodeDescriptionACActive ClientICInactive ClientPCPre-clientPIPre-client (Inactive)10Stakeholder | Code | Description | AC | Active Client | IC | Inactive Client | PC | Pre-client | PI | Pre-client (Inactive) | 10 | Stakeholder | Mandatory |
| Code | Description |
| AC | Active Client |
| IC | Inactive Client |
| PC | Pre-client |
| PI | Pre-client (Inactive) |
| 10 | Stakeholder |
| stakeholderType | Selection | Stakeholder TypeThis field uses the following coded values:CodeDescription-(Undefined)OFCLElected OfficialFEDFederal Government EntitySTAFFInternal StaffLOCALLocal Government EntityMILMilitary InstallationNGONGOPRIMEPrime ContractorPARTResource PartnerSTATEState Government Entity | Code | Description | - | (Undefined) | OFCL | Elected Official | FED | Federal Government Entity | STAFF | Internal Staff | LOCAL | Local Government Entity | MIL | Military Installation | NGO | NGO | PRIME | Prime Contractor | PART | Resource Partner | STATE | State Government Entity | Optional |
| Code | Description |
| - | (Undefined) |
| OFCL | Elected Official |
| FED | Federal Government Entity |
| STAFF | Internal Staff |
| LOCAL | Local Government Entity |
| MIL | Military Installation |
| NGO | NGO |
| PRIME | Prime Contractor |
| PART | Resource Partner |
| STATE | State Government Entity |
| serviceSeeking | Selection | Services SoughtThis field uses the following coded values:CodeDescription1Counseling2Training | Code | Description | 1 | Counseling | 2 | Training | Optional |
| Code | Description |
| 1 | Counseling |
| 2 | Training |
| company | Edit | Company Name | Mandatory |
| dba | Edit | DBA | Optional |
| busphone | PhoneNumber | Phone Number | Optional |
| busphone2 | PhoneNumber | Secondary Phone Number | Optional |
| busfax | PhoneNumber | Fax Number | Optional |
| busemail | EmailAddressList | Email Address | Optional |
| emailingLists | Boolean | Subscribe to emails?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| url | URL | Website | Optional |
| started | Date | Client Start Date | Optional |
| expires | Date | Expiration Date | Optional |
| physaddr | Address | Physical Address | Mandatory |
| physcity | Edit | Physical Address City | Mandatory |
| physst | Selection | Physical Address StateThis field uses the following coded values:CodeDescription-(Undefined)ALAlabamaAKAlaskaASAmerican SamoaAZArizonaARArkansasCACaliforniaCOColoradoCTConnecticutDEDelawareFMFederated States of MicronesiaFLFloridaGAGeorgiaGUGuamHIHawaiiIDIdahoILIllinoisINIndianaIAIowaKSKansasKYKentuckyLALouisianaMEMaineMHMarshall IslandsMDMarylandMAMassachusettsMIMichiganMNMinnesotaMSMississippiMOMissouriMTMontanaNENebraskaNVNevadaNHNew HampshireNJNew JerseyNMNew MexicoNYNew YorkNCNorth CarolinaNDNorth DakotaMPNorthern Mariana IslandsOHOhioOKOklahomaOROregonPWPalauPAPennsylvaniaPRPuerto RicoRIRhode IslandSCSouth CarolinaSDSouth DakotaTNTennesseeTXTexasVIUS Virgin IslandsUTUtahVTVermontVAVirginiaWAWashingtonDCWashington DCWVWest VirginiaWIWisconsinWYWyoming | Code | Description | - | (Undefined) | AL | Alabama | AK | Alaska | AS | American Samoa | AZ | Arizona | AR | Arkansas | CA | California | CO | Colorado | CT | Connecticut | DE | Delaware | FM | Federated States of Micronesia | FL | Florida | GA | Georgia | GU | Guam | HI | Hawaii | ID | Idaho | IL | Illinois | IN | Indiana | IA | Iowa | KS | Kansas | KY | Kentucky | LA | Louisiana | ME | Maine | MH | Marshall Islands | MD | Maryland | MA | Massachusetts | MI | Michigan | MN | Minnesota | MS | Mississippi | MO | Missouri | MT | Montana | NE | Nebraska | NV | Nevada | NH | New Hampshire | NJ | New Jersey | NM | New Mexico | NY | New York | NC | North Carolina | ND | North Dakota | MP | Northern Mariana Islands | OH | Ohio | OK | Oklahoma | OR | Oregon | PW | Palau | PA | Pennsylvania | PR | Puerto Rico | RI | Rhode Island | SC | South Carolina | SD | South Dakota | TN | Tennessee | TX | Texas | VI | US Virgin Islands | UT | Utah | VT | Vermont | VA | Virginia | WA | Washington | DC | Washington DC | WV | West Virginia | WI | Wisconsin | WY | Wyoming | Mandatory |
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
| physzip | Edit | Physical Address ZIP Code | Mandatory |
| county | AddressAdm2 | Physical Address County | Mandatory |
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
| senateDistState | Representative | State Senate District | Mandatory |
| mailUsePhys | Boolean | Mailing address is the same as physical address?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| mailaddr | Address | Mailing Address | Optional |
| mailcity | Edit | Mailing City | Optional |
| mailst | Selection | Mailing StateThis field uses the following coded values:CodeDescription-(Undefined)ALAlabamaAKAlaskaASAmerican SamoaAZArizonaARArkansasCACaliforniaCOColoradoCTConnecticutDEDelawareFMFederated States of MicronesiaFLFloridaGAGeorgiaGUGuamHIHawaiiIDIdahoILIllinoisINIndianaIAIowaKSKansasKYKentuckyLALouisianaMEMaineMHMarshall IslandsMDMarylandMAMassachusettsMIMichiganMNMinnesotaMSMississippiMOMissouriMTMontanaNENebraskaNVNevadaNHNew HampshireNJNew JerseyNMNew MexicoNYNew YorkNCNorth CarolinaNDNorth DakotaMPNorthern Mariana IslandsOHOhioOKOklahomaOROregonPWPalauPAPennsylvaniaPRPuerto RicoRIRhode IslandSCSouth CarolinaSDSouth DakotaTNTennesseeTXTexasVIUS Virgin IslandsUTUtahVTVermontVAVirginiaWAWashingtonDCWashington DCWVWest VirginiaWIWisconsinWYWyoming | Code | Description | - | (Undefined) | AL | Alabama | AK | Alaska | AS | American Samoa | AZ | Arizona | AR | Arkansas | CA | California | CO | Colorado | CT | Connecticut | DE | Delaware | FM | Federated States of Micronesia | FL | Florida | GA | Georgia | GU | Guam | HI | Hawaii | ID | Idaho | IL | Illinois | IN | Indiana | IA | Iowa | KS | Kansas | KY | Kentucky | LA | Louisiana | ME | Maine | MH | Marshall Islands | MD | Maryland | MA | Massachusetts | MI | Michigan | MN | Minnesota | MS | Mississippi | MO | Missouri | MT | Montana | NE | Nebraska | NV | Nevada | NH | New Hampshire | NJ | New Jersey | NM | New Mexico | NY | New York | NC | North Carolina | ND | North Dakota | MP | Northern Mariana Islands | OH | Ohio | OK | Oklahoma | OR | Oregon | PW | Palau | PA | Pennsylvania | PR | Puerto Rico | RI | Rhode Island | SC | South Carolina | SD | South Dakota | TN | Tennessee | TX | Texas | VI | US Virgin Islands | UT | Utah | VT | Vermont | VA | Virginia | WA | Washington | DC | Washington DC | WV | West Virginia | WI | Wisconsin | WY | Wyoming | Optional |
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
| mailzip | Edit | Mailing ZIP Code | Optional |
| mailCounty | Selection | Mailing Address County | Optional |
|  | ReadOnly |  | Optional |
|  | ReadOnly |  | Optional |
| ethnic | Selection | Ethnicity-ExpandedThis field uses the following coded values:CodeDescription-Amer Indian or Alaskan Native & BlackAmer Indian or Alaskan Native & BlackAmer Indian or Alaskan Native & WhiteAmer Indian or Alaskan Native & WhiteArabArabAsianAsianAsian & BlackAsian & BlackAsian & WhiteAsian & WhiteBlack or African AmericanBlack or African AmericanBlack or African American & WhiteBlack or African American & WhiteChineseChineseFilipinoFilipinoHispanic/LatinoHispanic/LatinoJapaneseJapaneseKoreanKoreanMiddle EasternMiddle EasternMultiracialMultiracialNative American or Alaskan NativeNative American or Alaskan NativeNative Hawaiian or Pacific IslanderNative Hawaiian or Pacific IslanderRussianRussianSamoanSamoanSouth East Asian - IndianSouth East Asian - IndianVietnameseVietnameseWhite/CaucasianWhite/CaucasianOtherOtherChoose not to respondChoose not to respond | Code | Description | - |  | Amer Indian or Alaskan Native & Black | Amer Indian or Alaskan Native & Black | Amer Indian or Alaskan Native & White | Amer Indian or Alaskan Native & White | Arab | Arab | Asian | Asian | Asian & Black | Asian & Black | Asian & White | Asian & White | Black or African American | Black or African American | Black or African American & White | Black or African American & White | Chinese | Chinese | Filipino | Filipino | Hispanic/Latino | Hispanic/Latino | Japanese | Japanese | Korean | Korean | Middle Eastern | Middle Eastern | Multiracial | Multiracial | Native American or Alaskan Native | Native American or Alaskan Native | Native Hawaiian or Pacific Islander | Native Hawaiian or Pacific Islander | Russian | Russian | Samoan | Samoan | South East Asian - Indian | South East Asian - Indian | Vietnamese | Vietnamese | White/Caucasian | White/Caucasian | Other | Other | Choose not to respond | Choose not to respond | Optional |
| Code | Description |
| - |  |
| Amer Indian or Alaskan Native & Black | Amer Indian or Alaskan Native & Black |
| Amer Indian or Alaskan Native & White | Amer Indian or Alaskan Native & White |
| Arab | Arab |
| Asian | Asian |
| Asian & Black | Asian & Black |
| Asian & White | Asian & White |
| Black or African American | Black or African American |
| Black or African American & White | Black or African American & White |
| Chinese | Chinese |
| Filipino | Filipino |
| Hispanic/Latino | Hispanic/Latino |
| Japanese | Japanese |
| Korean | Korean |
| Middle Eastern | Middle Eastern |
| Multiracial | Multiracial |
| Native American or Alaskan Native | Native American or Alaskan Native |
| Native Hawaiian or Pacific Islander | Native Hawaiian or Pacific Islander |
| Russian | Russian |
| Samoan | Samoan |
| South East Asian - Indian | South East Asian - Indian |
| Vietnamese | Vietnamese |
| White/Caucasian | White/Caucasian |
| Other | Other |
| Choose not to respond | Choose not to respond |
| user5 | Edit | Language | Optional |
| age | Selection | AgeThis field uses the following coded values:CodeDescription-18-2418-2425-6425-6465+65+Not StatedNot Stated | Code | Description | - |  | 18-24 | 18-24 | 25-64 | 25-64 | 65+ | 65+ | Not Stated | Not Stated | Optional |
| Code | Description |
| - |  |
| 18-24 | 18-24 |
| 25-64 | 25-64 |
| 65+ | 65+ |
| Not Stated | Not Stated |
| yep | Boolean | Qualifies for YEP (14-27 yrs old) ?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| employed | Boolean | Primary contact employed at intake?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| busbasic | Boolean | Have you attended the Business Basics workshopThis is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
|  | ReadOnly |  | Optional |
| sbdcsp | MultipleSelection | SBDC Regional Special ProgramsThis field uses the following coded values:CodeDescriptionAffiliate ProgramAffiliate ProgramAIAIBay AngelsBay AngelsBeauty BossBeauty BossCA Chamber of CommerceCA Chamber of CommerceCA HispanicCA HispanicCA Shop SmallCA Shop SmallCarlsen CenterCarlsen CenterChicostartChicostartFAST Grant ProgramFAST Grant ProgramFinance CenterFinance CenterGrowth with ProfitsGrowth with ProfitsNorcal WTCNorcal WTCPitch GlobalPitch GlobalProBizProBizRegional TrainingRegional TrainingRestaurant ProgramRestaurant ProgramRT-surveyRT-surveySanta Cruz WorksSanta Cruz WorksSBDC HealthSBDC HealthSource Diverse Source LocalSource Diverse Source LocalStartup World Cup 2025Startup World Cup 2025TFGTFGUCB HaasUCB Haas*****INACTIVE**********INACTIVE*****z_California Black Chamberz_California Black Chamberz_CoBiz Richmondz_CoBiz Richmondz_HOLA SBDCz_HOLA SBDCz_Inclusivity Projectz_Inclusivity Projectz_North Bay Black Chamberz_North Bay Black Chamberz_Oakland African-American Chamberz_Oakland African-American Chamberz_Regional Advisingz_Regional Advisingz_San Francisco African-American Chamberz_San Francisco African-American Chamberz_San Joaquin African-American Chamberz_San Joaquin African-American Chamberz_SBDCtech @ UC Davis Venture Catalystz_SBDCtech @ UC Davis Venture Catalystz_Silicon Valley Black Chamberz_Silicon Valley Black Chamber | Code | Description | Affiliate Program | Affiliate Program | AI | AI | Bay Angels | Bay Angels | Beauty Boss | Beauty Boss | CA Chamber of Commerce | CA Chamber of Commerce | CA Hispanic | CA Hispanic | CA Shop Small | CA Shop Small | Carlsen Center | Carlsen Center | Chicostart | Chicostart | FAST Grant Program | FAST Grant Program | Finance Center | Finance Center | Growth with Profits | Growth with Profits | Norcal WTC | Norcal WTC | Pitch Global | Pitch Global | ProBiz | ProBiz | Regional Training | Regional Training | Restaurant Program | Restaurant Program | RT-survey | RT-survey | Santa Cruz Works | Santa Cruz Works | SBDC Health | SBDC Health | Source Diverse Source Local | Source Diverse Source Local | Startup World Cup 2025 | Startup World Cup 2025 | TFG | TFG | UCB Haas | UCB Haas | *****INACTIVE***** | *****INACTIVE***** | z_California Black Chamber | z_California Black Chamber | z_CoBiz Richmond | z_CoBiz Richmond | z_HOLA SBDC | z_HOLA SBDC | z_Inclusivity Project | z_Inclusivity Project | z_North Bay Black Chamber | z_North Bay Black Chamber | z_Oakland African-American Chamber | z_Oakland African-American Chamber | z_Regional Advising | z_Regional Advising | z_San Francisco African-American Chamber | z_San Francisco African-American Chamber | z_San Joaquin African-American Chamber | z_San Joaquin African-American Chamber | z_SBDCtech @ UC Davis Venture Catalyst | z_SBDCtech @ UC Davis Venture Catalyst | z_Silicon Valley Black Chamber | z_Silicon Valley Black Chamber | Optional |
| Code | Description |
| Affiliate Program | Affiliate Program |
| AI | AI |
| Bay Angels | Bay Angels |
| Beauty Boss | Beauty Boss |
| CA Chamber of Commerce | CA Chamber of Commerce |
| CA Hispanic | CA Hispanic |
| CA Shop Small | CA Shop Small |
| Carlsen Center | Carlsen Center |
| Chicostart | Chicostart |
| FAST Grant Program | FAST Grant Program |
| Finance Center | Finance Center |
| Growth with Profits | Growth with Profits |
| Norcal WTC | Norcal WTC |
| Pitch Global | Pitch Global |
| ProBiz | ProBiz |
| Regional Training | Regional Training |
| Restaurant Program | Restaurant Program |
| RT-survey | RT-survey |
| Santa Cruz Works | Santa Cruz Works |
| SBDC Health | SBDC Health |
| Source Diverse Source Local | Source Diverse Source Local |
| Startup World Cup 2025 | Startup World Cup 2025 |
| TFG | TFG |
| UCB Haas | UCB Haas |
| *****INACTIVE***** | *****INACTIVE***** |
| z_California Black Chamber | z_California Black Chamber |
| z_CoBiz Richmond | z_CoBiz Richmond |
| z_HOLA SBDC | z_HOLA SBDC |
| z_Inclusivity Project | z_Inclusivity Project |
| z_North Bay Black Chamber | z_North Bay Black Chamber |
| z_Oakland African-American Chamber | z_Oakland African-American Chamber |
| z_Regional Advising | z_Regional Advising |
| z_San Francisco African-American Chamber | z_San Francisco African-American Chamber |
| z_San Joaquin African-American Chamber | z_San Joaquin African-American Chamber |
| z_SBDCtech @ UC Davis Venture Catalyst | z_SBDCtech @ UC Davis Venture Catalyst |
| z_Silicon Valley Black Chamber | z_Silicon Valley Black Chamber |
| specialpgm | Edit | Special Program | Optional |
| fundpgm | Edit | Client Funding Program | Optional |
| other | Edit | Other | Optional |
| cdbgicd | Edit | CDBG Income Certification Date | Optional |
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
| familyinc | Currency | Annual Family Income | Optional |
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
| sglparent | Boolean | Single-Parent Family?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
|  | ReadOnly |  | Optional |
|  | Selection | TFG AcceptanceThis field uses the following coded values:CodeDescription-AcceptedAcceptedNon-SelectedNon-Selected | Code | Description | - |  | Accepted | Accepted | Non-Selected | Non-Selected | Optional |
| Code | Description |
| - |  |
| Accepted | Accepted |
| Non-Selected | Non-Selected |
| tfgrsel | Selection | TFG Reason for SelectionThis field uses the following coded values:CodeDescription-Disruptive TechDisruptive TechAmazing Founder ExperienceAmazing Founder ExperienceDisruptive Tech & Amazing Founder ExperienceDisruptive Tech & Amazing Founder ExperienceOtherOther | Code | Description | - |  | Disruptive Tech | Disruptive Tech | Amazing Founder Experience | Amazing Founder Experience | Disruptive Tech & Amazing Founder Experience | Disruptive Tech & Amazing Founder Experience | Other | Other | Optional |
| Code | Description |
| - |  |
| Disruptive Tech | Disruptive Tech |
| Amazing Founder Experience | Amazing Founder Experience |
| Disruptive Tech & Amazing Founder Experience | Disruptive Tech & Amazing Founder Experience |
| Other | Other |
| tfgrnsel | Selection | TFG Reason for Non-SelectedThis field uses the following coded values:CodeDescription-Too EarlyToo EarlyNot a Venture Backable Tech StartupNot a Venture Backable Tech StartupToo Early & Not Venture BackableToo Early & Not Venture BackableOtherOther | Code | Description | - |  | Too Early | Too Early | Not a Venture Backable Tech Startup | Not a Venture Backable Tech Startup | Too Early & Not Venture Backable | Too Early & Not Venture Backable | Other | Other | Optional |
| Code | Description |
| - |  |
| Too Early | Too Early |
| Not a Venture Backable Tech Startup | Not a Venture Backable Tech Startup |
| Too Early & Not Venture Backable | Too Early & Not Venture Backable |
| Other | Other |
| tfgns | Edit | TFG Reason for Other (Selected or Non-Selected) | Optional |
| tfgrec | TextArea | TFG Recommendation for Non-TFG Assistance | Optional |
|  | ReadOnly |  | Optional |
| ebpc | Selection | East Bay Program CodeThis field uses the following coded values:CodeDescription-Alameda County Business AdvisingAlameda County Business AdvisingCity of San LeandroCity of San LeandroCity of HaywardCity of HaywardFood Entrepreneurs Training AcademyFood Entrepreneurs Training AcademyFremont BankFremont BankCity of ConcordCity of ConcordCity of AntiochCity of AntiochCity of AlamedaCity of AlamedaCity of BrentwoodCity of Brentwood | Code | Description | - |  | Alameda County Business Advising | Alameda County Business Advising | City of San Leandro | City of San Leandro | City of Hayward | City of Hayward | Food Entrepreneurs Training Academy | Food Entrepreneurs Training Academy | Fremont Bank | Fremont Bank | City of Concord | City of Concord | City of Antioch | City of Antioch | City of Alameda | City of Alameda | City of Brentwood | City of Brentwood | Optional |
| Code | Description |
| - |  |
| Alameda County Business Advising | Alameda County Business Advising |
| City of San Leandro | City of San Leandro |
| City of Hayward | City of Hayward |
| Food Entrepreneurs Training Academy | Food Entrepreneurs Training Academy |
| Fremont Bank | Fremont Bank |
| City of Concord | City of Concord |
| City of Antioch | City of Antioch |
| City of Alameda | City of Alameda |
| City of Brentwood | City of Brentwood |
| ebtraining | Selection | Would you be interested in in-person advising in .... ?This field uses the following coded values:CodeDescription-AlamedaAlamedaAntiochAntiochBrentwoodBrentwoodConcordConcordOaklandOaklandRichmondRichmondSan LeandroSan Leandro | Code | Description | - |  | Alameda | Alameda | Antioch | Antioch | Brentwood | Brentwood | Concord | Concord | Oakland | Oakland | Richmond | Richmond | San Leandro | San Leandro | Optional |
| Code | Description |
| - |  |
| Alameda | Alameda |
| Antioch | Antioch |
| Brentwood | Brentwood |
| Concord | Concord |
| Oakland | Oakland |
| Richmond | Richmond |
| San Leandro | San Leandro |
|  | ReadOnly |  | Optional |
| clw | Boolean | Centro Latino WestThis is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
|  | ReadOnly |  | Optional |
| sjsuaff | Selection | What is your SJSU Affiliation?This field uses the following coded values:CodeDescription-FacultyFacultyStaffStaffStudentStudentTeam MemberTeam Member | Code | Description | - |  | Faculty | Faculty | Staff | Staff | Student | Student | Team Member | Team Member | Optional |
| Code | Description |
| - |  |
| Faculty | Faculty |
| Staff | Staff |
| Student | Student |
| Team Member | Team Member |
| svtech | Selection | Tech vs NonTechThis field uses the following coded values:CodeDescription-TechTechNonTechNonTech | Code | Description | - |  | Tech | Tech | NonTech | NonTech | Optional |
| Code | Description |
| - |  |
| Tech | Tech |
| NonTech | NonTech |
| scsbdc | ReadOnly | Santa Cruz SBDC | Optional |
| spsc | MultipleSelection | Santa Cruz Special ProgramsThis field uses the following coded values:CodeDescriptionResetResetLayoff Aversion SCLayoff Aversion SCCMTCCMTCGo-BizGo-Biz | Code | Description | Reset | Reset | Layoff Aversion SC | Layoff Aversion SC | CMTC | CMTC | Go-Biz | Go-Biz | Optional |
| Code | Description |
| Reset | Reset |
| Layoff Aversion SC | Layoff Aversion SC |
| CMTC | CMTC |
| Go-Biz | Go-Biz |
| cabrillo | Boolean | Are you a student of Cabrillo College?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| retjob | Boolean | Are you applying for services to retain current jobs in the business, including your own?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| contact | Selection | What is your preferred method of contact?This field uses the following coded values:CodeDescription-PhonePhoneEmailEmailTextText | Code | Description | - |  | Phone | Phone | Email | Email | Text | Text | Optional |
| Code | Description |
| - |  |
| Phone | Phone |
| Email | Email |
| Text | Text |
|  | ReadOnly |  | Optional |
| sflbs | Selection | San Francisco Legacy Business StatusThis field uses the following coded values:CodeDescription-Not ApplicableNot ApplicableEligibleEligibleApplicantApplicantRegisteredRegistered | Code | Description | - |  | Not Applicable | Not Applicable | Eligible | Eligible | Applicant | Applicant | Registered | Registered | Optional |
| Code | Description |
| - |  |
| Not Applicable | Not Applicable |
| Eligible | Eligible |
| Applicant | Applicant |
| Registered | Registered |
| sfban | Edit | Business Account Number | Optional |
|  | ReadOnly |  | Optional |
| sonprco | Selection | Sonoma Program CodesThis field uses the following coded values:CodeDescription-PitchFestPitchFestSBERSBERSBER & PitchFestSBER & PitchFest | Code | Description | - |  | PitchFest | PitchFest | SBER | SBER | SBER & PitchFest | SBER & PitchFest | Optional |
| Code | Description |
| - |  |
| PitchFest | PitchFest |
| SBER | SBER |
| SBER & PitchFest | SBER & PitchFest |
| dob | DateSimple | Date of Birth | Optional |
| gender | Selection | Gender ExpandedThis field uses the following coded values:CodeDescription-Man (cisgender)Man (cisgender)Man (transgender)Man (transgender)Woman (cisgender)Woman (cisgender)Woman (transgender)Woman (transgender)Two Spirit (2S)Two Spirit (2S)Nonbinary/agenderNonbinary/agenderIntersexIntersexAnother gender identityAnother gender identityI'm not sure or I'm still exploring my gender identityI'm not sure or I'm still exploring my gender identityUnknownUnknownPrefer not to statePrefer not to state | Code | Description | - |  | Man (cisgender) | Man (cisgender) | Man (transgender) | Man (transgender) | Woman (cisgender) | Woman (cisgender) | Woman (transgender) | Woman (transgender) | Two Spirit (2S) | Two Spirit (2S) | Nonbinary/agender | Nonbinary/agender | Intersex | Intersex | Another gender identity | Another gender identity | I'm not sure or I'm still exploring my gender identity | I'm not sure or I'm still exploring my gender identity | Unknown | Unknown | Prefer not to state | Prefer not to state | Optional |
| Code | Description |
| - |  |
| Man (cisgender) | Man (cisgender) |
| Man (transgender) | Man (transgender) |
| Woman (cisgender) | Woman (cisgender) |
| Woman (transgender) | Woman (transgender) |
| Two Spirit (2S) | Two Spirit (2S) |
| Nonbinary/agender | Nonbinary/agender |
| Intersex | Intersex |
| Another gender identity | Another gender identity |
| I'm not sure or I'm still exploring my gender identity | I'm not sure or I'm still exploring my gender identity |
| Unknown | Unknown |
| Prefer not to state | Prefer not to state |
|  | ReadOnly |  | Optional |
|  | ReadOnly |  | Optional |
| user20 | Boolean | City of Chico ClientThis is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| user25 | Decimal | Income Level (City of Chico) | Optional |
| user26 | Decimal | # In Household (City of Chico) | Optional |
|  | ReadOnly |  | Optional |
| bcclient | Boolean | Butte County ClientThis is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| bcincome | Decimal | Income Level (Butte County) | Optional |
| bchousehol | Decimal | # In Household (Butte County) | Optional |
|  | ReadOnly |  | Optional |
| wildfires | Boolean | Has your business been affected by the 2018 wildfires in Shasta and Trinity Counties?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
|  | ReadOnly |  | Optional |
| mehko | Boolean | MEHKO Client?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| initcons | DateSimple | Date of Initial MEHKO Consultation | Optional |
| ethnmehko | Selection | Race or Ethnicity of MEHKO ClientThis field uses the following coded values:CodeDescription-AsianAsianAlaskan Native or Native AmericanAlaskan Native or Native AmericanBlack or African AmericanBlack or African AmericanLatino or HispanicLatino or HispanicNative Hawaiian or Pacific IslanderNative Hawaiian or Pacific IslanderMultiracialMultiracialChoose not to respondChoose not to respondWhite/CaucasianWhite/Caucasian | Code | Description | - |  | Asian | Asian | Alaskan Native or Native American | Alaskan Native or Native American | Black or African American | Black or African American | Latino or Hispanic | Latino or Hispanic | Native Hawaiian or Pacific Islander | Native Hawaiian or Pacific Islander | Multiracial | Multiracial | Choose not to respond | Choose not to respond | White/Caucasian | White/Caucasian | Optional |
| Code | Description |
| - |  |
| Asian | Asian |
| Alaskan Native or Native American | Alaskan Native or Native American |
| Black or African American | Black or African American |
| Latino or Hispanic | Latino or Hispanic |
| Native Hawaiian or Pacific Islander | Native Hawaiian or Pacific Islander |
| Multiracial | Multiracial |
| Choose not to respond | Choose not to respond |
| White/Caucasian | White/Caucasian |
| gendmehko | Selection | Gender of MEHKO ClientThis field uses the following coded values:CodeDescription-MaleMaleFemaleFemaleChoose not to respondChoose not to respondTrans-genderTrans-genderNon-binaryNon-binary | Code | Description | - |  | Male | Male | Female | Female | Choose not to respond | Choose not to respond | Trans-gender | Trans-gender | Non-binary | Non-binary | Optional |
| Code | Description |
| - |  |
| Male | Male |
| Female | Female |
| Choose not to respond | Choose not to respond |
| Trans-gender | Trans-gender |
| Non-binary | Non-binary |
| vetmehko | Selection | Veteran Status of MEHKO ClientThis field uses the following coded values:CodeDescription-VeteranVeteranNon-veteranNon-veteranService-Disable VeteranService-Disable VeteranChoose not to respondChoose not to respond | Code | Description | - |  | Veteran | Veteran | Non-veteran | Non-veteran | Service-Disable Veteran | Service-Disable Veteran | Choose not to respond | Choose not to respond | Optional |
| Code | Description |
| - |  |
| Veteran | Veteran |
| Non-veteran | Non-veteran |
| Service-Disable Veteran | Service-Disable Veteran |
| Choose not to respond | Choose not to respond |
|  | ReadOnly |  | Optional |
| bplan | Boolean | Do you have a business plan? This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| finance | Boolean | Do you have money to finance your business venture?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| funding2 | Currency | How much funding are you seeking? $ | Optional |
| step1 | Selection | Step One: How may we help you? This field uses the following coded values:CodeDescription-I want to update my Contact InformationI want to update my Contact InformationApplying for Advising Services for the first timeApplying for Advising Services for the first timeLooking for Classes & EventsLooking for Classes & EventsReconnect with my AdvisorReconnect with my AdvisorReconnect with my local SBDC office for a quick questionReconnect with my local SBDC office for a quick questionBusiness has moved locations, I want to connect with new local SBDCBusiness has moved locations, I want to connect with new local SBDCI have worked with the SBDC, but now I have a New Business to discussI have worked with the SBDC, but now I have a New Business to discussI completed my Intake Interview, but I haven’t heard from an Advisor yetI completed my Intake Interview, but I haven’t heard from an Advisor yetRequest for a new AdvisorRequest for a new AdvisorNone of the AboveNone of the Above | Code | Description | - |  | I want to update my Contact Information | I want to update my Contact Information | Applying for Advising Services for the first time | Applying for Advising Services for the first time | Looking for Classes & Events | Looking for Classes & Events | Reconnect with my Advisor | Reconnect with my Advisor | Reconnect with my local SBDC office for a quick question | Reconnect with my local SBDC office for a quick question | Business has moved locations, I want to connect with new local SBDC | Business has moved locations, I want to connect with new local SBDC | I have worked with the SBDC, but now I have a New Business to discuss | I have worked with the SBDC, but now I have a New Business to discuss | I completed my Intake Interview, but I haven’t heard from an Advisor yet | I completed my Intake Interview, but I haven’t heard from an Advisor yet | Request for a new Advisor | Request for a new Advisor | None of the Above | None of the Above | Optional |
| Code | Description |
| - |  |
| I want to update my Contact Information | I want to update my Contact Information |
| Applying for Advising Services for the first time | Applying for Advising Services for the first time |
| Looking for Classes & Events | Looking for Classes & Events |
| Reconnect with my Advisor | Reconnect with my Advisor |
| Reconnect with my local SBDC office for a quick question | Reconnect with my local SBDC office for a quick question |
| Business has moved locations, I want to connect with new local SBDC | Business has moved locations, I want to connect with new local SBDC |
| I have worked with the SBDC, but now I have a New Business to discuss | I have worked with the SBDC, but now I have a New Business to discuss |
| I completed my Intake Interview, but I haven’t heard from an Advisor yet | I completed my Intake Interview, but I haven’t heard from an Advisor yet |
| Request for a new Advisor | Request for a new Advisor |
| None of the Above | None of the Above |
| step2 | MultipleSelection | Step Two: How may we assist your business?This field uses the following coded values:CodeDescriptionAdvertising/BrandingAdvertising/BrandingAIAIBookkeepingBookkeepingBusiness Accounting/BudgetBusiness Accounting/BudgetBusiness PlanBusiness PlanBuying/Selling a BusinessBuying/Selling a BusinessCertifications/ContractingCertifications/ContractingCredit RepairCredit RepairCybersecurity AssistanceCybersecurity AssistanceDisaster AssistanceDisaster AssistanceeCommerceeCommerceEngineering R&DEngineering R&DExportingExportingExpansion/ScalingExpansion/ScalingFunding/Loan AssistanceFunding/Loan AssistanceFranchisingFranchisingHR/Managing EmployeesHR/Managing EmployeesIntellectual PropertyIntellectual PropertyJob Support/Job RetentionJob Support/Job RetentionManaging a BusinessManaging a BusinessMarketing/SalesMarketing/SalesPublic RelationsPublic RelationsOtherOtherStart Up AssistanceStart Up AssistanceSocial Media MarketingSocial Media MarketingSupply Chain/Inventory ManagementSupply Chain/Inventory ManagementTechnology/ComputersTechnology/Computers | Code | Description | Advertising/Branding | Advertising/Branding | AI | AI | Bookkeeping | Bookkeeping | Business Accounting/Budget | Business Accounting/Budget | Business Plan | Business Plan | Buying/Selling a Business | Buying/Selling a Business | Certifications/Contracting | Certifications/Contracting | Credit Repair | Credit Repair | Cybersecurity Assistance | Cybersecurity Assistance | Disaster Assistance | Disaster Assistance | eCommerce | eCommerce | Engineering R&D | Engineering R&D | Exporting | Exporting | Expansion/Scaling | Expansion/Scaling | Funding/Loan Assistance | Funding/Loan Assistance | Franchising | Franchising | HR/Managing Employees | HR/Managing Employees | Intellectual Property | Intellectual Property | Job Support/Job Retention | Job Support/Job Retention | Managing a Business | Managing a Business | Marketing/Sales | Marketing/Sales | Public Relations | Public Relations | Other | Other | Start Up Assistance | Start Up Assistance | Social Media Marketing | Social Media Marketing | Supply Chain/Inventory Management | Supply Chain/Inventory Management | Technology/Computers | Technology/Computers | Optional |
| Code | Description |
| Advertising/Branding | Advertising/Branding |
| AI | AI |
| Bookkeeping | Bookkeeping |
| Business Accounting/Budget | Business Accounting/Budget |
| Business Plan | Business Plan |
| Buying/Selling a Business | Buying/Selling a Business |
| Certifications/Contracting | Certifications/Contracting |
| Credit Repair | Credit Repair |
| Cybersecurity Assistance | Cybersecurity Assistance |
| Disaster Assistance | Disaster Assistance |
| eCommerce | eCommerce |
| Engineering R&D | Engineering R&D |
| Exporting | Exporting |
| Expansion/Scaling | Expansion/Scaling |
| Funding/Loan Assistance | Funding/Loan Assistance |
| Franchising | Franchising |
| HR/Managing Employees | HR/Managing Employees |
| Intellectual Property | Intellectual Property |
| Job Support/Job Retention | Job Support/Job Retention |
| Managing a Business | Managing a Business |
| Marketing/Sales | Marketing/Sales |
| Public Relations | Public Relations |
| Other | Other |
| Start Up Assistance | Start Up Assistance |
| Social Media Marketing | Social Media Marketing |
| Supply Chain/Inventory Management | Supply Chain/Inventory Management |
| Technology/Computers | Technology/Computers |
| other | Edit | If Other | Optional |
| statusInit | Selection | Initial Business StatusThis field uses the following coded values:CodeDescription?(Undefined)PPre-venture/NascentSStart-up (in bus. < 1 year)BIn Business (> 1 year) | Code | Description | ? | (Undefined) | P | Pre-venture/Nascent | S | Start-up (in bus. < 1 year) | B | In Business (> 1 year) | Optional |
| Code | Description |
| ? | (Undefined) |
| P | Pre-venture/Nascent |
| S | Start-up (in bus. < 1 year) |
| B | In Business (> 1 year) |
| status | Selection | Company StatusThis field uses the following coded values:CodeDescription?(Undefined)PPre-venture/NascentSStart-up (in bus. < 1 year)BIn Business (> 1 year) | Code | Description | ? | (Undefined) | P | Pre-venture/Nascent | S | Start-up (in bus. < 1 year) | B | In Business (> 1 year) | Optional |
| Code | Description |
| ? | (Undefined) |
| P | Pre-venture/Nascent |
| S | Start-up (in bus. < 1 year) |
| B | In Business (> 1 year) |
| estab | Date | Date Company Established | Mandatory |
| verifiedInBusiness | Boolean | Verified to be in business?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| impactDate | Date | Reportable Business Start Impact | Mandatory |
| employeeOwned | Boolean | Employee owned?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| ftEmps | Integer | Full-Time Employees | Optional |
| ptEmps | Integer | Part-Time Employees | Optional |
| empsExport | Integer | Export-Related Employees | Optional |
| vsb | Boolean | Very Small Business (VSB)?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| ownerGender | Selection | Company Ownership GenderThis field uses the following coded values:CodeDescription-(Undefined)EEDWOSB CertifiedMMale-OwnedBMale/Female-OwnedNRPrefer not to sayWBWBE CertifiedFWoman-OwnedWWoman-Owned (WOSB) Certified | Code | Description | - | (Undefined) | E | EDWOSB Certified | M | Male-Owned | B | Male/Female-Owned | NR | Prefer not to say | WB | WBE Certified | F | Woman-Owned | W | Woman-Owned (WOSB) Certified | Optional |
| Code | Description |
| - | (Undefined) |
| E | EDWOSB Certified |
| M | Male-Owned |
| B | Male/Female-Owned |
| NR | Prefer not to say |
| WB | WBE Certified |
| F | Woman-Owned |
| W | Woman-Owned (WOSB) Certified |
| ownerGenderDate | Date | Ownership Gender Certification Date | Mandatory |
| womanOwnedPct | Integer | Percentage of Woman Ownership | Optional |
| ownerVeteran | Selection | Company Veteran StatusThis field uses the following coded values:CodeDescription-(Undefined)NANon-veteranNRPrefer not to saySDSDVOSB CertifiedDSService-Disabled VeteranVEVeteranVOVOSB Certified | Code | Description | - | (Undefined) | NA | Non-veteran | NR | Prefer not to say | SD | SDVOSB Certified | DS | Service-Disabled Veteran | VE | Veteran | VO | VOSB Certified | Optional |
| Code | Description |
| - | (Undefined) |
| NA | Non-veteran |
| NR | Prefer not to say |
| SD | SDVOSB Certified |
| DS | Service-Disabled Veteran |
| VE | Veteran |
| VO | VOSB Certified |
| ownerVeteranDate | Date | Veteran Certification Date | Optional |
| bussize | Selection | Business SizeThis field uses the following coded values:CodeDescription-(Undefined)MCMicroSDDisadvantaged SmallMIMinority-Owned SmallOSSmallMEMediumLGLargeNANot Applicable | Code | Description | - | (Undefined) | MC | Micro | SD | Disadvantaged Small | MI | Minority-Owned Small | OS | Small | ME | Medium | LG | Large | NA | Not Applicable | Optional |
| Code | Description |
| - | (Undefined) |
| MC | Micro |
| SD | Disadvantaged Small |
| MI | Minority-Owned Small |
| OS | Small |
| ME | Medium |
| LG | Large |
| NA | Not Applicable |
| disadvStatus | Selection | Disadvantage StatusThis field uses the following coded values:CodeDescriptionDBEDBE CertifiedMBEMBE CertifiedNANot Applicable8ASBA 8(a) CertifiedSCSelf-certified Disadvantaged/Minority OwnedNCUncertified | Code | Description | DBE | DBE Certified | MBE | MBE Certified | NA | Not Applicable | 8A | SBA 8(a) Certified | SC | Self-certified Disadvantaged/Minority Owned | NC | Uncertified | Optional |
| Code | Description |
| DBE | DBE Certified |
| MBE | MBE Certified |
| NA | Not Applicable |
| 8A | SBA 8(a) Certified |
| SC | Self-certified Disadvantaged/Minority Owned |
| NC | Uncertified |
| disadvCertdate | Date | Disadvantage Certification Date | Mandatory |
| bustype | Selection | Business TypeThis field uses the following coded values:CodeDescription?(Undefined)FSAccommodation and Food ServicesASAdministrative and SupportAGAgriculture, Forestry, Fishing and HuntingAEArts, Entertainment & RecreationCOConstructionEDEducational ServicesFIFinance and InsuranceHCHealth Care and Social AssistanceINInformationMGManagement of Companies and EnterprisesMFManufacturerMNMiningNRPrefer not to sayPTProfessional, Scientific, and Technical ServicesPAPublic AdministrationREReal Estate, Rental and LeasingRDResearch and DevelopmentDRetail TradeSVService EstablishmentTWTransportation and WarehousingUTUtilitiesWMWaste Management and Remediation ServicesWWholesale Trade | Code | Description | ? | (Undefined) | FS | Accommodation and Food Services | AS | Administrative and Support | AG | Agriculture, Forestry, Fishing and Hunting | AE | Arts, Entertainment & Recreation | CO | Construction | ED | Educational Services | FI | Finance and Insurance | HC | Health Care and Social Assistance | IN | Information | MG | Management of Companies and Enterprises | MF | Manufacturer | MN | Mining | NR | Prefer not to say | PT | Professional, Scientific, and Technical Services | PA | Public Administration | RE | Real Estate, Rental and Leasing | RD | Research and Development | D | Retail Trade | SV | Service Establishment | TW | Transportation and Warehousing | UT | Utilities | WM | Waste Management and Remediation Services | W | Wholesale Trade | Optional |
| Code | Description |
| ? | (Undefined) |
| FS | Accommodation and Food Services |
| AS | Administrative and Support |
| AG | Agriculture, Forestry, Fishing and Hunting |
| AE | Arts, Entertainment & Recreation |
| CO | Construction |
| ED | Educational Services |
| FI | Finance and Insurance |
| HC | Health Care and Social Assistance |
| IN | Information |
| MG | Management of Companies and Enterprises |
| MF | Manufacturer |
| MN | Mining |
| NR | Prefer not to say |
| PT | Professional, Scientific, and Technical Services |
| PA | Public Administration |
| RE | Real Estate, Rental and Leasing |
| RD | Research and Development |
| D | Retail Trade |
| SV | Service Establishment |
| TW | Transportation and Warehousing |
| UT | Utilities |
| WM | Waste Management and Remediation Services |
| W | Wholesale Trade |
| orgtype | Selection | Organization TypeThis field uses the following coded values:CodeDescription-(Undefined)BCB CorporationCCC CorporationCOCorporationLLimited Liability Co.NPNon-profit OrganizationPPartnershipISole ProprietorshipSSub S CorporationUNUnknown | Code | Description | - | (Undefined) | BC | B Corporation | CC | C Corporation | CO | Corporation | L | Limited Liability Co. | NP | Non-profit Organization | P | Partnership | I | Sole Proprietorship | S | Sub S Corporation | UN | Unknown | Optional |
| Code | Description |
| - | (Undefined) |
| BC | B Corporation |
| CC | C Corporation |
| CO | Corporation |
| L | Limited Liability Co. |
| NP | Non-profit Organization |
| P | Partnership |
| I | Sole Proprietorship |
| S | Sub S Corporation |
| UN | Unknown |
| incstate | Selection | State of IncorporationThis field uses the following coded values:CodeDescription-(Undefined)ALAlabamaAKAlaskaASAmerican SamoaAZArizonaARArkansasCACaliforniaCOColoradoCTConnecticutDEDelawareFMFederated States of MicronesiaFLFloridaGAGeorgiaGUGuamHIHawaiiIDIdahoILIllinoisINIndianaIAIowaKSKansasKYKentuckyLALouisianaMEMaineMHMarshall IslandsMDMarylandMAMassachusettsMIMichiganMNMinnesotaMSMississippiMOMissouriMTMontanaNENebraskaNVNevadaNHNew HampshireNJNew JerseyNMNew MexicoNYNew YorkNCNorth CarolinaNDNorth DakotaMPNorthern Mariana IslandsOHOhioOKOklahomaOROregonPWPalauPAPennsylvaniaPRPuerto RicoRIRhode IslandSCSouth CarolinaSDSouth DakotaTNTennesseeTXTexasVIUS Virgin IslandsUTUtahVTVermontVAVirginiaWAWashingtonDCWashington DCWVWest VirginiaWIWisconsinWYWyoming | Code | Description | - | (Undefined) | AL | Alabama | AK | Alaska | AS | American Samoa | AZ | Arizona | AR | Arkansas | CA | California | CO | Colorado | CT | Connecticut | DE | Delaware | FM | Federated States of Micronesia | FL | Florida | GA | Georgia | GU | Guam | HI | Hawaii | ID | Idaho | IL | Illinois | IN | Indiana | IA | Iowa | KS | Kansas | KY | Kentucky | LA | Louisiana | ME | Maine | MH | Marshall Islands | MD | Maryland | MA | Massachusetts | MI | Michigan | MN | Minnesota | MS | Mississippi | MO | Missouri | MT | Montana | NE | Nebraska | NV | Nevada | NH | New Hampshire | NJ | New Jersey | NM | New Mexico | NY | New York | NC | North Carolina | ND | North Dakota | MP | Northern Mariana Islands | OH | Ohio | OK | Oklahoma | OR | Oregon | PW | Palau | PA | Pennsylvania | PR | Puerto Rico | RI | Rhode Island | SC | South Carolina | SD | South Dakota | TN | Tennessee | TX | Texas | VI | US Virgin Islands | UT | Utah | VT | Vermont | VA | Virginia | WA | Washington | DC | Washington DC | WV | West Virginia | WI | Wisconsin | WY | Wyoming | Mandatory |
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
| hubzone | Selection | HUBZoneThis field uses the following coded values:CodeDescription-(Undefined)CCertifiedYLocation OnlyNNo | Code | Description | - | (Undefined) | C | Certified | Y | Location Only | N | No | Optional |
| Code | Description |
| - | (Undefined) |
| C | Certified |
| Y | Location Only |
| N | No |
| hubzoneDate | Date | HUBZone Certification Date | Mandatory |
| distress | Boolean | Distressed Area?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| locationTribalLands | Boolean | Located on Tribal Lands?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| tribe | Selection | Indian Tribal Entity | Optional |
| underserved | Boolean | Member of an underserved community?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| intlTrade | Selection | International TradeThis field uses the following coded values:CodeDescription-(Undefined)EExporterIImporterBImporter/ExporterNNone | Code | Description | - | (Undefined) | E | Exporter | I | Importer | B | Importer/Exporter | N | None | Optional |
| Code | Description |
| - | (Undefined) |
| E | Exporter |
| I | Importer |
| B | Importer/Exporter |
| N | None |
| exportCountries | MultipleSelection | Export CountriesThis field uses the following coded values:CodeDescription-(Undefined)AFAfghanistanAXAland IslandsALAlbaniaDZAlgeriaUS-ASAmerican SamoaADAndorraAOAngolaAIAnguillaAQAntarcticaAGAntigua and BarbudaARArgentinaAMArmeniaAWArubaAUAustraliaATAustriaAZAzerbaijanBSBahamasBHBahrainBDBangladeshBBBarbadosBYBelarusBEBelgiumBZBelizeBJBeninBMBermudaBTBhutanBOBoliviaBQBonaire/St. Eustatius/SabaBABosnia and HerzegovinaBWBotswanaBVBouvet IslandBRBrazilIOBritish Indian Ocean Terr.BNBrunei DarussalamBGBulgariaBFBurkina FasoBIBurundiKHCambodiaCMCameroonCACanadaCVCape VerdeKYCayman IslandsCFCentral African RepublicTDChadCLChileCNChinaCXChristmas IslandCCCocos (Keeling) IslandCOColombiaKMComorosCGCongoCDCongo, Dem. Rep. of theCKCook IslandsCRCosta RicaCICote d'IvoireHRCroatiaCUCubaCWCuracaoCYCyprusCZCzech RepublicDKDenmarkDJDjiboutiDMDominicaDODominican RepublicECEcuadorEGEgyptSVEl SalvadorGQEquatorial GuineaEREritreaEEEstoniaETEthiopiaFKFalkland IslandsFOFaroe IslandsFJFijiFIFinlandFRFranceGFFrench GuianaPFFrench PolynesiaTFFrench Southern TerritoriesGAGabonGMGambiaGEGeorgiaDEGermanyGHGhanaGIGibraltarGRGreeceGLGreenlandGDGrenadaGPGuadeloupeUS-GUGuamGTGuatemalaGGGuernseyGNGuineaGWGuinea-BissauGYGuyanaHTHaitiHMHeard/McDonald IslandsHNHondurasHKHong KongHUHungaryISIcelandINIndiaIDIndonesiaIRIran, Islamic Republic ofIQIraqIEIrelandIMIsle of ManILIsraelITItalyJMJamaicaJPJapanJEJerseyJOJordanKZKazakhstanKEKenyaKIKiribatiKPKorea, DPR (North)KRKorea, Republic of (South)KWKuwaitKGKyrgyzstanLALaosLVLatviaLBLebanonLSLesothoLRLiberiaLYLibyan Arab JamahiriyaLILiechtensteinLTLithuaniaLULuxembourgMOMacaoMKMacedonia (FYRM)MGMadagascarMWMalawiMYMalaysiaMVMaldivesMLMaliMTMaltaMHMarshall IslandsMQMartiniqueMRMauritaniaMUMauritiusYTMayotteMXMexicoFMMicronesiaMDMoldovaMCMonacoMNMongoliaMEMontenegroMSMontserratMAMoroccoMZMozambiqueMMMyanmar or BurmaNANamibiaNRNauruNPNepalNLNetherlandsNCNew CaledoniaNZNew ZealandNINicaraguaNENigerNGNigeriaNUNiueNFNorfolk IslandUS-MPNorthern Mariana IslandsNONorwayOMOmanPKPakistanPWPalauPSPalestinian TerritoryPAPanamaPGPapua New GuineaPYParaguayPEPeruPHPhilippinesPNPitcairnPLPolandPTPortugalUS-PRPuerto RicoQAQatarREReunionRORomaniaRURussian FederationRWRwandaBLSaint BarthelemySHSaint HelenaKNSaint Kitts and NevisLCSaint LuciaSXSaint Maarten (Dutch part)MFSaint Martin (French Part)PMSaint Pierre and MiquelonVCSaint Vincent/GrenadinesWSSamoaSMSan MarinoSTSao Tome and PrincipeSASaudi ArabiaSNSenegalRSSerbiaSCSeychellesSLSierra LeoneSGSingaporeSKSlovakiaSISloveniaSBSoloman IslandsSOSomaliaZASouth AfricaGSSouth Georgia/Sandwich Is.SSSouth SudanESSpainLKSri LankaSDSudanSRSurinameSJSvalbard and Jan MayenSZSwazilandSESwedenCHSwitzerlandSYSyrian Arab RepublicTWTaiwanTJTajikistanTZTanzaniaTHThailandTLTimor-LesteTGTogoTKTokelauTOTongaTTTrinidad and TobagoTNTunisiaTRTurkeyTMTurkmenistanTCTurks and Caicos IslandsTVTuvaluUGUgandaUAUkraineAEUnited Arab EmiratesGBUnited KingdomUSUnited StatesUS-UMUnited States Minor Outlying IslandsUYUruguayUS-VIUS Virgin IslandsUZUzbekistanVUVanuatuVAVatican CityVEVenezuelaVNVietnamVGVirgin Islands, BritishWFWallis and FutunaEHWestern SaharaYEYemenZMZambiaZWZimbabwe | Code | Description | - | (Undefined) | AF | Afghanistan | AX | Aland Islands | AL | Albania | DZ | Algeria | US-AS | American Samoa | AD | Andorra | AO | Angola | AI | Anguilla | AQ | Antarctica | AG | Antigua and Barbuda | AR | Argentina | AM | Armenia | AW | Aruba | AU | Australia | AT | Austria | AZ | Azerbaijan | BS | Bahamas | BH | Bahrain | BD | Bangladesh | BB | Barbados | BY | Belarus | BE | Belgium | BZ | Belize | BJ | Benin | BM | Bermuda | BT | Bhutan | BO | Bolivia | BQ | Bonaire/St. Eustatius/Saba | BA | Bosnia and Herzegovina | BW | Botswana | BV | Bouvet Island | BR | Brazil | IO | British Indian Ocean Terr. | BN | Brunei Darussalam | BG | Bulgaria | BF | Burkina Faso | BI | Burundi | KH | Cambodia | CM | Cameroon | CA | Canada | CV | Cape Verde | KY | Cayman Islands | CF | Central African Republic | TD | Chad | CL | Chile | CN | China | CX | Christmas Island | CC | Cocos (Keeling) Island | CO | Colombia | KM | Comoros | CG | Congo | CD | Congo, Dem. Rep. of the | CK | Cook Islands | CR | Costa Rica | CI | Cote d'Ivoire | HR | Croatia | CU | Cuba | CW | Curacao | CY | Cyprus | CZ | Czech Republic | DK | Denmark | DJ | Djibouti | DM | Dominica | DO | Dominican Republic | EC | Ecuador | EG | Egypt | SV | El Salvador | GQ | Equatorial Guinea | ER | Eritrea | EE | Estonia | ET | Ethiopia | FK | Falkland Islands | FO | Faroe Islands | FJ | Fiji | FI | Finland | FR | France | GF | French Guiana | PF | French Polynesia | TF | French Southern Territories | GA | Gabon | GM | Gambia | GE | Georgia | DE | Germany | GH | Ghana | GI | Gibraltar | GR | Greece | GL | Greenland | GD | Grenada | GP | Guadeloupe | US-GU | Guam | GT | Guatemala | GG | Guernsey | GN | Guinea | GW | Guinea-Bissau | GY | Guyana | HT | Haiti | HM | Heard/McDonald Islands | HN | Honduras | HK | Hong Kong | HU | Hungary | IS | Iceland | IN | India | ID | Indonesia | IR | Iran, Islamic Republic of | IQ | Iraq | IE | Ireland | IM | Isle of Man | IL | Israel | IT | Italy | JM | Jamaica | JP | Japan | JE | Jersey | JO | Jordan | KZ | Kazakhstan | KE | Kenya | KI | Kiribati | KP | Korea, DPR (North) | KR | Korea, Republic of (South) | KW | Kuwait | KG | Kyrgyzstan | LA | Laos | LV | Latvia | LB | Lebanon | LS | Lesotho | LR | Liberia | LY | Libyan Arab Jamahiriya | LI | Liechtenstein | LT | Lithuania | LU | Luxembourg | MO | Macao | MK | Macedonia (FYRM) | MG | Madagascar | MW | Malawi | MY | Malaysia | MV | Maldives | ML | Mali | MT | Malta | MH | Marshall Islands | MQ | Martinique | MR | Mauritania | MU | Mauritius | YT | Mayotte | MX | Mexico | FM | Micronesia | MD | Moldova | MC | Monaco | MN | Mongolia | ME | Montenegro | MS | Montserrat | MA | Morocco | MZ | Mozambique | MM | Myanmar or Burma | NA | Namibia | NR | Nauru | NP | Nepal | NL | Netherlands | NC | New Caledonia | NZ | New Zealand | NI | Nicaragua | NE | Niger | NG | Nigeria | NU | Niue | NF | Norfolk Island | US-MP | Northern Mariana Islands | NO | Norway | OM | Oman | PK | Pakistan | PW | Palau | PS | Palestinian Territory | PA | Panama | PG | Papua New Guinea | PY | Paraguay | PE | Peru | PH | Philippines | PN | Pitcairn | PL | Poland | PT | Portugal | US-PR | Puerto Rico | QA | Qatar | RE | Reunion | RO | Romania | RU | Russian Federation | RW | Rwanda | BL | Saint Barthelemy | SH | Saint Helena | KN | Saint Kitts and Nevis | LC | Saint Lucia | SX | Saint Maarten (Dutch part) | MF | Saint Martin (French Part) | PM | Saint Pierre and Miquelon | VC | Saint Vincent/Grenadines | WS | Samoa | SM | San Marino | ST | Sao Tome and Principe | SA | Saudi Arabia | SN | Senegal | RS | Serbia | SC | Seychelles | SL | Sierra Leone | SG | Singapore | SK | Slovakia | SI | Slovenia | SB | Soloman Islands | SO | Somalia | ZA | South Africa | GS | South Georgia/Sandwich Is. | SS | South Sudan | ES | Spain | LK | Sri Lanka | SD | Sudan | SR | Suriname | SJ | Svalbard and Jan Mayen | SZ | Swaziland | SE | Sweden | CH | Switzerland | SY | Syrian Arab Republic | TW | Taiwan | TJ | Tajikistan | TZ | Tanzania | TH | Thailand | TL | Timor-Leste | TG | Togo | TK | Tokelau | TO | Tonga | TT | Trinidad and Tobago | TN | Tunisia | TR | Turkey | TM | Turkmenistan | TC | Turks and Caicos Islands | TV | Tuvalu | UG | Uganda | UA | Ukraine | AE | United Arab Emirates | GB | United Kingdom | US | United States | US-UM | United States Minor Outlying Islands | UY | Uruguay | US-VI | US Virgin Islands | UZ | Uzbekistan | VU | Vanuatu | VA | Vatican City | VE | Venezuela | VN | Vietnam | VG | Virgin Islands, British | WF | Wallis and Futuna | EH | Western Sahara | YE | Yemen | ZM | Zambia | ZW | Zimbabwe | Mandatory |
| Code | Description |
| - | (Undefined) |
| AF | Afghanistan |
| AX | Aland Islands |
| AL | Albania |
| DZ | Algeria |
| US-AS | American Samoa |
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
| US-GU | Guam |
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
| LY | Libyan Arab Jamahiriya |
| LI | Liechtenstein |
| LT | Lithuania |
| LU | Luxembourg |
| MO | Macao |
| MK | Macedonia (FYRM) |
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
| US-MP | Northern Mariana Islands |
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
| US-PR | Puerto Rico |
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
| SZ | Swaziland |
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
| US-UM | United States Minor Outlying Islands |
| UY | Uruguay |
| US-VI | US Virgin Islands |
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
| busonline | Boolean | Conducting Business Online?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| homebased | Boolean | Home-based?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Mandatory |
| otEnglish | Boolean | Conducts business in a language other than English?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| oteLangs | MultipleSelection | Business LanguagesThis field uses the following coded values:CodeDescription-(Undefined)ARArabicHYArmenianYUECantonese/Yue ChineseZHChineseDRDariENEnglishFRFrenchDEGermanHIHindiHMHmongITItalianJAJapaneseKOKoreanLOLaoLVLatvianCMNMandarin ChinesePAPanjabi; PunjabiFAPersianPSPushto; PashtoRURussianSPSpanishSVSwedishTLTagalogTHThaiVIVietnamese | Code | Description | - | (Undefined) | AR | Arabic | HY | Armenian | YUE | Cantonese/Yue Chinese | ZH | Chinese | DR | Dari | EN | English | FR | French | DE | German | HI | Hindi | HM | Hmong | IT | Italian | JA | Japanese | KO | Korean | LO | Lao | LV | Latvian | CMN | Mandarin Chinese | PA | Panjabi; Punjabi | FA | Persian | PS | Pushto; Pashto | RU | Russian | SP | Spanish | SV | Swedish | TL | Tagalog | TH | Thai | VI | Vietnamese | Optional |
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
| fedid | Edit | Federal ID | Optional |
| sbaClientType | Selection | SBA Client TypeThis field uses the following coded values:CodeDescription-(Undefined)FFace to FaceOOnlineTTelephoneCTraining | Code | Description | - | (Undefined) | F | Face to Face | O | Online | T | Telephone | C | Training | Mandatory |
| Code | Description |
| - | (Undefined) |
| F | Face to Face |
| O | Online |
| T | Telephone |
| C | Training |
| sbarel | Selection | SBA RelationshipThis field uses the following coded values:CodeDescription?(Undefined)68(a) & Borrower78(a) & Surety Bond38(a) Client2Applicant1Borrower4COC8NonePAProcurement Assistance5Surety BondTATechnical Assistance | Code | Description | ? | (Undefined) | 6 | 8(a) & Borrower | 7 | 8(a) & Surety Bond | 3 | 8(a) Client | 2 | Applicant | 1 | Borrower | 4 | COC | 8 | None | PA | Procurement Assistance | 5 | Surety Bond | TA | Technical Assistance | Optional |
| Code | Description |
| ? | (Undefined) |
| 6 | 8(a) & Borrower |
| 7 | 8(a) & Surety Bond |
| 3 | 8(a) Client |
| 2 | Applicant |
| 1 | Borrower |
| 4 | COC |
| 8 | None |
| PA | Procurement Assistance |
| 5 | Surety Bond |
| TA | Technical Assistance |
| grossSales | Currency | Gross Revenue | Optional |
| grossSalesDate | Date | Gross Revenue Date | Optional |
| grossSalesExport | Currency | Gross Exported-Related Revenue | Optional |
| grossProfits | Currency | Profits/Losses | Optional |
| grossProfitsDate | Date | Profits/Losses Date | Optional |
| bondingAmount | Currency | Current Bonding Amount | Optional |
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
| counselId | Counselor | Primary Counselor | Optional |
| defaultfundarea | Selection | Default Funding SourceThis field uses the following coded values:CodeDescription?(Undefined)}AHEAD FoodEAlameda County4ARPA&ARPA RT@CAMEOCCDBG/City of Alameda+City of Antioch.City of Brentwood<City of ConcordQCity of PittsburgCTPCity of Sacramento cTAP[City of San Leandro^FAST CALPLead PRIMELLocal*Noyo PilotOOther0ProBiz Wells]Program IncomeSJCSan Joaquin CountySSBA+SSSBCI3State (CIP)ITAPP2TAP PRIME!USDA2WBC EPZWDBP1West PRIME | Code | Description | ? | (Undefined) | } | AHEAD Food | E | Alameda County | 4 | ARPA | & | ARPA RT | @ | CAMEO | C | CDBG | / | City of Alameda | + | City of Antioch | . | City of Brentwood | < | City of Concord | Q | City of Pittsburg | CTP | City of Sacramento cTAP | [ | City of San Leandro | ^ | FAST CA | LP | Lead PRIME | L | Local | * | Noyo Pilot | O | Other | 0 | ProBiz Wells | ] | Program Income | SJC | San Joaquin County | S | SBA | +S | SSBCI | 3 | State (CIP) | I | TAP | P2 | TAP PRIME | ! | USDA | 2 | WBC EP | Z | WDB | P1 | West PRIME | Optional |
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
| defaultfemaEnergy | Selection | Default Sub-funding SourceThis field uses the following coded values:CodeDescription-(Undefined)23PA2303Portable Assistance (PA2303) | Code | Description | - | (Undefined) | 23PA2303 | Portable Assistance (PA2303) | Optional |
| Code | Description |
| - | (Undefined) |
| 23PA2303 | Portable Assistance (PA2303) |
| reffrom | Selection | Referral FromThis field uses the following coded values:CodeDescription?(Undefined)A2AAPIC North Bay (Asian American Pacific Islander Coalition of the North Bay)AIAccelerator/IncubatorVAdvertising/MarketingA1Alameda Chamber of CommerceBDBADASS LabsBABank of AmericaB1Black Chamber of Commerce of Solano CountyBVBonneville LabsBUBusiness OwnerC5CA Black ChamberCPCentro Community PartnersHChamber of CommerceCGChampion GrantC2City of AntiochCBCity of BrentwoodCHCity of ChicoCOCity of ConcordC9City of DublinC8City of San LeandroC3Cloverdale Chamber of CommerceC6CoBiz RichmondC4CRESER CapitalDRDept of RehabilitationTFDirect Contact from TFG2EDDUEducational InstitutionEVEventFCFormer ClientFBFremont BankFUFundicaGBGoBizH9Hayward Chamber of CommerceH1Hispanic Chamber of CommerceH2Hispanic Chamber of Commerce of Napa CountyH3Hispanic Chamber of Commerce of Solano CountyIEInternet: EmailXXInternet: Newsletter/Constant ContactSMInternet: Social MediaIWInternet: WebsiteINInvestorL1La Luz CenterL2Legal AidBLenderELocal Economic Development Center OfficialLGLocal Government AgencyL3Los Cien Sonoma CountyM1Monte Rio Chamber of CommerceN2National Black Entrepreneurs Project NCNevada County Economic Development N1North Bay Black Chamber of CommerceO1Oakland African American ChamberOEOffice of Economic and Workforce Development (OEWD)OSOffice of Small Business (OSB)OOther+S5Other ClientZZPartners: APEX/PTAC, SCORE, WBC, VBOCPHPhone call for infoPLPlacer Business Resource CenterYYPrint Media: Newspaper, Magazine, Flyer, etc.R1Red Latin-X The HubR2Rohnert Park Chamber of CommerceR3Russian River Chamber of CommerceS5Sacramento Black ChamberS9San Joaquin African American ChamberSJSan Joaquin WorkNetSLSan Leandro Chamber of CommerceS3Santa Rosa Metro ChamberSCSCORES8SF African American ChamberS7Silicon Valley Black ChamberNSmall Business Administration District Office (SBA)DSmall Business Development Center (SBDC)S2Small Business Hardship Fund (SBHF)S6Solano Black ChamberS1Sonoma EDBS4Sonoma Small Business Development CenterSWStartup World Cup 2025SGState Government AgencyMTelevision/RadioPATown of ParadiseTATrade AssociationsTTraining SeminarWIWalk-in for infoWFWells FargoW1Windsor Chamber of Commerce and Visitors CenterCWord of MouthWKWorking Solutions | Code | Description | ? | (Undefined) | A2 | AAPIC North Bay (Asian American Pacific Islander Coalition of the North Bay) | AI | Accelerator/Incubator | V | Advertising/Marketing | A1 | Alameda Chamber of Commerce | BD | BADASS Labs | BA | Bank of America | B1 | Black Chamber of Commerce of Solano County | BV | Bonneville Labs | BU | Business Owner | C5 | CA Black Chamber | CP | Centro Community Partners | H | Chamber of Commerce | CG | Champion Grant | C2 | City of Antioch | CB | City of Brentwood | CH | City of Chico | CO | City of Concord | C9 | City of Dublin | C8 | City of San Leandro | C3 | Cloverdale Chamber of Commerce | C6 | CoBiz Richmond | C4 | CRESER Capital | DR | Dept of Rehabilitation | TF | Direct Contact from TFG | 2 | EDD | U | Educational Institution | EV | Event | FC | Former Client | FB | Fremont Bank | FU | Fundica | GB | GoBiz | H9 | Hayward Chamber of Commerce | H1 | Hispanic Chamber of Commerce | H2 | Hispanic Chamber of Commerce of Napa County | H3 | Hispanic Chamber of Commerce of Solano County | IE | Internet: Email | XX | Internet: Newsletter/Constant Contact | SM | Internet: Social Media | IW | Internet: Website | IN | Investor | L1 | La Luz Center | L2 | Legal Aid | B | Lender | E | Local Economic Development Center Official | LG | Local Government Agency | L3 | Los Cien Sonoma County | M1 | Monte Rio Chamber of Commerce | N2 | National Black Entrepreneurs Project | NC | Nevada County Economic Development | N1 | North Bay Black Chamber of Commerce | O1 | Oakland African American Chamber | OE | Office of Economic and Workforce Development (OEWD) | OS | Office of Small Business (OSB) | O | Other | +S5 | Other Client | ZZ | Partners: APEX/PTAC, SCORE, WBC, VBOC | PH | Phone call for info | PL | Placer Business Resource Center | YY | Print Media: Newspaper, Magazine, Flyer, etc. | R1 | Red Latin-X The Hub | R2 | Rohnert Park Chamber of Commerce | R3 | Russian River Chamber of Commerce | S5 | Sacramento Black Chamber | S9 | San Joaquin African American Chamber | SJ | San Joaquin WorkNet | SL | San Leandro Chamber of Commerce | S3 | Santa Rosa Metro Chamber | SC | SCORE | S8 | SF African American Chamber | S7 | Silicon Valley Black Chamber | N | Small Business Administration District Office (SBA) | D | Small Business Development Center (SBDC) | S2 | Small Business Hardship Fund (SBHF) | S6 | Solano Black Chamber | S1 | Sonoma EDB | S4 | Sonoma Small Business Development Center | SW | Startup World Cup 2025 | SG | State Government Agency | M | Television/Radio | PA | Town of Paradise | TA | Trade Associations | T | Training Seminar | WI | Walk-in for info | WF | Wells Fargo | W1 | Windsor Chamber of Commerce and Visitors Center | C | Word of Mouth | WK | Working Solutions | Optional |
| Code | Description |
| ? | (Undefined) |
| A2 | AAPIC North Bay (Asian American Pacific Islander Coalition of the North Bay) |
| AI | Accelerator/Incubator |
| V | Advertising/Marketing |
| A1 | Alameda Chamber of Commerce |
| BD | BADASS Labs |
| BA | Bank of America |
| B1 | Black Chamber of Commerce of Solano County |
| BV | Bonneville Labs |
| BU | Business Owner |
| C5 | CA Black Chamber |
| CP | Centro Community Partners |
| H | Chamber of Commerce |
| CG | Champion Grant |
| C2 | City of Antioch |
| CB | City of Brentwood |
| CH | City of Chico |
| CO | City of Concord |
| C9 | City of Dublin |
| C8 | City of San Leandro |
| C3 | Cloverdale Chamber of Commerce |
| C6 | CoBiz Richmond |
| C4 | CRESER Capital |
| DR | Dept of Rehabilitation |
| TF | Direct Contact from TFG |
| 2 | EDD |
| U | Educational Institution |
| EV | Event |
| FC | Former Client |
| FB | Fremont Bank |
| FU | Fundica |
| GB | GoBiz |
| H9 | Hayward Chamber of Commerce |
| H1 | Hispanic Chamber of Commerce |
| H2 | Hispanic Chamber of Commerce of Napa County |
| H3 | Hispanic Chamber of Commerce of Solano County |
| IE | Internet: Email |
| XX | Internet: Newsletter/Constant Contact |
| SM | Internet: Social Media |
| IW | Internet: Website |
| IN | Investor |
| L1 | La Luz Center |
| L2 | Legal Aid |
| B | Lender |
| E | Local Economic Development Center Official |
| LG | Local Government Agency |
| L3 | Los Cien Sonoma County |
| M1 | Monte Rio Chamber of Commerce |
| N2 | National Black Entrepreneurs Project |
| NC | Nevada County Economic Development |
| N1 | North Bay Black Chamber of Commerce |
| O1 | Oakland African American Chamber |
| OE | Office of Economic and Workforce Development (OEWD) |
| OS | Office of Small Business (OSB) |
| O | Other |
| +S5 | Other Client |
| ZZ | Partners: APEX/PTAC, SCORE, WBC, VBOC |
| PH | Phone call for info |
| PL | Placer Business Resource Center |
| YY | Print Media: Newspaper, Magazine, Flyer, etc. |
| R1 | Red Latin-X The Hub |
| R2 | Rohnert Park Chamber of Commerce |
| R3 | Russian River Chamber of Commerce |
| S5 | Sacramento Black Chamber |
| S9 | San Joaquin African American Chamber |
| SJ | San Joaquin WorkNet |
| SL | San Leandro Chamber of Commerce |
| S3 | Santa Rosa Metro Chamber |
| SC | SCORE |
| S8 | SF African American Chamber |
| S7 | Silicon Valley Black Chamber |
| N | Small Business Administration District Office (SBA) |
| D | Small Business Development Center (SBDC) |
| S2 | Small Business Hardship Fund (SBHF) |
| S6 | Solano Black Chamber |
| S1 | Sonoma EDB |
| S4 | Sonoma Small Business Development Center |
| SW | Startup World Cup 2025 |
| SG | State Government Agency |
| M | Television/Radio |
| PA | Town of Paradise |
| TA | Trade Associations |
| T | Training Seminar |
| WI | Walk-in for info |
| WF | Wells Fargo |
| W1 | Windsor Chamber of Commerce and Visitors Center |
| C | Word of Mouth |
| WK | Working Solutions |
| reffromDesc | Edit | Referral From Description | Mandatory |
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
| pscs | ProductCodeSelection | PSCs | Optional |
| primaryPsc | ProductCodeSelection | Primary PSC | Optional |
| sics | ProductCodeSelection | SICs | Optional |
| primarySic | ProductCodeSelection | Primary SIC | Optional |
| naics | ProductCodeSelection | NAICs | Optional |
| primaryNaics | ProductCodeSelection | Primary NAICS | Optional |
| isics | ProductCodeSelection | ISICs | Optional |
| primaryIsic | ProductCodeSelection | Primary ISIC | Optional |
| hs | ProductCodeSelection | HS Code(s) | Optional |
| primaryHs | ProductCodeSelection | Primary Harmonized Code | Optional |
| product | TextArea | Product or Service Description | Mandatory |
| notes | TextArea | Client Notes | Optional |
| caseend | Selection | Case End TypeThis field uses the following coded values:CodeDescription?(Undefined)NQBusiness does not qualify for servicesHClient did not show for session(s)NSClient no longer interested in servicesNPClient no longer pursuing businessUClient unresponsiveOIn OperationNOut of BusinessEStill Exploring/Planning | Code | Description | ? | (Undefined) | NQ | Business does not qualify for services | H | Client did not show for session(s) | NS | Client no longer interested in services | NP | Client no longer pursuing business | U | Client unresponsive | O | In Operation | N | Out of Business | E | Still Exploring/Planning | Optional |
| Code | Description |
| ? | (Undefined) |
| NQ | Business does not qualify for services |
| H | Client did not show for session(s) |
| NS | Client no longer interested in services |
| NP | Client no longer pursuing business |
| U | Client unresponsive |
| O | In Operation |
| N | Out of Business |
| E | Still Exploring/Planning |
| agreement | TextArea | Agreement on file? | Optional |
| allowSbaContact | Boolean | Permit SBA surveys?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| signature | ReadOnly | Signature | Optional |
| ecenterEntry | DateTime | Signature Date | Optional |
| agreements | AgreementsList |  | Optional |