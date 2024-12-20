const { create } = require('xmlbuilder2');

class XmlGenerator {
    static generateCbcXML(data) {
        const xml = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('cbc:CBC_OECD', {
                'xmlns:cbc': 'urn:oecd:ties:cbc:v2',
                'xmlns:stf': 'urn:oecd:ties:cbcstf:v5',
                'xmlns:iso': 'urn:oecd:ties:isocbctypes:v1',
                'version': '2.0'
            });

        const cbcBody = xml.ele('cbc:CbcBody');

        // Add Table 1 section
        const table1Section = cbcBody.ele('cbc:Table1');
        
        // Add Table 1 headers
        data.table1Data.headers.forEach(header => {
            table1Section.ele('cbc:Header').txt(header);
        });

        // Add Table 1 reports
        data.table1Data.jurisdictions.forEach(jurisdiction => {
            const report = table1Section.ele('cbc:CbcReports');
            
            report.ele('cbc:ResCountryCode').txt(jurisdiction.taxJurisdiction);

            const summary = report.ele('cbc:Summary');
            
            summary.ele('cbc:Revenues')
                .ele('cbc:Unrelated', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.unrelatedRevenue)).up()
                .ele('cbc:Related', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.relatedRevenue)).up()
                .ele('cbc:Total', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.totalRevenue));

            summary
                .ele('cbc:ProfitOrLoss', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.profitLoss)).up()
                .ele('cbc:TaxPaid', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.taxPaid)).up()
                .ele('cbc:TaxAccrued', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.taxAccrued)).up()
                .ele('cbc:Capital', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.capital)).up()
                .ele('cbc:Earnings', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.earnings)).up()
                .ele('cbc:NbEmployees')
                    .txt(String(jurisdiction.employees)).up()
                .ele('cbc:Assets', { currCode: data.table1Data.metadata.currency })
                    .txt(String(jurisdiction.tangibleAssets));
        });

        // Add Table 2 section
        const table2Section = cbcBody.ele('cbc:Table2');
        
        // Add Table 2 headers
        data.table2Data.headers.forEach(header => {
            table2Section.ele('cbc:Header').txt(header);
        });

        // Add Table 2 constituent entities grouped by jurisdiction
        data.table1Data.jurisdictions.forEach(jurisdiction => {
            const entities = data.table2Data.entities.filter(e => 
                e.taxJurisdiction === jurisdiction.taxJurisdiction);
            
            if (entities.length > 0) {
                const jurisdictionGroup = table2Section.ele('cbc:Jurisdiction');
                jurisdictionGroup.ele('cbc:ResCountryCode').txt(jurisdiction.taxJurisdiction);

                entities.forEach(entity => {
                    const constEntity = jurisdictionGroup.ele('cbc:ConstEntity');
                    
                    constEntity
                        .ele('cbc:Name').txt(entity.entityName);

                    entity.activities.forEach(activity => {
                        constEntity.ele('cbc:BizActivities').txt(activity);
                    });
                });
            }
        });

        // Add Table 3 section
        if (data.table3Data.headers.length > 0 || data.table3Data.additionalInfo.length > 0) {
            const table3Section = cbcBody.ele('cbc:Table3');
            
            // Add Table 3 headers
            data.table3Data.headers.forEach(header => {
                table3Section.ele('cbc:Header').txt(header);
            });

            // Add Table 3 additional information
            data.table3Data.additionalInfo.forEach(info => {
                table3Section.ele('cbc:AdditionalInfo')
                    .ele('cbc:OtherInfo')
                        .txt(`${info.sn}. ${info.description}`);
            });
        }

        return xml.end({ prettyPrint: true });
    }
}

module.exports = { XmlGenerator };