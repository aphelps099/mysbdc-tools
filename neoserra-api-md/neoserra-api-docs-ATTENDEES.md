# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Resource

GET https://norcal.neoserra.com/api/v1/attendees/{*Training Event Reference*}

 
POST https://norcal.neoserra.com/api/v1/attendees/{*Training Event Reference*}/{*Contact Reference*}

# Methods Supported

HTTP Methods: GET, POST (note: see usage above)
# Properties

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| status | Selection | StatusMandatory for new records.This field uses the following coded values:CodeDescriptionAAttendedCCanceledXExhibitorGRGraduatedNNo-showYPayment DuePProspectiveRRegisteredWWaitlisted | Code | Description | A | Attended | C | Canceled | X | Exhibitor | GR | Graduated | N | No-show | Y | Payment Due | P | Prospective | R | Registered | W | Waitlisted | Optional |
| Code | Description |
| A | Attended |
| C | Canceled |
| X | Exhibitor |
| GR | Graduated |
| N | No-show |
| Y | Payment Due |
| P | Prospective |
| R | Registered |
| W | Waitlisted |
| presence | Selection | PresenceThis field uses the following coded values:CodeDescriptionLIn PersonOOnline | Code | Description | L | In Person | O | Online | Optional |
| Code | Description |
| L | In Person |
| O | Online |
| shouldPay | Integer | Fee Type Due | Optional |
| feeLevel | Integer | Fee Type Paid | Optional |
| entry | Date | Date/Time Entered | Optional |