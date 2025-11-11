import { LightningElement, api, track, wire } from 'lwc';

import photo1 from '@salesforce/resourceUrl/salesforceOne';
import photo2 from '@salesforce/resourceUrl/salesforceTwo';
import photo3 from '@salesforce/resourceUrl/salesforceThree';
import photo4 from '@salesforce/resourceUrl/salesforceFour';
import photo5 from '@salesforce/resourceUrl/salesforceFive';

export default class SalesforceUpSkillFoundation extends LightningElement
{

    //default homepage is true
    showhomepage = true;
    accountLoggedIn = false;

    //Salesforce Characters
    pic1 = photo1;
    pic2 = photo2;
    pic3 = photo3;
    pic4 = photo4;
    pic5 = photo5;

    //Block - Coursel
    currentSlide = 0;

    @track prev = '<';
    @track next = '>';

    handlePrev() {
        const carousel = this.template.querySelector('.carousel');
        const blocks = this.template.querySelectorAll('.carousel-block');
        if (this.currentSlide > 0) {
            this.currentSlide--;
        } else {
            this.currentSlide = blocks.length - 1; // Go to last slide if at first
        }
        this.updateCarousel(carousel);
    }

    handleNext() {
        const carousel = this.template.querySelector('.carousel');
        const blocks = this.template.querySelectorAll('.carousel-block');
        if (this.currentSlide < blocks.length - 1) {
            this.currentSlide++;
        } else {
            this.currentSlide = 0; // Go to first slide if at last
        }
        this.updateCarousel(carousel);
    }

    updateCarousel(carousel) {
        const blockWidth = carousel.querySelector('.carousel-block').offsetWidth;
        const offset = -this.currentSlide * blockWidth;
        carousel.style.transform = `translateX(${offset}px)`;
    }

    //main part
    @api showhomepage;

    localId;
    loggedIn;

    connectedCallback() {
        console.log("This is Homepage");

        this.localId = localStorage.getItem('AccountId');
        console.log("Got from Local Storage: ", this.localId);

        this.loggedIn = localStorage.getItem('AccountLogged');
        console.log("Account Logged In: ", this.loggedIn);
    }

    @api showlogpage;
    @api showingtestpage;
    @api showstudyroompage;
    @api showanalysispage;

    // @api showMockTestPage;
    // @api showStudyRoomPage;
    // @api showPerformPage;

    //initial homepage is true
    showhomepage = true;

    //intial all other pages are false
    showlogpage = false;
    showingtestpage= false;
    showstudyroompage = false;
    showanalysispage = false;
    // showOnlineMockPage = true;

    //handle functions
    handleLogInButton()
    {
        console.log("LogIn Button Clicked");
        this.showlogpage = true;
        this.showhomepage = false;
    }


    handleLogOutButton()
    {
        console.log("Logout Button Clicked");
        this.accountLoggedIn = false;

        this.showlogpage = true;
        this.showhomepage = false;

        localStorage.removeItem('AccountId');
        localStorage.removeItem('AccountLogged');
    }


    handleTestButton()
    {
        console.log("Online Test Button Clicked");
        console.log("--------------------------");
        
        this.showingtestpage = true;
        this.showhomepage = false;
    }

    handleStudyRoomButton()
    {
        console.log("Study Room Button Clicked");
        console.log("--------------------------");
        
        this.showstudyroompage = true;
        this.showhomepage = false;
    }

    handleResultAnalysisButton()
    {
        console.log("Study Room Button Clicked");
        console.log("--------------------------");
        
        this.showanalysispage = true;
        this.showhomepage = false;
    }
}