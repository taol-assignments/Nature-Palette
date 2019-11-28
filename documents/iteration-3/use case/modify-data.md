#### Name：
modify data.
#### Participating actor: 
Administrator, Researcher.
#### Entry condition: 
Administrator / Researcher has logged into the system.
#### Flow of events: 
1. Administrator / Researcher click "Modify Data" button to request modification.
2. System displays a list of submissions that were submitted by Researcher, each submission has a button for modification.
3. Administrator / Researcher choose a submission to modify.
4. The System displays input form for Researcher to upload the metadata and raw files.
5. Administrator / Researcher choose the metadata and raw files for modification, then click 'submit' button.
6. The system validates the metadata and raw files using DMR-1, and notify researcher about the result.
7. The system retrieves the old raw files that Researcher requested to modify.
8. The system replaces the old raw files with new raw files and replaces old metadata information with new metadata information related to the new raw files.
9. System notify Researcher about the successful result.
10. The system validates raw files using UVR3 and computes metrics for uploaded raw files.
11. The system stores the calculated metrics and then releases the data.
#### Exit condition: 
Administrator / Researcher complete modification.
#### Alternative flows: 
* 6a. System finds error during validation:
    * System informs Administrator / Researcher about errors, and give instructions of correct format.
    * Administrator / Researcher acknowledges the error message.
    * System reverts to step 4.
* 10a. System finds corrupted files or files with large negative values:
    * System informs Administrator / Researcher about invalid files.
    * Administrator / Researcher acknowledges the error message.
    * Administrator / Researcher choose to modify files again or stop modification.