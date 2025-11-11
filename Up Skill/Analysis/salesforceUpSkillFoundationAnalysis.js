import { LightningElement, track, wire, api } from 'lwc';
import getAccountReportData from '@salesforce/apex/AccountTestReportController.function';
import function1 from '@salesforce/apex/AccountTestReportController.function1';
import { loadScript } from 'lightning/platformResourceLoader';
import chartJs from '@salesforce/resourceUrl/chartJs';

export default class SalesforceUpSkillFoundationAnalysis extends LightningElement
{
    showanalysispage = true;

    @track outerKeysList = []; // List to hold outer keys
    @track innerKeysList  = []; // List to hold inner keys
    @track decimalValuesList = []; // List to hold decimal values
    @api targetAccountId;
    @api accountId;
    isChartJsInitialized = false; // To track if Chart.js has been loaded

    connectedCallback() {
        console.log("This is Analysis Page");

        this.targetAccountId = localStorage.getItem('AccountId');
        this.accountId = localStorage.getItem('AccountId');
        console.log("Got from Local Storage: ", this.localId);

        this.loggedIn = localStorage.getItem('AccountLogged');
        console.log("Account Logged In: ", this.loggedIn);


    }

    @wire(getAccountReportData, { targetAccountId: '$targetAccountId' })
    wiredMap({ error, data }) {
        if (data) {
            this.processData(data);
            this.loadChartJs();
        } else if (error) {
            console.error('Error fetching data:', error);
        }
    }

    processData(data) {
        this.outerKeysList = [];
        this.innerKeysList = [];
        this.decimalValuesList = [];
    
        // Define the new metric names to replace the inner keys
        const metricNames = [
            'Sum of Paper Total Questions',
            'Sum of Paper Total Attempted',
            'Sum of Paper Total Unattempted',
            'Sum of Paper Total Correct',
            'Sum of Paper Total Incorrect',
            'Paper Count'
        ];
    
        Object.keys(data).forEach(outerKey => {
            this.outerKeysList.push(outerKey);  // Store outer keys
            const innerMap = data[outerKey];    // Get the inner map (metrics and values)
            const innerKeys = [];
            const values = [];
    
            Object.keys(innerMap).forEach((innerKey, index) => {
                // Replace the inner key with the new metric names
                innerKeys.push(metricNames[index] || innerKey); // Use default if index exceeds length
                values.push(innerMap[innerKey]); // Store the corresponding value
            });
    
            // Store the inner keys and values separately for rendering
            this.innerKeysList.push(innerKeys);    // Replaced inner keys with new metric names
            this.decimalValuesList.push(values);   // Values remain the same
        });
    
        console.log('Processed Data:', {
            outerKeys: this.outerKeysList,
            innerKeys: this.innerKeysList,
            decimalValues: this.decimalValuesList
        });
    }
    

    loadChartJs() {
        if (this.isChartJsInitialized) {
            this.createCharts();
            return;
        }

        loadScript(this, chartJs)
            .then(() => {
                this.isChartJsInitialized = true;
                this.createCharts();
            })
            .catch(error => {
                console.error('Error loading Chart.js:', error);
            });
    }
   
    createCharts() {
        // Define a list of colors that you want to use for your charts
        const colors = ['#009596', '#4CB140', '#519DE9', '#F0AB00', '#5752D1', '#C9190B', '#8A8D90']; // Add more colors if needed
    
        this.outerKeysList.forEach((outerKey, index) => {
            const canvas = this.template.querySelector(`canvas[data-id="${index}"]`);
            const ctx = canvas.getContext('2d');
    
            // Use the inner keys and values specific to the outer key
            const innerKeys = this.innerKeysList[index];
            const valuesForChart = this.decimalValuesList[index];
    
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: innerKeys,
                    datasets: [{
                        label: outerKey, // Optional: you can keep it or remove it
                        data: valuesForChart,
                        backgroundColor: colors[index % colors.length], // Assign a color based on index
                        borderColor: '#000', // Border color
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false // Disable the legend (no color beside outer key)
                        }
                    }
                }
            });
    
            // Render inner keys and their values separately
            this.renderInnerKeysAndValues(outerKey, innerKeys, valuesForChart);
        });
    }
    

    renderInnerKeysAndValues(outerKey, innerKeys, values) {
        // Create a container for the inner keys and values
        const container = this.template.querySelector(`.inner-keys-container[data-id="${outerKey}"]`);
        innerKeys.forEach((innerKey, index) => {
            const value = values[index];
            const item = document.createElement('div');
            //item.style.fontSize = '32px';
            //item.innerText = `${innerKey}: ${value}`;
            container.appendChild(item);
        });
    }

    getRandomColors(num) {
        const colors = [];
        for (let i = 0; i < num; i++) {
            colors.push(`hsl(${Math.random() * 360}, 100%, 50%)`);
        }
        return colors;
    }

    handleHomeButton()
    {
        this.showanalysispage = false;
        this.showhomepage = true;
    }

    pieChart; // Chart.js instance for the pie chart
    pieData = []; // Holds the returned list of decimal values
    pieLabels = ['Sum of Number of Online Tests Attempeted', 'Sum of Number of Online Tests Passed', 'Sum of Number of Mock Tests Attempeted', 'Sum of Number of Mock Tests Passed'];; // Holds the labels for the pie chart segments

    @wire(function1, { targetAccountId: '$accountId' })
    wiredReportData({ error, data }) {
        if (data) {
            this.pieData = this.formatData(data); // Assign the returned data to pieData
            this.loadChart(); // Load Chart.js and create the pie chart
        } else if (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Load Chart.js and create the pie chart
    loadChart() {
        loadScript(this, chartJs) // Load the Chart.js library
            .then(() => {
                this.createPieChart(); // Create the pie chart
            })
            .catch(error => {
                console.error('Error loading Chart.js:', error);
            });
    }
    
    
    createPieChart() {
        // Ensure Chart.js is loaded and the previous chart is destroyed
        if (this.pieChart) {
            this.pieChart.destroy();
        }

        const ctx = this.template.querySelector('.pie-chart').getContext('2d');
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']; // Fixed colors for pie segments
        // Create the pie chart
        this.pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: this.pieLabels, // Legend labels for the pie chart
                datasets: [{
                    data: this.pieData,
                    backgroundColor: colors,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            padding: 100, // Adds padding between the chart and legend labels
                        }
                    },
                },
            },
        });
    }

    formatData(data) {
        return data.map(value => {
            return value % 1 === 0 ? parseInt(value) : parseFloat(value.toFixed(2)); // Convert to integer if no decimal, else round to 2 decimal places
        });
    }

    // Function to generate random colors for the pie chart segments
    generateColors(numColors) {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            colors.push(`hsl(${Math.random() * 360}, 100%, 50%)`);
        }
        return colors;
    }

    disconnectedCallback() {
        // Destroy the chart when the component is removed from the DOM
        if (this.pieChart) {
            this.pieChart.destroy();
        }
    }
}