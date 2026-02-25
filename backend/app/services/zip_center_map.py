"""
ZIP Code → SBDC Center routing for Northern California.

Maps ZIP codes to the correct NorCal SBDC center by:
  1. Exact 5-digit ZIP match (for edge cases like 950xx Santa Cruz vs San Jose)
  2. ZIP3 prefix match (first 3 digits → center)
  3. County-based fallback

Center IDs match Neoserra eCenter center IDs.
Data sourced from norcalsbdc.org/find-your-sbdc/ service areas.
"""

# ─── County → Center ID ──────────────────────────────────────

COUNTY_TO_CENTER: dict[str, int] = {
    # Shasta-Cascade SBDC (40)
    "Shasta": 40, "Siskiyou": 40, "Trinity": 40, "Modoc": 40, "Lassen": 40,

    # Butte College SBDC (39)
    "Butte": 39, "Glenn": 39, "Tehama": 39, "Plumas": 39, "Colusa": 39,

    # Sierra SBDC (43)
    "Nevada": 43, "Placer": 43, "El Dorado": 43,

    # Sacramento Valley SBDC (72)
    "Sacramento": 72, "Yolo": 72, "Sutter": 72, "Yuba": 72,

    # Solano-Napa SBDC (18)
    "Solano": 18, "Napa": 18,

    # Sonoma SBDC (73)
    "Sonoma": 73,

    # Marin SBDC (36)
    "Marin": 36,

    # Mendocino SBDC (24)
    "Mendocino": 24,

    # Lake County SBDC (105)
    "Lake": 105,

    # North Coast SBDC (13)
    "Humboldt": 13, "Del Norte": 13,

    # San Francisco SBDC (15)
    "San Francisco": 15,

    # San Mateo SBDC (69)
    "San Mateo": 69,

    # Silicon Valley SBDC (70)
    "Santa Clara": 70,

    # East Bay SBDC (71)
    "Alameda": 71, "Contra Costa": 71,

    # Santa Cruz SBDC (9)
    "Santa Cruz": 9, "Monterey": 9, "San Benito": 9,

    # San Joaquin SBDC (68)
    "San Joaquin": 68, "Stanislaus": 68, "Merced": 68,
    "Calaveras": 68, "Tuolumne": 68, "Mariposa": 68,
    "Amador": 68, "Alpine": 68,
}


# ─── ZIP3 prefix → Center ID ─────────────────────────────────
# First 3 digits of ZIP → center ID (dominant mapping)

ZIP3_TO_CENTER: dict[str, int] = {
    # Monterey / Santa Cruz area
    "939": 9,     # Salinas, Monterey

    # Bay Area
    "940": 15,    # San Francisco
    "941": 15,    # San Francisco
    "943": 69,    # San Mateo (+ some Palo Alto overlap)
    "944": 69,    # San Mateo
    "945": 71,    # Oakland / Alameda
    "946": 71,    # Oakland / Alameda
    "947": 71,    # Berkeley / Alameda
    "948": 71,    # Richmond / Contra Costa

    "949": 36,    # San Rafael / Marin

    # South Bay / Santa Cruz
    "950": 70,    # San Jose (default, 5-digit overrides for Santa Cruz)
    "951": 70,    # San Jose / Santa Clara

    # Central Valley
    "952": 68,    # Stockton / San Joaquin
    "953": 68,    # Tracy, Modesto area

    # North Bay
    "954": 73,    # Santa Rosa / Sonoma

    # North Coast
    "955": 13,    # Eureka / Humboldt (+ Mendocino/Lake overrides below)

    # Sacramento region
    "956": 72,    # Sacramento
    "957": 72,    # Sacramento
    "958": 72,    # Sacramento suburbs

    # Northern Sacramento Valley
    "959": 39,    # Chico/Oroville area (Butte default, overrides below)

    # Far North
    "960": 40,    # Redding / Shasta
    "961": 40,    # Far north CA (Siskiyou, etc.)
}


# ─── 5-digit ZIP overrides ───────────────────────────────────
# For areas where ZIP3 is ambiguous (e.g., 950xx has both
# Santa Cruz and San Jose ZIPs).

ZIP5_TO_CENTER: dict[str, int] = {}


def _add_zips(center_id: int, zips: list[str]) -> None:
    for z in zips:
        ZIP5_TO_CENTER[z] = center_id


# Santa Cruz county ZIPs within 950xx (override from Silicon Valley → Santa Cruz SBDC)
_add_zips(9, [
    "95001", "95003", "95005", "95006", "95007", "95010", "95017", "95018",
    "95019", "95041", "95060", "95061", "95062", "95063", "95064", "95065",
    "95066", "95067", "95073", "95076",
])

# San Benito county ZIPs within 950xx (→ Santa Cruz SBDC)
_add_zips(9, ["95004", "95023", "95024", "95043", "95045"])

# Monterey county ZIPs within 939xx (already mapped by ZIP3, but explicit for safety)
_add_zips(9, [
    "93901", "93902", "93905", "93906", "93907", "93908", "93915",
    "93920", "93921", "93922", "93923", "93924", "93925", "93926",
    "93927", "93928", "93930", "93933", "93940", "93950", "93953",
    "93955", "93960", "93962",
])

# Palo Alto ZIPs (943xx → Silicon Valley, not San Mateo)
_add_zips(70, ["94301", "94302", "94303", "94304", "94305", "94306"])

# Napa county ZIPs (within 945xx/949xx → Solano-Napa, not Marin/East Bay)
_add_zips(18, [
    "94503", "94558", "94559", "94573", "94574", "94576", "94581", "94599",
])

# Solano county ZIPs scattered across 945xx/956xx/958xx
_add_zips(18, [
    "94510", "94512", "94533", "94534", "94535", "94571", "94585",
    "94589", "94590", "94591", "94592",
    "95620", "95625", "95687", "95688", "95696",
])

# Mendocino county ZIPs within 954xx/955xx
_add_zips(24, [
    "95410", "95415", "95417", "95420", "95427", "95428", "95432",
    "95437", "95449", "95454", "95456", "95459", "95460", "95463",
    "95466", "95468", "95469", "95470", "95481", "95482", "95488",
    "95490", "95494",
])

# Lake county ZIPs within 954xx/955xx
_add_zips(105, [
    "95422", "95423", "95435", "95443", "95451", "95453", "95457",
    "95458", "95464", "95467", "95485", "95493",
])

# Del Norte county ZIPs within 955xx
_add_zips(13, ["95531", "95532", "95538", "95543", "95548"])

# ── 959xx area: mixed Butte/Yuba/Sutter/Nevada/Placer ──

# Yuba county (→ Sacramento Valley SBDC)
_add_zips(72, ["95901", "95903", "95918", "95922", "95935", "95961", "95962"])

# Sutter county (→ Sacramento Valley SBDC)
_add_zips(72, ["95668", "95674", "95953", "95957", "95982", "95991", "95992", "95993"])

# Nevada county (→ Sierra SBDC)
_add_zips(43, [
    "95712", "95924", "95945", "95946", "95949", "95959", "95960",
    "95975", "95977", "95986",
])

# Placer county (→ Sierra SBDC)
_add_zips(43, [
    "95602", "95603", "95604", "95631", "95648", "95650", "95658",
    "95661", "95663", "95677", "95678", "95681", "95703", "95713",
    "95714", "95715", "95717", "95722", "95736", "95746", "95747",
    "95765",
])

# El Dorado county (→ Sierra SBDC)
_add_zips(43, [
    "95613", "95614", "95619", "95623", "95633", "95634", "95635",
    "95636", "95651", "95656", "95664", "95667", "95672", "95682",
    "95684", "95709", "95720", "95721", "95726", "95735", "95762",
])

# Yolo county ZIPs (→ Sacramento Valley SBDC)
_add_zips(72, [
    "95605", "95606", "95607", "95612", "95615", "95616", "95617",
    "95618", "95627", "95637", "95645", "95653", "95691", "95695",
    "95697", "95776",
])

# Glenn county (→ Butte College SBDC)
_add_zips(39, ["95920", "95943", "95951", "95963", "95988"])

# Tehama county (→ Butte College SBDC, most are 960xx already)
_add_zips(39, ["96021", "96022", "96029", "96035", "96055", "96059", "96074", "96075", "96080"])

# Colusa county (→ Butte College SBDC)
_add_zips(39, ["95912", "95932", "95950", "95955", "95970", "95979", "95987"])

# Plumas county (→ Butte College SBDC)
_add_zips(39, [
    "95915", "95923", "95934", "95936", "95947", "95956", "95971",
    "95980", "95981", "95983", "95984", "96103", "96105", "96106",
    "96107", "96109", "96116", "96118", "96122", "96129", "96133",
])

# Siskiyou county (→ Shasta-Cascade SBDC)
_add_zips(40, [
    "96014", "96023", "96025", "96027", "96031", "96032", "96034",
    "96037", "96038", "96039", "96044", "96049", "96050", "96057",
    "96058", "96064", "96067", "96085", "96086", "96094", "96097",
    "96134",
])

# Trinity county (→ Shasta-Cascade SBDC)
_add_zips(40, [
    "96041", "96046", "96047", "96048", "96052", "96076", "96091", "96093",
])

# Modoc county (→ Shasta-Cascade SBDC)
_add_zips(40, [
    "96006", "96015", "96101", "96104", "96108", "96110", "96112", "96115",
])

# Lassen county (→ Shasta-Cascade SBDC)
_add_zips(40, [
    "96009", "96056", "96068", "96069", "96113", "96114", "96117",
    "96119", "96120", "96121", "96123", "96124", "96125", "96126",
    "96127", "96128", "96130", "96132", "96136", "96137",
])

# Stanislaus county in 953xx (→ San Joaquin SBDC)
_add_zips(68, [
    "95307", "95313", "95316", "95319", "95322", "95323", "95326",
    "95328", "95350", "95351", "95352", "95353", "95354", "95355",
    "95356", "95357", "95358", "95360", "95361", "95363", "95367",
    "95368", "95380", "95381", "95382", "95386", "95387",
])

# Calaveras county (→ San Joaquin SBDC)
_add_zips(68, [
    "95221", "95222", "95223", "95224", "95225", "95226", "95228",
    "95229", "95232", "95233", "95245", "95246", "95247", "95248",
    "95249", "95251", "95252", "95254", "95255",
])

# Tuolumne county (→ San Joaquin SBDC)
_add_zips(68, [
    "95305", "95310", "95311", "95314", "95318", "95321", "95325",
    "95327", "95329", "95346", "95347", "95364", "95370", "95372",
    "95373", "95375", "95379", "95383",
])

# Amador county (→ San Joaquin SBDC)
_add_zips(68, [
    "95640", "95642", "95654", "95665", "95666", "95675", "95685", "95689",
])


# ─── Public API ───────────────────────────────────────────────

# Center metadata for frontend display
CENTER_INFO: dict[int, dict] = {
    9:   {"name": "Santa Cruz SBDC", "counties": "Santa Cruz, Monterey, San Benito"},
    13:  {"name": "North Coast SBDC", "counties": "Humboldt, Del Norte"},
    15:  {"name": "San Francisco SBDC", "counties": "San Francisco"},
    18:  {"name": "Solano-Napa SBDC", "counties": "Solano, Napa"},
    23:  {"name": "NorCal SBDC (Regional Lead)", "counties": "Default / Out of area"},
    24:  {"name": "Mendocino SBDC", "counties": "Mendocino"},
    36:  {"name": "Marin SBDC", "counties": "Marin"},
    39:  {"name": "Butte College SBDC", "counties": "Butte, Glenn, Tehama, Plumas, Colusa"},
    40:  {"name": "Shasta-Cascade SBDC", "counties": "Shasta, Siskiyou, Trinity, Modoc, Lassen"},
    43:  {"name": "Sierra SBDC", "counties": "Nevada, Placer, El Dorado"},
    68:  {"name": "San Joaquin SBDC", "counties": "San Joaquin, Stanislaus, Merced, Calaveras, Tuolumne, Mariposa, Amador, Alpine"},
    69:  {"name": "San Mateo SBDC", "counties": "San Mateo"},
    70:  {"name": "Silicon Valley SBDC", "counties": "Santa Clara"},
    71:  {"name": "East Bay SBDC", "counties": "Alameda, Contra Costa"},
    72:  {"name": "Sacramento Valley SBDC", "counties": "Sacramento, Yolo, Sutter, Yuba"},
    73:  {"name": "Sonoma SBDC", "counties": "Sonoma"},
    105: {"name": "Lake County SBDC", "counties": "Lake"},
    107: {"name": "Aaron Phelps Test Center 123", "counties": "Testing"},
}

DEFAULT_CENTER_ID = 107  # Aaron Phelps Test Center 123


def resolve_center_from_zip(zip_code: str) -> tuple[int, str]:
    """Resolve a ZIP code to a NorCal SBDC center.

    Returns (center_id, center_name).
    Falls back to center 23 (NorCal SBDC Regional Lead) for unknown ZIPs.
    """
    if not zip_code:
        return DEFAULT_CENTER_ID, CENTER_INFO[DEFAULT_CENTER_ID]["name"]

    zip5 = zip_code.strip().replace("-", "")[:5]

    # 1. Exact 5-digit match
    if zip5 in ZIP5_TO_CENTER:
        cid = ZIP5_TO_CENTER[zip5]
        return cid, CENTER_INFO.get(cid, {}).get("name", f"Center {cid}")

    # 2. ZIP3 prefix match
    zip3 = zip5[:3]
    if zip3 in ZIP3_TO_CENTER:
        cid = ZIP3_TO_CENTER[zip3]
        return cid, CENTER_INFO.get(cid, {}).get("name", f"Center {cid}")

    # 3. Fallback
    return DEFAULT_CENTER_ID, CENTER_INFO[DEFAULT_CENTER_ID]["name"]
