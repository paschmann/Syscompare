Syscompare is a SAP HANA application giving auditors, developers, system admins and anyone else using HANA the ability to compare files across systems. The app is a native HANA application and uses xshttpdest files to connect, retrieve and compare. If you prefer to download a Delivery Unit, please click here. [Delivery Unit Download](http://www.metric2.com/metric2-downloads/)

###Install Instructions from Github

1. Fork or download a copy of these files
2. Upload or create a new project in eclipse and add the files. (Keep in mind that the folder names need to match).

###Install Instructions from Delivery Unit

1. Download the DU [here](http://www.metric2.com/metric2-downloads/) (email requested to stay up to date)
2. Using lifecycle manager, Import the DU

###Post Installation Instructions

1. Setup your 2 .xshttpdest files using the admin tool on the instance where the application files are running.
2. Open the Index.html file here: 

##Usage

1. Enter the names of the 2 HANA instances to compare (should be identical to the .xshttpdest filenames)
2. Run, the system will automatically compare the HANA respositories and return the differences
3. The scan will show:
* Missing Files on either system (and which system they are missing on)
* Files which are not identical (and display the differences)
* Files which could not be opened for any reason (security, errors)

## Notes

Uses the Orion File API available in > SPS09
Files can be opened directly in the application (easily compare differences)
