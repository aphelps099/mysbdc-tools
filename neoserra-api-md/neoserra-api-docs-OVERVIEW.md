# Neoserra API Documentation

## Main Content

[API](/api) /  Reference

# Overview

The Neoserra RESTful API allows programmatic access to key Neoserra record types using a JSON representation.   
## Object Records

Supported record types include the Neoserra core modules along with any active user-defined
forms you have created using the Neoserra Custom Forms module:

| Record Type | Object Type |
| --- | --- |
| Clients | clients |
| Contacts | contacts |
| Training Events | events |
| Counseling Sessions | counseling |
| Capital Funding | investments |
| Milestones | milestones |

It should be noted, that Neoserra Surveys are specifically excluded and not supported here.

## Linkages

Neoserra has a number of linkages or relations between record types.  In most cases, it is a one-to-one relationship and we've embedded the relationship in the record itself.  But there are a number of cases where a one-to-many relationship needs to supported and these are supported here as "linkages"

Supported record linkages include:

| Linkage Type | Object Type |
| --- | --- |
| Clients and Contacts | relationships |
| Training Events and Attendees | attendees |
| Training Events and Presenters | trainers |

# URL Formation

## Record Objects

A URL is formed as:

https://norcal.neoserra.com/api/v1/{*Object Type*}/{*Object Reference*}

The object type is one of the options in table above.   
The object reference is one of:

- internal Neoserra ID - this is the Neoserra internal identifier for the record

- client ID - this is the visible Client ID in Neoserra (client records only)

- foreign key - this is the exernal key assigned to the record (via this API)

- "new" - the literal value **new** to indicate a new record is being created via the API

## Linkages

There are two possible URL formations.  The first one is the linkage itself:

https://norcal.neoserra.com/api/v1/{*Linkage Type*}/{*Object Reference*}/{*Object Reference*}

The linkage type is one of the options in table in the Overview.   The object reference is described above in the records. GET/POST are supported for the linkages. 
Some linkages have attribute themselves.  For example, the linkage between a client and contact includes the business role of the contact in the
client organization.
To enumerate a list of existing linkages, there is a separate URL form:

https://norcal.neoserra.com/api/v1/{*Linkage Type*}/{*Object Reference*}

Only the GET verb is supported.  That is, a batch updarte linkages is not supported

# Authentication

Authentication is done using a bearer token that is created in the API interface (under the user preferences).  This is a subset of IETF RFC 6750.

Authorization: Bearer *APIKEY*

where APIKEY is to be replaced with an actual API key.