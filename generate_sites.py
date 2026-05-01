"""Generate 170-site global sensor network registry for SentinelForge."""
import json, random, math

sites = []
# === US Space Surveillance Network (SSN) — 29 sites ===
ssn = [
    ("EGLIN","Eglin AFB, FL",30.57,-86.22,"radar","AN/FPS-85"),
    ("CLEAR","Clear SFS, AK",64.29,-149.19,"radar","UEWR"),
    ("THULE","Thule AB, Greenland",76.53,-68.70,"radar","UEWR"),
    ("FYLING","RAF Fylingdales, UK",54.36,-0.67,"radar","UEWR"),
    ("COBRADANE","Eareckson AS, AK",52.74,174.09,"radar","AN/FPS-108"),
    ("FENCE","Kwajalein Atoll, RMI",9.40,167.47,"radar","Space Fence"),
    ("GEODSS-NM","Socorro, NM",33.82,-106.66,"optical","GEODSS"),
    ("GEODSS-HI","Maui, HI",20.71,-156.26,"optical","GEODSS"),
    ("GEODSS-DG","Diego Garcia, BIOT",-7.31,72.42,"optical","GEODSS"),
    ("MSSS","Maui Space Surv Complex",20.71,-156.26,"optical","AMOS 3.6m"),
    ("HAYSTACK","Westford, MA",42.62,-71.49,"radar","HUSIR"),
    ("MILLSTONE","Westford, MA",42.61,-71.49,"radar","Millstone L-band"),
    ("ALTAIR","Kwajalein Atoll, RMI",9.39,167.48,"radar","ARPA LR Track"),
    ("ALCOR","Kwajalein Atoll, RMI",9.40,167.48,"radar","ALCOR C-band"),
    ("ASCENSION","Ascension Island",-7.97,-14.40,"radar","AN/FPS-16"),
    ("KAENA","Kaena Pt, HI",21.57,-158.27,"radar","AN/FPS-132"),
    ("VANDENBERG","Vandenberg SFB, CA",34.73,-120.57,"radar","AN/FPS-133"),
    ("CAVALIER","Cavalier SFS, ND",48.72,-97.90,"radar","PARCS"),
    ("CAPE","Cape Cod SFS, MA",41.75,-70.54,"radar","PAVE PAWS"),
    ("BEALE","Beale AFB, CA",39.14,-121.35,"radar","PAVE PAWS"),
    ("DARC-US","Western Australia",-31.80,115.89,"radar","DARC"),
    ("DARC-UK","Yorkshire, UK",54.20,-1.20,"radar","DARC"),
    ("DARC-AU","Exmouth, Australia",-21.82,114.16,"radar","DARC"),
    ("GLOBUS-NM","Kirtland AFB, NM",35.05,-106.55,"optical","Starfire OD"),
    ("RAVEN-CO","Peterson SFB, CO",38.82,-104.70,"optical","Raven-class"),
    ("PURDY","White Sands, NM",32.38,-106.48,"optical","Purdy 1.0m"),
    ("MCAT","Cerro Pachon, Chile",-30.24,-70.74,"optical","MCAT 1.3m"),
    ("SST","Atom Peak, NM",33.87,-106.99,"optical","SST 3.5m"),
    ("JWST-GND","Goddard SFC, MD",38.99,-76.85,"optical","Ground Cal"),
]
for s in ssn:
    sites.append({"id":f"SSN-{s[0]}","name":s[1],"lat":s[2],"lon":s[3],"type":s[4],"sensor":s[5],"network":"USSF-SSN","status":"active"})

# === Allied Nation Sensors — 18 sites ===
allied = [
    ("GRAVES","Dijon, France",47.35,5.52,"radar","GRAVES Bistatic","FR-DGA"),
    ("TIRA","Wachtberg, Germany",50.62,7.13,"radar","TIRA L/Ku","DE-FHR"),
    ("EISCAT","Tromsø, Norway",69.58,19.23,"radar","EISCAT UHF","NO-EISCAT"),
    ("CHILBOLTON","Hampshire, UK",51.14,-1.44,"radar","25m Dish","UK-RAL"),
    ("SATMON","Toulouse, France",43.56,1.48,"optical","SATMON","FR-CNES"),
    ("TAROT-S","La Silla, Chile",-29.26,-70.73,"optical","TAROT 25cm","FR-CNRS"),
    ("TAROT-N","Calern, France",43.75,6.92,"optical","TAROT 25cm","FR-CNRS"),
    ("ZIMMER","Zimmerwald, Switzerland",46.88,7.47,"optical","AIUB 1m","CH-AIUB"),
    ("TENERIFE","Tenerife, Spain",28.30,-16.51,"optical","OGS 1m","ESA"),
    ("ESA-CEBREROS","Cebreros, Spain",40.45,-4.37,"radar","35m DSA","ESA"),
    ("WEILHEIM","Weilheim, Germany",47.88,11.08,"optical","DLR 0.5m","DE-DLR"),
    ("C2PU","Calern, France",43.75,6.92,"optical","C2PU 1.04m","FR-OCA"),
    ("ISON-KISO","Kiso, Japan",35.79,137.63,"optical","ISON 1.05m","RU-ISON"),
    ("BKGND","Effelsberg, Germany",50.52,6.88,"radar","100m Dish","DE-MPIfR"),
    ("SAPIENZA","Rome, Italy",41.90,12.49,"optical","GAUSS 0.3m","IT-Sapienza"),
    ("DODAIRA","Dodaira, Japan",36.00,139.19,"optical","JAXA 0.5m","JP-JAXA"),
    ("RRFID","Learmonth, Australia",-22.25,114.08,"radar","C-band","AU-RAAF"),
    ("OPTUS","Belrose, Australia",-33.71,151.20,"optical","0.4m","AU-DST"),
]
for s in allied:
    sites.append({"id":f"ALLIED-{s[0]}","name":s[1],"lat":s[2],"lon":s[3],"type":s[4],"sensor":s[5],"network":s[6],"status":"active"})

# === LeoLabs Radar Network — 11 sites ===
leolabs = [
    ("PFISR","Poker Flat, AK",65.13,-147.47),
    ("MBAR","Midland, TX",31.95,-102.18),
    ("LRDR","Clear SFS, AK",64.29,-149.20),
    ("WARK","Warkworth, NZ",-36.43,174.66),
    ("LIMN","Limón, Costa Rica",10.00,-83.03),
    ("AZOR","São Miguel, Azores",37.75,-25.67),
    ("WEST","Western Australia",-31.95,115.86),
    ("MEND","Mendoza, Argentina",-32.88,-68.84),
    ("KERG","Kerguelen Islands",-49.35,70.22),
    ("DARW","Darwin, Australia",-12.46,130.84),
    ("NOBE","Nobeyama, Japan",35.94,138.47),
]
for s in leolabs:
    sites.append({"id":f"LL-{s[0]}","name":s[1],"lat":s[2],"lon":s[3],"type":"radar","sensor":"Phased Array S-band","network":"LeoLabs","status":"active"})

# === Slingshot/Numerica Optical — 20 sites ===
numerica_locs = [
    ("NUM-CO1","Fort Collins, CO",40.59,-105.08),("NUM-CO2","Colorado Springs, CO",38.83,-104.82),
    ("NUM-NM","Socorro, NM",34.07,-106.91),("NUM-AZ","Tucson, AZ",32.23,-110.95),
    ("NUM-TX","Fort Davis, TX",30.67,-103.95),("NUM-HI","Haleakala, HI",20.71,-156.26),
    ("NUM-AU1","Siding Spring, AU",-31.27,149.07),("NUM-AU2","Learmonth, AU",-22.24,114.09),
    ("NUM-CL","Cerro Tololo, Chile",-30.17,-70.81),("NUM-NA","Gamsberg, Namibia",-23.34,16.23),
    ("NUM-SA","Sutherland, RSA",-32.38,20.81),("NUM-SP","Tenerife, Spain",28.30,-16.51),
    ("NUM-IT","Asiago, Italy",45.87,11.53),("NUM-JP","Okayama, Japan",34.57,133.59),
    ("NUM-IN","Mt Abu, India",24.65,72.78),("NUM-AR","El Leoncito, Argentina",-31.80,-69.30),
    ("NUM-KR","Bohyunsan, S. Korea",36.16,128.98),("NUM-TW","Lulin, Taiwan",23.47,120.87),
    ("NUM-MX","San Pedro Martir, Mexico",31.03,-115.46),("NUM-PH","Clark, Philippines",15.19,120.59),
]
for s in numerica_locs:
    sites.append({"id":f"SLING-{s[0]}","name":s[1],"lat":s[2],"lon":s[3],"type":"optical","sensor":"Numerica 0.5m","network":"Slingshot","status":"active"})

# === ExoAnalytic Telescope Network — 60 sites (350+ scopes across 60 locations) ===
exo_regions = [
    # Americas
    (32.9,-117.1,"San Diego, CA"),(34.0,-118.2,"Los Angeles, CA"),(35.3,-116.9,"Barstow, CA"),
    (33.4,-111.9,"Scottsdale, AZ"),(32.4,-110.9,"Tucson, AZ"),(34.8,-106.7,"Albuquerque, NM"),
    (38.8,-104.8,"Colorado Springs, CO"),(40.4,-105.1,"Fort Collins, CO"),(30.3,-97.7,"Austin, TX"),
    (28.6,-80.6,"Cape Canaveral, FL"),(34.2,-84.3,"Georgia, US"),(39.0,-77.5,"Virginia, US"),
    (-30.2,-70.7,"Cerro Pachón, Chile"),(-33.4,-70.6,"Santiago, Chile"),(-22.9,-68.2,"Atacama, Chile"),
    (-31.9,-69.3,"El Leoncito, Argentina"),(-14.1,-75.7,"Ica, Peru"),(19.8,-99.2,"Mexico City, MX"),
    # Europe
    (28.3,-16.5,"Tenerife, Spain"),(37.1,-3.8,"Granada, Spain"),(40.4,-3.7,"Madrid, Spain"),
    (43.6,3.9,"Montpellier, France"),(48.1,11.6,"Munich, Germany"),(47.4,8.5,"Zurich, CH"),
    (41.9,12.5,"Rome, Italy"),(45.4,12.3,"Venice, Italy"),(38.0,23.7,"Athens, Greece"),
    (37.8,30.3,"Antalya, Turkey"),(52.5,13.4,"Berlin, Germany"),(51.5,-0.1,"London, UK"),
    # Africa & Middle East
    (-33.9,18.4,"Cape Town, RSA"),(-25.7,28.2,"Pretoria, RSA"),(-23.3,16.2,"Gamsberg, Namibia"),
    (-1.3,36.8,"Nairobi, Kenya"),(30.0,31.2,"Cairo, Egypt"),(25.3,55.3,"Dubai, UAE"),
    (21.4,39.8,"Jeddah, Saudi Arabia"),(24.5,54.4,"Abu Dhabi, UAE"),
    # Asia-Pacific
    (26.9,75.8,"Jaipur, India"),(13.0,77.6,"Bangalore, India"),(34.7,135.5,"Osaka, Japan"),
    (35.7,139.7,"Tokyo, Japan"),(37.6,127.0,"Seoul, S. Korea"),(25.0,121.5,"Taipei, Taiwan"),
    (22.3,114.2,"Hong Kong"),(1.3,103.9,"Singapore"),(-6.2,106.8,"Jakarta, Indonesia"),
    (-37.8,145.0,"Melbourne, AU"),(-33.9,151.2,"Sydney, AU"),(-27.5,153.0,"Brisbane, AU"),
    (-31.9,115.9,"Perth, AU"),(-36.8,174.8,"Auckland, NZ"),(-41.3,174.8,"Wellington, NZ"),
    # Pacific
    (21.3,-157.8,"Honolulu, HI"),(13.4,144.8,"Guam"),(-17.8,-149.5,"Tahiti, FP"),
    (7.1,171.4,"Majuro, RMI"),(-14.3,-170.7,"American Samoa"),
    # Other
    (64.1,-21.9,"Reykjavik, Iceland"),(60.2,24.9,"Helsinki, Finland"),
    (59.3,18.1,"Stockholm, Sweden"),(55.7,12.6,"Copenhagen, Denmark"),
]
for i,s in enumerate(exo_regions):
    sid = f"EXO-{i+1:03d}"
    sites.append({"id":sid,"name":s[2],"lat":s[0],"lon":s[1],"type":"optical","sensor":f"EGTN Scope {i+1}","network":"ExoAnalytic","status":"active"})

# === ESA SST & Contributing — 12 sites ===
esa = [
    ("ESA-OGS","Teide, Tenerife",28.30,-16.51,"optical","OGS 1.0m"),
    ("ESA-TEST","Cebreros, Spain",40.45,-4.37,"optical","Test-Bed 0.56m"),
    ("ESA-FLY","Troodos, Cyprus",34.94,32.88,"optical","Fly-Eye 1m"),
    ("ESA-NEOCC","Frascati, Italy",41.81,12.67,"optical","NEOCC Coord"),
    ("ESA-MON","Monsalupe, Spain",40.54,-4.01,"radar","Monostatic"),
    ("ESA-SWE","Kiruna, Sweden",67.86,20.22,"radar","EISCAT 32m"),
    ("ESA-SDSS","Carnarvon, AU",-24.87,113.72,"optical","0.3m"),
    ("ESA-LA","La Sagra, Spain",37.98,-2.57,"optical","0.45m Survey"),
    ("ESA-PAN","Matera, Italy",40.65,16.70,"optical","MLRO 1.5m"),
    ("ESA-ARM","Armazones, Chile",-24.59,-70.19,"optical","0.5m Survey"),
    ("ESA-FAIR","Fairbanks, AK",64.86,-147.85,"optical","0.4m"),
    ("ESA-RUN","La Réunion",-21.11,55.53,"optical","0.4m"),
]
for s in esa:
    sites.append({"id":s[0],"name":s[1],"lat":s[2],"lon":s[3],"type":s[4],"sensor":s[5],"network":"ESA-SST","status":"active"})

# === Academic/Contributing — 20 sites ===
academic = [
    ("ISON-TAR","Tarija, Bolivia",-21.44,-64.72,"optical","0.6m"),
    ("ISON-KIS","Kislovodsk, Russia",43.73,42.66,"optical","VT-78 0.5m"),
    ("ISON-USU","Ussuriysk, Russia",43.70,132.17,"optical","0.65m"),
    ("ISON-ABT","Abastumani, Georgia",41.75,42.82,"optical","0.7m"),
    ("ISON-MAI","Maidanak, Uzbekistan",38.67,66.90,"optical","1.5m"),
    ("ISON-ZEL","Zelenchuk, Russia",43.65,41.44,"optical","1.0m Zeiss"),
    ("KIAM-MOL","Molodezhnaya, Antarctica",-67.67,45.85,"optical","0.4m"),
    ("CBA-ARG","Córdoba, Argentina",-31.42,-64.19,"optical","Bosque Alegre 1.54m"),
    ("OUKA","Oukaïmeden, Morocco",31.21,-7.87,"optical","MOSS 0.5m"),
    ("CASLEO","San Juan, Argentina",-31.80,-69.33,"optical","Cesco 0.6m"),
    ("CTIO","Cerro Tololo, Chile",-30.17,-70.81,"optical","PROMPT 0.4m"),
    ("SAAO","Sutherland, RSA",-32.38,20.81,"optical","Lesedi 1.0m"),
    ("AAO","Siding Spring, AU",-31.27,149.07,"optical","AAT 3.9m"),
    ("OHP","Haute-Provence, France",43.93,5.71,"optical","1.93m"),
    ("CAHA","Almería, Spain",37.22,-2.55,"optical","CAHA 2.2m"),
    ("NOT","La Palma, Canaries",28.76,-17.88,"optical","NOT 2.56m"),
    ("UKIRT","Mauna Kea, HI",19.82,-155.47,"optical","UKIRT 3.8m"),
    ("SOAR","Cerro Pachón, Chile",-30.24,-70.74,"optical","SOAR 4.1m"),
    ("MAGEL","Las Campanas, Chile",-29.01,-70.69,"optical","Magellan 6.5m"),
    ("SUBARU","Mauna Kea, HI",19.83,-155.47,"optical","Subaru 8.2m"),
]
for s in academic:
    sites.append({"id":f"ACAD-{s[0]}","name":s[1],"lat":s[2],"lon":s[3],"type":s[4],"sensor":s[5],"network":"Contributing","status":"active"})

# Randomly set ~8% degraded, ~3% offline
random.seed(42)
for s in sites:
    r = random.random()
    if r < 0.03: s["status"] = "offline"
    elif r < 0.11: s["status"] = "degraded"
    # Add simulated metrics
    s["gpu"] = random.randint(30, 85) if s["type"] == "optical" else 0
    s["detections_24h"] = random.randint(20, 400) if s["type"] == "optical" else random.randint(500, 8000)
    s["queue"] = random.randint(0, 12)
    s["seeing"] = round(random.uniform(0.5, 2.5), 1) if s["type"] == "optical" else 0

print(f"Total sites: {len(sites)}")
nets = {}
for s in sites:
    nets[s["network"]] = nets.get(s["network"], 0) + 1
for k,v in sorted(nets.items(), key=lambda x:-x[1]):
    print(f"  {k}: {v}")
print(f"  Radar: {sum(1 for s in sites if s['type']=='radar')}")
print(f"  Optical: {sum(1 for s in sites if s['type']=='optical')}")

with open("frontend/site_registry.json", "w") as f:
    json.dump(sites, f, indent=2)
print(f"\nWritten to frontend/site_registry.json")
