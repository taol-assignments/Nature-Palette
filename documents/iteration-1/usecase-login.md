#### Name：
log into system.
#### Participating actor: 
Administrator, Researcher.
#### Entry condition: 
Administrator / Researcher can access the system.
#### Flow of events: 
1. Administrator / Researcher click login button to login.
2. System presents a form with email and password for administrator / researcher to input.
3. Administrator / Researcher input the email and password correctly, then click login button.
4. The System validates the account.
5. The system set the status as logged in if the account is valid.
6. The System displays homepage in the login-in state for administrator / researcher.
#### Exit condition: 
Administrator / Researcher is logged in.
#### Alternative flows: 
* 3a. Administrator / Researcher input email or password in invalid format:
    * System informs Administrator / Researcher about errors, and give instructions of correct format.
    * Administrator / Researcher acknowledges the error message.
    * Administrator / Researcher corrects errors according instruction, and click login button.
    * System reverts to step 4.
* 4a. The account doesn't exist or the password doesn't match the email:
    * System informs Administrator / Researcher about errors.
    * Administrator / Researcher acknowledges the error message.
    * Administrator / Researcher input correct email address or password, and click login button.
    * The system validates the new input account.
    * System reverts to step 5.