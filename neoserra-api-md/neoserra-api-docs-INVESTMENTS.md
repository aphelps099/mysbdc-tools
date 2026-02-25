# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

https://norcal.neoserra.com/api/v1/investments/{*Capital Funding Reference*}

# Methods Supported

HTTP Methods: GET, POST
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| clientId | Client | Client | Optional |
| counselors | CounselorList | Counselors | Optional |
| date | Date | Reporting Date | Optional |
| appdate | Date | Application Date | Optional |
| status | Selection | Completion StatusThis field uses the following coded values:CodeDescriptionAApprovedDDeniedIIn ProgressNNot FundedWWithdrawn | Code | Description | A | Approved | D | Denied | I | In Progress | N | Not Funded | W | Withdrawn | Optional |
| Code | Description |
| A | Approved |
| D | Denied |
| I | In Progress |
| N | Not Funded |
| W | Withdrawn |
| dateCompleted | Date | Date Completed | Optional |
| type | Selection | Funding TypeThis field uses the following coded values:CodeDescription7(retired) SBIR/STTR GrantCCommercial (Bank) Loan)Crowd Funding+Equipment Loan or Financing(Equity Investment: Seed Funding3GrantsRLine of Credit1Local LoanMMicro-LoanEOther Equity Investment>Other LoanWOwner Investment0Private Non-Institution Investment20SBA Economic Injury Disaster Loan (non-COVID)LSBA Loan21SBIR/STTR Phase 1 Grant22SBIR/STTR Phase 2 Grant<SSBCI-backed Loan?UndefinedVVenture Capital | Code | Description | 7 | (retired) SBIR/STTR Grant | C | Commercial (Bank) Loan | ) | Crowd Funding | + | Equipment Loan or Financing | ( | Equity Investment: Seed Funding | 3 | Grants | R | Line of Credit | 1 | Local Loan | M | Micro-Loan | E | Other Equity Investment | > | Other Loan | W | Owner Investment | 0 | Private Non-Institution Investment | 20 | SBA Economic Injury Disaster Loan (non-COVID) | L | SBA Loan | 21 | SBIR/STTR Phase 1 Grant | 22 | SBIR/STTR Phase 2 Grant | < | SSBCI-backed Loan | ? | Undefined | V | Venture Capital | Optional |
| Code | Description |
| 7 | (retired) SBIR/STTR Grant |
| C | Commercial (Bank) Loan |
| ) | Crowd Funding |
| + | Equipment Loan or Financing |
| ( | Equity Investment: Seed Funding |
| 3 | Grants |
| R | Line of Credit |
| 1 | Local Loan |
| M | Micro-Loan |
| E | Other Equity Investment |
| > | Other Loan |
| W | Owner Investment |
| 0 | Private Non-Institution Investment |
| 20 | SBA Economic Injury Disaster Loan (non-COVID) |
| L | SBA Loan |
| 21 | SBIR/STTR Phase 1 Grant |
| 22 | SBIR/STTR Phase 2 Grant |
| < | SSBCI-backed Loan |
| ? | Undefined |
| V | Venture Capital |
| covid19 | Boolean | COVID-19 related?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
| institution | Edit | Institution | Optional |
| appnbr | Edit | Application Number | Optional |
| amountReq | Currency | Amount Requested | Optional |
| amountApproved | Currency | Amount Approved | Optional |
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
| memo | TextArea | Activity Notes | Optional |
| surveyId | Survey | SurveyThis field uses the following coded values:CodeDescription__NULL__(No selection)3038Mini Survey: Business Starts3040Mini Survey: Capital Funding Achieved!3037Mini Survey: Increase in Sales Achieved!3039Mini Survey: Jobs Created Achieved!3049New Clients - SBDC Client Satisfaction Survey3050Ongoing Clients - SBDC Client Satisfaction Survey | Code | Description | __NULL__ | (No selection) | 3038 | Mini Survey: Business Starts | 3040 | Mini Survey: Capital Funding Achieved! | 3037 | Mini Survey: Increase in Sales Achieved! | 3039 | Mini Survey: Jobs Created Achieved! | 3049 | New Clients - SBDC Client Satisfaction Survey | 3050 | Ongoing Clients - SBDC Client Satisfaction Survey | Optional |
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
| ppp | Selection | Payment Protection Program (PPP)This field uses the following coded values:CodeDescription-Round 1Round 1Round 2Round 2 | Code | Description | - |  | Round 1 | Round 1 | Round 2 | Round 2 | Optional |
| Code | Description |
| - |  |
| Round 1 | Round 1 |
| Round 2 | Round 2 |
| pft | Edit | For program/funding tracking (optional) | Optional |
|  | ReadOnly |  | Optional |
| reqattrib | Boolean | Do you have the required attribution/verification documents for this record?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |
|  | ReadOnly |  | Optional |
| din | Edit | Designee Initials | Optional |
|  | ReadOnly |  | Optional |
| cdr | Selection | Center Director Reviewed?This field uses the following coded values:CodeDescription-YesYesNoNo | Code | Description | - |  | Yes | Yes | No | No | Optional |
| Code | Description |
| - |  |
| Yes | Yes |
| No | No |
| cdi | Edit | Center Director Initials | Optional |
|  | ReadOnly |  | Optional |
| lcsi | Edit | Lead Center Staff Initials | Optional |
|  | ReadOnly |  | Optional |
| carrie | Edit | For NEXUS Use Only | Optional |