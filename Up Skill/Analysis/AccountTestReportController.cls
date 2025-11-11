public with sharing class AccountTestReportController
{       
    @AuraEnabled(cacheable=true)
    public static Map<String, Map<String, Decimal>> function(String targetAccountId)
    {   
        String reportId = '00OIS000000k4UC2AY';
        
        Reports.ReportResults results = Reports.ReportManager.runReport(reportId, true);
        
        Reports.Dimension groupingsDown = results.getGroupingsDown();
        System.debug('Groupings Down:');
        List<Reports.GroupingValue> rowGroupings = groupingsDown.getGroupings();

        Reports.Dimension groupingsAcross = results.getGroupingsAcross();
        System.debug('Groupings Across:');
        List<Reports.GroupingValue> colGroupings = (groupingsAcross != null) ? groupingsAcross.getGroupings() : null;
        
        Map<String, List<Reports.SummaryValue>> summaryValuesByFactKey = new Map<String, List<Reports.SummaryValue>>();
        
        Map<String, Map<String, Decimal>> d = new Map<String, Map<String, Decimal>>();
        
        for (Reports.GroupingValue rowGrouping : rowGroupings) 
        {
            String rowGroupingValue = (String) rowGrouping.getValue(); 
            String rowGroupingKey = rowGrouping.getKey(); 
            
            if (rowGroupingValue == targetAccountId) 
            {
                System.debug('Row Grouping Key: ' + rowGroupingKey);
                System.debug('Row Grouping Label: ' + rowGrouping.getLabel());
                System.debug('Row Grouping Value: ' + rowGroupingValue);
                
                if (colGroupings != null)
                {
                    for (Reports.GroupingValue colGrouping : colGroupings) 
                    {
                        String colGroupingKey = colGrouping.getKey();
                        System.debug('Column Grouping Key: ' + colGroupingKey);
                        System.debug('Column Grouping Label: ' + colGrouping.getLabel());
                        System.debug('Column Grouping Value: ' + colGrouping.getValue());
                        
                        String factKey = rowGroupingKey + '!' + colGroupingKey;
                        
                        Reports.ReportFact fact = results.getFactMap().get(factKey);
                        
                        List<Reports.SummaryValue> summaryValues = new List<Reports.SummaryValue>();
                        
                        Map<String, Decimal> innerMap = new Map<String, Decimal>();
                        Integer metricCount = 1; 
                        
                        if (fact != null) 
                        {
                            for (Reports.SummaryValue summary : fact.getAggregates()) 
                            {
                                System.debug('Fact Key: ' + factKey);
                                System.debug('Column Name: ' + colGrouping.getLabel());
                                System.debug('Summary Label: ' + summary.getLabel());
                                System.debug('Summary Value: ' + summary.getValue());
                                System.debug('---------------------------------------');
                                
                                summaryValues.add(summary);
                                
                                if (summary.getValue() instanceof Decimal) 
                                {
                                    innerMap.put('Metric' + metricCount, (Decimal)summary.getValue());
                                } 
                                else if (summary.getValue() instanceof Integer) 
                                {
                                    innerMap.put('Metric' + metricCount, Decimal.valueOf((Integer)summary.getValue()));
                                }
                                
                                metricCount++;
                            }
                            
                            summaryValuesByFactKey.put(factKey, summaryValues);
                            
                            d.put(colGrouping.getLabel(), innerMap);
                        } 
                        else 
                        {
                            System.debug('No data for Fact Key: ' + factKey);
                        }
                    }
                } 
                else
                {
                    String factKey = rowGroupingKey;
                    
                    Reports.ReportFact fact = results.getFactMap().get(factKey);
                    
                    List<Reports.SummaryValue> summaryValues = new List<Reports.SummaryValue>();
                    
                    Map<String, Decimal> innerMap = new Map<String, Decimal>();
                    Integer metricCount = 1; 
                    
                    if (fact != null) 
                    {
                        for (Reports.SummaryValue summary : fact.getAggregates()) 
                        {
                            System.debug('Summary Label: ' + summary.getLabel());
                            System.debug('Summary Value: ' + summary.getValue());
                            System.debug('---------------------------------------');
                            
                            summaryValues.add(summary);
                            
                            if (summary.getValue() instanceof Decimal) 
                            {
                                innerMap.put('Metric' + metricCount, (Decimal)summary.getValue());
                            } 
                            else if (summary.getValue() instanceof Integer) 
                            {
                                innerMap.put('Metric' + metricCount, Decimal.valueOf((Integer)summary.getValue()));
                            }
                            
                            metricCount++;
                        }
                        summaryValuesByFactKey.put(factKey, summaryValues);
                        
                        d.put('FactKey-' + factKey, innerMap); 
                    } 
                    else 
                    {
                        System.debug('No data for Fact Key: ' + factKey);
                    }
                }
            }
        }
        
        System.debug('Final Summary Value Map: ' + d);
        
        
        for (String outerKey : d.keySet()) {
            System.debug('Outer Key (Column Name): ' + outerKey);
            Map<String, Decimal> innerMap = d.get(outerKey);
            for (String innerKey : innerMap.keySet()) {
                System.debug('   Inner Key (Metric Name): ' + innerKey + ', Value: ' + innerMap.get(innerKey));
            }
        }
        
        return d;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Decimal> function1(String targetAccountId) 
    {   
        String reportId = '00OIS000000k4U72AI';

        Reports.ReportResults results = Reports.ReportManager.runReport(reportId, true);
        
        Reports.Dimension groupingsDown = results.getGroupingsDown();
        List<Reports.GroupingValue> rowGroupings = groupingsDown.getGroupings();
        
        Reports.Dimension groupingsAcross = results.getGroupingsAcross();
        List<Reports.GroupingValue> colGroupings = (groupingsAcross != null) ? groupingsAcross.getGroupings() : null;
        
        List<Decimal> summaryValuesList = new List<Decimal>();
        
        for (Reports.GroupingValue rowGrouping : rowGroupings) 
        {
            String rowGroupingValue = (String) rowGrouping.getValue();
            
            if (rowGroupingValue == targetAccountId) 
            {
                if (colGroupings != null) 
                {
                    for (Reports.GroupingValue colGrouping : colGroupings) 
                    {
                        String colGroupingValue = (String) colGrouping.getValue();
                        
                        if (colGroupingValue == targetAccountId) 
                        {
                            String colGroupingKey = colGrouping.getKey();
                            String factKey = rowGrouping.getKey() + '!' + colGroupingKey;
                            Reports.ReportFact fact = results.getFactMap().get(factKey);
                            
                            if (fact != null) 
                            {
                                for (Reports.SummaryValue summary : fact.getAggregates())
                                {
                                    if (summary.getValue() instanceof Decimal) 
                                    {
                                        summaryValuesList.add((Decimal) summary.getValue());
                                    } 
                                    
                                    else if (summary.getValue() instanceof Integer) 
                                    {
                                        summaryValuesList.add(Decimal.valueOf((Integer) summary.getValue()));
                                    }
                                }
                            } 
                            
                            else 
                            {
                                System.debug('No data for Fact Key: ' + factKey);
                            }
                        }
                    }
                } 
                
                else 
                {
                    String factKey = rowGrouping.getKey();
                    Reports.ReportFact fact = results.getFactMap().get(factKey);
                    
                    if (fact != null) 
                    {
                        for (Reports.SummaryValue summary : fact.getAggregates()) 
                        {
                            if (summary.getValue() instanceof Decimal) 
                            {
                                summaryValuesList.add((Decimal) summary.getValue());
                            } 
                            
                            else if (summary.getValue() instanceof Integer)
                            {
                                summaryValuesList.add(Decimal.valueOf((Integer) summary.getValue()));
                            }
                        }
                    } 
                    
                    else 
                    {
                        System.debug('No data for Fact Key: ' + factKey);
                    }
                }
            }
        }
        
        System.debug('Final Summary Value List: ' + summaryValuesList);
        
        Integer size = summaryValuesList.size() - 1;
        summaryValuesList.remove(size);
        
        System.debug('Final Summary Value List: ' + summaryValuesList);
        
        return summaryValuesList;

    }
}
