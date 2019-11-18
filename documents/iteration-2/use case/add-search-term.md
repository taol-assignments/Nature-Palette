#### Name：
adding search term.
#### Participating actor: 
Administrator.
#### Entry condition: 
Administrator has logged into the system and has the priority to add search term.
#### Flow of events: 
1. Administrator click 'add search term button' to start.
2. System presents a list of current search terms and an 'add' button.
3. Administrator click the 'add' button.
4. The System display a form for Administrator to input the name of new term.
5. Administrator inputs the name and click to submit.
6. The System check the name of new term and insert it to database.
7. The system displays the insertion result.
#### Exit condition: 
Administrator finish adding.
#### Alternative flows: 
* 6a. Administrator input a name that already exists:
    * System stops the insertion, and notify the user about duplicate name.
    * Administrator acknowledge the message and choose to add once more.
    * System reverts to step 5.