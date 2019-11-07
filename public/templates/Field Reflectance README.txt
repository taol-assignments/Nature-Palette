This document offers guidance to complete the metadata file to submit information 
pertaining to REFLECTANCE MEASUREMENTS taken from FIELD SPECIMENS. All terms should
be kept in their current spelling to make them compatible with the database. Any 
alteration will lead to delays in the submission. Terms that start with a lower case
letter (e.g., genus) are defined in the Darwin Core; for more information see 
(https://dwc.tdwg.org/terms/). These terms are standardized and allow our database 
to crawl museum data to fill the metadata not supplied by the user. Terms that 
are flagged with an asterix (*) in this document are mandatory. Only 10 fields are 
mandatory: FileName, UniqueID, genus, specificEpithet,Patch, LightAngle1, 
LightAngle2, ProbeAngle1, ProbeAngle2, Replicate. The following explains the 
terms, and offers guidance on what is considered an appropriate entry.

NOTE: WE HAVE YET TO DECIDE HOW SPELLING SHOULD BE ENTERED. SEARCH TERMS ARE 
NOT CASE SENSITIVE

FileName*: The name of the file containing the raw spectral data. This name should 
	   not contain the extension format (i.e., do not include
	   '.Master.Transmission', '.jaz', '.ProcSpec', '.ttt'). For now, 
	   submissions are asked to include only a single file type.

UniqueID*: A unique identifier for the specimen measured. Can include band
	   or permanent marking number, species info, location, etc... 
	   E.g., TRES1015.12345, Buttercup1, VigoCarduelis1

class: The full scientific name of the class in which the taxon is classified. 
       E.g., Mammalia, Hepaticopsida.

order: The full scientific name of the order in which the taxon is classified. 
       E.g., Carnivora, Monocleales.

family: The full scientific name of the family in which the taxon is classified. 
        E.g., Felidae, Monocleaceae.

genus*: The full scientific name of the genus in which the taxon is classified. 
	E.g., Puma, Monoclea.

specificEpithet*: The name of the first or species epithet of the scientific name 
		  (the second part of a species name in binomial nomenclature.)
		  E.g., concolor, gottschei.

infraspecificEpithet: The name of the lowest or terminal infraspecific epithet of 
		      the scientific name, excluding any rank designation. For 
		      many species, this would be the subspecies-level 
		      designation.

sex: The sex of the biological individual. Use full word (not first letter) 
     e.g., Female - NOT 'F'.

lifeStage: The age class or life stage of the biological individual at the time of 
	   collection. E.g., egg, eft, juvenile, adult, second-year.

country: The name of the country or major administrative unit in which the 
	 specimen was collected. Please use the Getty Thesaurus of Geographic 
	 Namesfor proper spelling. The list of countries can be found at 
	 http://www.getty.edu/vow/TGNNationPopup

locality: The specific description of the place. E.g., 'Bariloche, 25 km NNE via
	  Ruta Nacional 40 (=Ruta 237).'

decimalLatitude: The geographic latitude (in decimal degrees, using the spatial 
		 reference system given in geodeticDatum, see below) of the 
		 geographic center of a Location. Positive values are north of the 
	         Equator, negative values are south of it. Legal values lie between
	         -90 and 90, inclusive. If possible, please use WGS84 coordinates.

decimalLongitude:The geographic longitude (in decimal degrees, using the spatial 
		 reference system given in geodeticDatum) of the geographic center
		 of a Location. Positive values are east of the Greenwich Meridian, 
		 negative values are west of it. Legal values lie between -180 and 
		 180, inclusive. If possible, please use WGS84 coordinates.

geodeticDatum: The ellipsoid, geodetic datum, or spatial reference system (SRS) 
	       upon which the geographic coordinates given in decimalLatitude and 
	       decimalLongitude as based. E.g., EPSG:4326, WGS84, NAD27. If 
	       possible, please use WGS84 coordinates.

verbatimElevation: The original description of the elevation (altitude, usually 
		   above sea level) of the location. Please use a single value 
		   without the unit (m). If the speciment indicates a range of 
		   values (e.g., between 300 and 400 m), indicate the middle point
		   i.e., 350 m.

eventDate: The date when the specimen was collected. Recommended best practice is 
	   to use a date that conforms to ISO 8601:2004(E). As such, please adhere
	   to the following format: 1809-02-12 (some time during 12 February 1809).
	   1906-06 (some time in June 1906). 1971 (some time in the year 1971).

measurementDeterminedDate: The date when the spectral measurement was taken. 
			   Recommended best practice is to use a date that conforms
		           to ISO 8601:2004(E). As such, please adhere to the 
			   following format: 1809-02-12 (some time during 12 
		           February 1809). 1906-06 (some time in June 1906). 1971 
			   (some time in the year 1971).

Patch*: The location on the animal that was measured. Some class of animals have 
        standardized morphological descriptions (e.g., the International Committee 
	on Avian Anatomical Nomenclature has published the Handbook on Avian 
	Anatomy). These terms are described in Latin, which is almost never used by
	non-vetenarians. Therefore, we highly recommend the use of the English 
	names derived from these standardized treaties. In birds, for example, most
	terms can be found in Chapter 3 of Proctor and Lynch, Manual of 
	Ornithology: Avian Structure and Function. Keep in mind that searches based
	on the term 'Patch' are possible. 	

LightAngle1*: The angle of the light source in relation to normal (0) in the MEDIAN
	      PLANE with positive values (up to 90) towards the head, and negative 
	      values (down to -90) towards the rear of the animal. If measured on a
	      plant or circular animal, values should be explained in the comment 
	      section.  Measurements taken with a bifurcated probe should indicate
	      '0'.

LightAngle2*: The angle of the light source in relation to normal (0) in the 
	      TRANSVERSE PLANE with positive values (up to 90) towards the right,
	      and negative values (down to -90) towards the left of the animal. If 
	      measured on a plant or circular animal, values should be explained in
	      the comment section. Measurements taken with a bifurcated probe 
	      should indicate '0'.

ProbeAngle1*: The angle of the probe in relation to normal (0) in the MEDIAN PLANE 
	      with positive values (up to 90) towards the head, and negative values
	      (down to -90) towards the rear of the animal. If measured on a plant 
	      or circular animal, values should be explained in the comment 
	      section. Measurements taken with a bifurcated probe should indicate
	      '0'.

ProbeAngle2*: The angle of the PROBE in relation to normal (0) in the TRANSVERSE 
	      PLANE with positive values (up to 90) towards the right, and negative 
	      values (down to -90) towards the left of the animal. If measured on a
	      plant or circular animal, values should be explained in the comment 
	      section. Measurements taken with a bifurcated probe should indicate 
   	      '0'.

Replicate*: A value representing different measurement instances of the same patch 
	    on the same specimen. If only one measurement was obtained per patch
	    please fill the column with the value '1'.

Comments: Please add comments spcific to the area measured if required only. E.g., 
	  'Colour showing sign of fading'
