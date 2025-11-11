public with sharing class fetchAccountController
{
    @AuraEnabled
    public static id loginAccount(string loginuser, string loginpass)
    {        
        System.debug(loginuser);
        System.debug(loginpass);
        try
        {
           	List<Account> acc = [Select id, Username__c, Password__c from Account where Username__c =: loginuser and Password__c =: loginpass];
            
            System.debug(acc);  
            return acc[0].id;
			          
        }
        
        catch (Exception e)
        {
            throw new AuraHandledException('Error creating Account: ' + e.getMessage());
        }
    }
}
