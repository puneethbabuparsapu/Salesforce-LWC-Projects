import { LightningElement, track, wire, api } from 'lwc';
import paperNames from '@salesforce/apex/getThingsDone.paperNames';
import getQuestions from '@salesforce/apex/getThingsDone.questions';
import getResult from '@salesforce/apex/getThingsDone.result';
import getResults from '@salesforce/apex/getThingsDone.results';
import getStats from '@salesforce/apex/getThingsDone.stats';

export default class PaperSelector extends LightningElement
{
    showingtestpage = true;

    @track minutes = '20';
    @track seconds = '00';
    isRunning = false;
    timerInterval;

    get isStartButtonDisabled() {
        return this.isRunning;
    }

    get isStopButtonDisabled() {
        return !this.isRunning;
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            let totalSeconds = 20 * 60; // 20 minutes

            this.timerInterval = setInterval(() => {
                totalSeconds--;
                this.minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
                this.seconds = String(totalSeconds % 60).padStart(2, '0');

                if (totalSeconds <= 0) {
                    clearInterval(this.timerInterval);
                    this.isRunning = false;
                }
            }, 1000);
        }
    }

    stopTimer() {
        if (this.isRunning) {
            clearInterval(this.timerInterval);
            this.isRunning = false;
        }
    }

    @track typeOptions = [
        { label: 'Online', value: 'Online' },
        { label: 'Mock', value: 'Mock' }
    ];

    @track paperOptions = [];
    @track selectedType = '';
    @track selectedPaper = '';
    @track questions = [];  // Holds the list of questions
    @track selectedOptionsArray = []; // Array to hold all selected options
    @track resId;
    @track results;
    @track one = [];
    @track two = [];
    @track totalQuestions;
    @track totalAttempted;
    @track totalUnattempted;
    @track totalCorrect;
    @track totalIncorrect;
    @track localId;

    error; // Error handler
    showDetails = false;

    divContOne = true;
    divContTwo = false;
    divContThree = false;

    on = true;
    showtimer = false;

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
        this.paperOptions = [];
        this.selectedPaper = '';

        if (this.selectedType) {
            this.fetchPaperNames(this.selectedType);
        }
    }

    fetchPaperNames(typo) {
        paperNames({ typo })
            .then(data => {
                this.paperOptions = data.map(paper => {
                    return { label: paper, value: paper };
                });
            })
            .catch(error => {
                console.error('Error retrieving paper names:', error);
            });
    }

    handlePaperChange(event) {
        this.selectedPaper = event.detail.value;
    }

    handleSubmit() {
        console.log('Selected Type:', this.selectedType);
        console.log('Selected Paper:', this.selectedPaper);

        if (this.selectedType && this.selectedPaper) {
            this.fetchQuestions(this.selectedType, this.selectedPaper);
        }

        this.divContOne = false;
        this.divContTwo = true;
        this.on = false;

        if(this.selectedType == 'Online')
        {
            this.showtimer = true;
            this.startTimer();
        }
        
    }

    fetchQuestions(typo, testname) {
        getQuestions({ typo, testname })
            .then(data => {
                this.questions = data.map((q) => ({
                    id: q.Id,
                    number: q.Question_Number__c,
                    name: q.Question_Name__c,
                    options: [
                        { label: q.Question_Option_1__c, value: 'option1' },
                        { label: q.Question_Option_2__c, value: 'option2' },
                        { label: q.Question_Option_3__c, value: 'option3' },
                        { label: q.Question_Option_4__c, value: 'option4' }
                    ],
                    selectedOption: null // Initialize selected option as null
                }));

                console.log('Fetched Questions:', this.questions);

                // Sort questions by question number
                this.questions.sort((a, b) => a.number - b.number);

                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.questions = [];
                console.error('Error fetching questions:', error);
            });
    }

    // Individual handler for each question
    handleOptionChange(event) {
        const questionId = event.target.dataset.questionId; // Get the question ID from the data attribute
        const selectedValue = event.detail.value; // Get the selected value

        // Update the selected option for the specific question
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
            question.selectedOption = selectedValue; // Store selected option
        }
        console.log(`Selected option for question ${questionId}: ${selectedValue}`);
    }

    collectOptionsAndSubmit() 
    {
        // Collect selected options along with their respective question IDs
        const answersToSubmit = this.questions.map(question => ({
            selectedOption: question.selectedOption // Only send the selected option
        })); // Filter out any null selections
    
        console.log('Collected Selected Options:', answersToSubmit);
        this.localId = localStorage.getItem('AccountId')
        // Prepare data to send to Apex, including selected type and paper name
        const submissionData = {
            type: this.selectedType,            // Include the selected type
            paper: this.selectedPaper,          // Include the selected paper
            answers: answersToSubmit,
            accId: this.localId            // Include the selected options
        };
        
        // Call the Apex method and pass the collected data
        getResult(submissionData)
            .then(result => {
                // Handle success if needed
                console.log('Options submitted successfully');
                this.resId = result;
                console.log('Result Id: ', this.resId);
            })
            .catch(error => {
                // Log the error message for better debugging
                console.error('Error submitting options:', error.body.message);
            });

        this.divContTwo = false;
        this.divContThree = true;
        this.on = true;

        this.showtimer = false;
        this.stopTimer();
    }  
    
    get selectedOptions() {
        // Split selected options into an array
        return this.results && this.results[0] ? this.results[0].split(',') : [];
    }

    get correctOptions() {
        // Split correct options into an array
        return this.results && this.results[1] ? this.results[1].split(',') : [];
    }

    handleFetchResults()
    {
        getStats({ resId: this.resId })
            .then(result => {
                // Assuming result is an array of Decimals
                this.totalQuestions = result[0];
                this.totalAttempted = result[1];
                this.totalUnattempted = result[2];
                this.totalCorrect = result[3];
                this.totalIncorrect = result[4];
                this.error = undefined; // Reset error
            })
            .catch(error => {
                this.error = error; // Handle any errors
                console.error('Error fetching stats:', error);
            });

        getResults({ resId : this.resId })
            .then((result) => {
                // Assign the result to the tracked property
                console.log("Questions: ", this.questions);
                this.one = result[0] ? result[0].split(',') : []; // Handle case where result is undefined or empty
                console.log("Selected Options: ", this.one);
                
                this.two = result[1] ? result[1].split(',') : []; // Handle case where result is undefined or empty
                console.log("Correct Options: ", this.two);
            })
            .catch((error) => {
                console.error('Error fetching results:', error); // Handle error appropriately
            });

        this.showDetails = true;
    }

    get combinedQuestions() {
        return this.questions.map((question, index) => ({
            question,
            selectedOption: this.one[index] || 'None', // Default to 'None' if no selection
            correctOption: this.two[index] || 'None',   // Default to 'None' if no correct option
            combinedOptions: question.options 
                ? question.options.map(option => option.label).filter(label => label) // Filter out any undefined or falsy values
                : [] // Ensure it's an empty array if options are not available
        }));
    }

    handleLogInButton()
    {
        this.showingtestpage = false;
        this.showhomepage = true;
    }
    
}