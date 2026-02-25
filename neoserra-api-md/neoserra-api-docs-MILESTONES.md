# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

https://norcal.neoserra.com/api/v1/milestones/{*Milestone Reference*}

# Methods Supported

HTTP Methods: GET, POST
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| clientId | Client | ClientThis field uses the following coded values:CodeDescription | Code | Description | Optional |
| Code | Description |
| counselors | CounselorList | Counselors | Optional |
| date | Date | Milestone Date | Optional |
| type | Selection | Milestone TypeThis field uses the following coded values:CodeDescriptionSTBusiness Established+BSIBusiness Start ImpactNSChange in Full-Time StaffNSPTChange in Part-Time StaffISChange in SalesJRJobs Retained?Undefined | Code | Description | ST | Business Established | +BSI | Business Start Impact | NS | Change in Full-Time Staff | NSPT | Change in Part-Time Staff | IS | Change in Sales | JR | Jobs Retained | ? | Undefined | Optional |
| Code | Description |
| ST | Business Established |
| +BSI | Business Start Impact |
| NS | Change in Full-Time Staff |
| NSPT | Change in Part-Time Staff |
| IS | Change in Sales |
| JR | Jobs Retained |
| ? | Undefined |
| amount | Decimal | Milestone Amount | Optional |
| initialDate | Date | Initial Date | Optional |
| initialAmount | Decimal | Initial Amount | Optional |
| remark | Edit | Counterpart | Optional |
| covid19 | Boolean | COVID-19 related?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| text | Edit | Subject | Optional |
| centerId | Center | Center | Optional |
| fundarea | Selection | Funding SourceThis field uses the following coded values:CodeDescription?(Undefined)}AHEAD FoodEAlameda County4ARPA&ARPA RT@CAMEOCCDBG/City of Alameda+City of Antioch.City of Brentwood<City of ConcordQCity of PittsburgCTPCity of Sacramento cTAP[City of San Leandro^FAST CALPLead PRIMELLocal*Noyo PilotOOther0ProBiz Wells]Program IncomeSJCSan Joaquin CountySSBA+SSSBCI3State (CIP)ITAPP2TAP PRIME!USDA2WBC EPZWDBP1West PRIME | Code | Description | ? | (Undefined) | } | AHEAD Food | E | Alameda County | 4 | ARPA | & | ARPA RT | @ | CAMEO | C | CDBG | / | City of Alameda | + | City of Antioch | . | City of Brentwood | < | City of Concord | Q | City of Pittsburg | CTP | City of Sacramento cTAP | [ | City of San Leandro | ^ | FAST CA | LP | Lead PRIME | L | Local | * | Noyo Pilot | O | Other | 0 | ProBiz Wells | ] | Program Income | SJC | San Joaquin County | S | SBA | +S | SSBCI | 3 | State (CIP) | I | TAP | P2 | TAP PRIME | ! | USDA | 2 | WBC EP | Z | WDB | P1 | West PRIME | Optional |
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
| memo | TextArea | Notes | Optional |
| surveyId | Survey | Survey ResponseThis field uses the following coded values:CodeDescription__NULL__(No selection)3038Mini Survey: Business Starts3040Mini Survey: Capital Funding Achieved!3037Mini Survey: Increase in Sales Achieved!3039Mini Survey: Jobs Created Achieved!3049New Clients - SBDC Client Satisfaction Survey3050Ongoing Clients - SBDC Client Satisfaction Survey | Code | Description | __NULL__ | (No selection) | 3038 | Mini Survey: Business Starts | 3040 | Mini Survey: Capital Funding Achieved! | 3037 | Mini Survey: Increase in Sales Achieved! | 3039 | Mini Survey: Jobs Created Achieved! | 3049 | New Clients - SBDC Client Satisfaction Survey | 3050 | Ongoing Clients - SBDC Client Satisfaction Survey | Optional |
| Code | Description |
| __NULL__ | (No selection) |
| 3038 | Mini Survey: Business Starts |
| 3040 | Mini Survey: Capital Funding Achieved! |
| 3037 | Mini Survey: Increase in Sales Achieved! |
| 3039 | Mini Survey: Jobs Created Achieved! |
| 3049 | New Clients - SBDC Client Satisfaction Survey |
| 3050 | Ongoing Clients - SBDC Client Satisfaction Survey |
| isReportable | Boolean | Reportable?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| attribStatement | TextArea | Attribution Statement | Optional |
| affirmation | Edit | Affirmation | Optional |
| attribution | Selection | Attribution SourceThis field uses the following coded values:CodeDescription-(None)ATAttribution/verification documents received | Code | Description | - | (None) | AT | Attribution/verification documents received | Optional |
| Code | Description |
| - | (None) |
| AT | Attribution/verification documents received |
| attribSignature | ReadOnly | Attribution Signature | Optional |
| attribDate | Date | Attribution Date | Optional |
| mediaRelease | Boolean | Media release given?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
|  | ReadOnly |  | Optional |
| pft | Edit | For program/funding tracking (optional) | Optional |
|  | ReadOnly |  | Optional |
| verify | Boolean | Do you have the required attribution/verification documents for this record? (Attribution/verification only required for sales, jobs, and business start/bought.)This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
|  | ReadOnly |  | Optional |
| din | Edit | Designee Initials | Optional |
|  | ReadOnly |  | Optional |
| cdr | Selection | Center Director Reviewed?This field uses the following coded values:CodeDescription-NoNoYesYes | Code | Description | - |  | No | No | Yes | Yes | Optional |
| Code | Description |
| - |  |
| No | No |
| Yes | Yes |
| cdi | Edit | Center Director Initials | Optional |
|  | ReadOnly |  | Optional |
| lcsi | Edit | Lead Center Staff Initials | Optional |