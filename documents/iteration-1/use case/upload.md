#### Name：
upload data.
#### Participating actor: 
Administrator, Researcher.
#### Entry condition: 
Administrator / Researcher has logged into the system.
#### Flow of events: 
1. Administrator / Researcher click "Upload Data" button to request submission.
2. System presents the instruction page with templates and instructions for administrator / researcher to read.
3. Administrator / Researcher read the instructions, download templates and fill in it, and then confirm to start submission.
4. The System displays the first-step form for submission.
5. Administrator / Researcher input basic information related to submission, and then click 'Next' button.
6. The system displays the second-step form for submission.
7. Administrator / Researcher upload metadata file and raw file, and then click 'submit' button.
8. The system validates the format of input area to make sure the input meets requirements.
9. The system submit basic information and files to server.
10. The system validates metadata file and raw file using UVR1, UVR2, and notify researcher about the result.
11. The system validates raw files using UVR3.
#### Exit condition: 
Administrator / Researcher complete submission.
#### Alternative flows: 
* 8a. Administrator / Researcher input basic information in invalid format:
    * System informs Administrator / Researcher about errors, and give instructions of correct format.
    * Administrator / Researcher acknowledges the error message.
    * Administrator / Researcher corrects errors according instruction, and click 'submit' button.
    * System reverts to step 9.
* 10a. The metadata file and raw file are invalid under the rule UVR1, UVR2:
    * System informs Administrator / Researcher about invalidation.
    * Administrator / Researcher acknowledges the error message.
    * Administrator / Researcher choose to submit valid files again or stop submission.
* 11a. Some of the raw files are invalid:
    * System release those validated files, and then notify researcher about those invalid files via email.