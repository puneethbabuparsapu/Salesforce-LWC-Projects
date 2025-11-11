import { LightningElement } from 'lwc';

import myRarFile1 from '@salesforce/resourceUrl/studymatone'; // Import the .rar static resource
import myRarFile2 from '@salesforce/resourceUrl/studymattwo'; // Import the .rar static resource
import myRarFile3 from '@salesforce/resourceUrl/studymatthree'; // Import the .rar static resource
import myRarFile4 from '@salesforce/resourceUrl/studymatfour'; // Import the .rar static resource

export default class SalesforceUpSkillFoundationStudyRoom extends LightningElement
{
    showstudyroompage = true;

    connectedCallback()
    {
        console.log("This is Study Room Page");
        console.log("Account Logged In: ", this.accountLoggedIn);

        this.localId = localStorage.getItem('AccountId');
        console.log("Got from Local Storage: ", this.localId);
    }
    
    handleHomeButton()
    {
        console.log("Home Button Clicked");

        this.showstudyroompage = false;
        this.showhomepage = true;
        this.accountLoggedIn = true;
    }

    fileUrl1 = myRarFile1;
    fileUrl2 = myRarFile2;
    fileUrl3 = myRarFile3;
    fileUrl4 = myRarFile4;

    downloadFile1() {
        // Create a temporary anchor element to initiate the download
        const link = document.createElement('a');
        link.href = this.fileUrl1;  // Set the URL to the .rar file
        link.download = 'Admin Study Materials.rar';  // Suggested file name for the download
        document.body.appendChild(link);
        link.click();  // Programmatically trigger the download
        document.body.removeChild(link);  // Clean up by removing the temporary anchor element
    }

    downloadFile2() {
        // Create a temporary anchor element to initiate the download
        const link = document.createElement('a');
        link.href = this.fileUrl2;  // Set the URL to the .rar file
        link.download = 'Apex Study Materials.rar';  // Suggested file name for the download
        document.body.appendChild(link);
        link.click();  // Programmatically trigger the download
        document.body.removeChild(link);  // Clean up by removing the temporary anchor element
    }

    downloadFile3() {
        // Create a temporary anchor element to initiate the download
        const link = document.createElement('a');
        link.href = this.fileUrl3;  // Set the URL to the .rar file
        link.download = 'LWC Study Materials.rar';  // Suggested file name for the download
        document.body.appendChild(link);
        link.click();  // Programmatically trigger the download
        document.body.removeChild(link);  // Clean up by removing the temporary anchor element
    }

    downloadFile4() {
        // Create a temporary anchor element to initiate the download
        const link = document.createElement('a');
        link.href = this.fileUrl4;  // Set the URL to the .rar file
        link.download = 'CPQ Study Materials.rar';  // Suggested file name for the download
        document.body.appendChild(link);
        link.click();  // Programmatically trigger the download
        document.body.removeChild(link);  // Clean up by removing the temporary anchor element
    }
}