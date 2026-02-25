# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

Query forms:

GET https://norcal.neoserra.com/api/v1/relationships/{*Client Reference*}

 
GET https://norcal.neoserra.com/api/v1/relationships/{*Contact Reference*}?reverse=1

Record access forms:
 
GET  https://norcal.neoserra.com/api/v1/relationships/{*Client Reference*}/{*Contact Reference*}

 
POST https://norcal.neoserra.com/api/v1/relationships/{*Client Reference*}/{*Contact Reference*}

# Methods Supported

HTTP Methods: GET, POST (note: see usage above)
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| position | Selection | Contact PositionThis field uses the following coded values:CodeDescription-(Undefined)CEOCEOCOOCOOCTOCTOEMPEmployeeFOUFounderGMGeneral ManagerHBDHead of Business DevelopmentOWNOwnerPTRPartnerPRPresidentSPSole ProprietorCFOTreasurer or CFOVPRVice President | Code | Description | - | (Undefined) | CEO | CEO | COO | COO | CTO | CTO | EMP | Employee | FOU | Founder | GM | General Manager | HBD | Head of Business Development | OWN | Owner | PTR | Partner | PR | President | SP | Sole Proprietor | CFO | Treasurer or CFO | VPR | Vice President | Optional |
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
| owner | Boolean | Business Owner?This is a Boolean value.  The following two string constants are accepted:true - Represents Boolean truefalse - Represents Boolean false | Optional |