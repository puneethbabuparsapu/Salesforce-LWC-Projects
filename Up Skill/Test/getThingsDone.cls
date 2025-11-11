public with sharing class getThingsDone
{
    @AuraEnabled(cacheable=true)
    public static List<String> paperNames(String typo)
    {
        List<String> pN = new List<String>();
        
        List<Paper_Bank__c> p = [Select id, Name, Paper_Type__c from Paper_Bank__c where Paper_Type__c =: typo];
        
        for(Paper_Bank__c pp : p)
        {
            pN.add(pp.Name);
        }
        
        System.debug(pN);
        return pN;
    }
    
	@AuraEnabled(cacheable=true)
    public static List<Question_Bank__c> questions(String typo, string testname)
    {
        List<Paper_Bank__c> p = [Select id, Name, Paper_Type__c from Paper_Bank__c where Name =: testname and Paper_Type__c =: typo];
        
        List<Question_Bank__c> qB = [Select id, Paper_Bank_Id__c, Question_Number__c, Question_Name__c, 
                                     Question_Option_1__c, Question_Option_2__c, Question_Option_3__c, Question_Option_4__c from Question_Bank__c where Paper_Bank_Id__c =: p[0].id];
        
        /*for(Integer i = 0; i<qB.size(); i++)
        {
            System.debug('Question Number: ' + qB[i].Question_Number__c);
            System.debug('Question Name: ' + qB[i].Question_Name__c);
            System.debug('Question Option1: ' + qB[i].Question_Option_1__c);
            System.debug('Question Option2: ' + qB[i].Question_Option_2__c);
            System.debug('Question Option3: ' + qB[i].Question_Option_3__c);
            System.debug('Question Option4: ' + qB[i].Question_Option_4__c);
        }*/
        
        return qB;
    }
    
    @AuraEnabled
    public static Id result(String type, String paper, List<Map<String, String>> answers, Id accId)
    {
        List<String> selectedOptions = new List<String>();
        
        // Collect the selected options
        for (Map<String, String> answer : answers) {
            selectedOptions.add(answer.get('selectedOption'));
        }
        
        // Debug output for selected options, test type, and test name
        System.debug('Test Type: ' + type);
        System.debug('Test Name: ' + paper);
        System.debug('Selected Options: ' + selectedOptions);
        
        List<Paper_Bank__c> p = [Select id, Name, Paper_Type__c from Paper_Bank__c where Paper_Type__c =: type and Name =: paper];
        Id pId = p[0].id;
        
        List<Answer_Bank__c> a = [Select id, Answer_Set_Values__c, Paper_Bank_Id__c from Answer_Bank__c where Paper_Bank_Id__c =: pId];
        
        List<String> cAnsSet = a[0].Answer_Set_Values__c.split(',');
        
        System.debug('Correct Options: ' + cAnsSet);
        
        Integer total = 10;
        Integer attempted = 0;
        Integer unAttempted = 0;
        Integer c = 0; // correct count
        Integer ic = 0; // incorrect count
        String status = '';
        
        for (Integer i = 0; i < cAnsSet.size(); i++) 
        {            
            if (selectedOptions[i] == NULL) 
            {
                unAttempted++;  // Increment unattempted count
                selectedOptions[i] = 'No Option Selected'; // Mark as unattempted
            }
            
            else 
            {
                attempted++; // Increment attempted count
                
                if (selectedOptions[i] == cAnsSet[i]) 
                {
                    c++; // Increment correct count
                }
                
                if (selectedOptions[i] != cAnsSet[i])
                {
                    ic++; // Increment incorrect count
                }
            }
            
            System.debug('Index: ' + i);
            System.debug('Selected Option: ' + selectedOptions[i]);
            System.debug('Correct Answer: ' + cAnsSet[i]);
            System.debug('Correct Count: ' + c);
            System.debug('Incorrect Count: ' + ic);
            
		}
       
        if (c >= (total / 2)) 
        {
            status = 'Pass';
        } 
        
        else 
        {
            status = 'Fail';
        }
        
        String cOp = String.join(cAnsSet, ',');
        String sOp = string.join(selectedOptions, ',');
        
        Result_Bank__c r = new Result_Bank__c();
        
        r.Paper_Bank_Id__c = pId;
        r.Answer_Bank_Id__c = a[0].id;
        r.Paper_Status__c = status;
        r.Paper_Total_Questions__c = total;
        r.Paper_Total_Attempted__c = attempted;
        r.Paper_Total_Unattempted__c = unAttempted;
        r.Paper_Total_Correct__c = c;
        r.Paper_Total_Incorrect__c = ic;
        r.Paper_Correct_Options__c = cOp;
        r.Paper_Selected_Options__c = sOp;
        r.Account_Id__c = accId;
        
        insert r;
        
        List<Account> acc = [Select id, Number_of_Online_Tests_Attempeted__c, Number_of_Online_Tests_Passed__c, Number_of_Mock_Tests_Attempeted__c, Number_of_Mock_Tests_Passed__c from Account where id =: accId];
        
        if(type == 'Online' && status == 'Pass')
        {
            acc[0].Number_of_Online_Tests_Attempeted__c++;
            acc[0].Number_of_Online_Tests_Passed__c++;
        }
        
        else if(type == 'Online' && status == 'Fail')
        {
            acc[0].Number_of_Online_Tests_Attempeted__c++;
        }
        
        if(type == 'Mock' && status == 'Pass')
        {
            acc[0].Number_of_Mock_Tests_Attempeted__c++;
            acc[0].Number_of_Mock_Tests_Passed__c++;
        }
        
        else if(type == 'Mock' && status == 'Fail')
        {
            acc[0].Number_of_Mock_Tests_Attempeted__c++;
        }
        
        update acc;        
        
        return r.id;
    }
	
    @AuraEnabled
    public static List<String> results (Id resId)
    {
        System.debug(resId);
        Result_Bank__c r = [Select id, Paper_Selected_Options__c, Paper_Correct_Options__c from Result_Bank__c where id =: resId];
        
        List<String> res = new List<String>();
        res.add(r.Paper_Selected_Options__c);
        res.add(r.Paper_Correct_Options__c);
        
        System.debug(res);
        return res;
    }
    
    @AuraEnabled
    public static List<Decimal> stats (Id resId)
    {
        System.debug(resId);
        Result_Bank__c r = [Select id, Paper_Total_Questions__c, Paper_Total_Attempted__c,  Paper_Total_Unattempted__c, Paper_Total_Correct__c, Paper_Total_Incorrect__c from Result_Bank__c where id =: resId];
        
        List<Decimal> res = new List<Decimal>();
        res.add(r.Paper_Total_Questions__c);
        res.add(r.Paper_Total_Attempted__c);
        res.add(r.Paper_Total_Unattempted__c);
        res.add(r.Paper_Total_Correct__c);
        res.add(r.Paper_Total_Incorrect__c);
        
        System.debug(res);
        return res;
    }
}
