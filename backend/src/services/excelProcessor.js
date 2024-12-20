const xlsx = require('xlsx');
const { XmlGenerator } = require('./xmlGenerator');

class ExcelProcessor {
    static processExcelFile(filePath) {
        try {
            const workbook = xlsx.readFile(filePath);
            
            const table1Data = this.processTable1(workbook.Sheets['Table 1']);
            const table2Data = this.processTable2(workbook.Sheets['Table 2']);
            const table3Data = this.processTable3(workbook.Sheets['Table 3']);

            return XmlGenerator.generateCbcXML({
                table1Data,
                table2Data,
                table3Data
            });
        } catch (error) {
            console.error('Excel processing error:', error);
            throw error;
        }
    }

    static processTable1(sheet) {
        if (!sheet) {
            console.error('Table 1 sheet not found');
            return { headers: [], metadata: {}, jurisdictions: [] };
        }

        try {
            const rawData = xlsx.utils.sheet_to_json(sheet, { 
                header: 1,
                raw: true,
                defval: '',
                blankrows: false
            });

            // Capture headers
            const headers = [];
            let metadata = {
                tableTitle: '',
                mneGroup: '',
                fiscalYear: '',
                currency: ''
            };

            for (let i = 0; i < rawData.length; i++) {
                const row = rawData[i];
                if (!Array.isArray(row)) continue;
                
                const rowText = row.map(cell => String(cell || '')).join(' ').trim();
                
                if (rowText.includes('TABLE 1')) {
                    metadata.tableTitle = rowText;
                    headers.push(rowText);
                }
                else if (rowText.includes('NAME OF THE MNE GROUP')) {
                    const [_, value] = rowText.split(':');
                    metadata.mneGroup = value ? value.trim() : '';
                    headers.push(rowText);
                }
                else if (rowText.includes('FISCAL YEAR CONCERNED')) {
                    const [_, value] = rowText.split(':');
                    metadata.fiscalYear = value ? value.trim() : '';
                    headers.push(rowText);
                }
                else if (rowText.includes('CURRENCY USED')) {
                    const [_, value] = rowText.split(':');
                    metadata.currency = value ? value.trim() : '';
                    headers.push(rowText);
                }
            }

            // Find data start row
            const dataStartRow = rawData.findIndex(row => 
                Array.isArray(row) && String(row[0] || '').trim() === 'Tax jurisdiction');

            if (dataStartRow === -1) {
                return { headers, metadata, jurisdictions: [] };
            }

            // Process jurisdictions data
            const jurisdictions = rawData.slice(dataStartRow + 1)
                .filter(row => Array.isArray(row) && row[0])
                .map(row => ({
                    taxJurisdiction: String(row[0] || '').trim(),
                    unrelatedRevenue: this.parseNumber(row[1]),
                    relatedRevenue: this.parseNumber(row[2]),
                    totalRevenue: this.parseNumber(row[3]),
                    profitLoss: this.parseNumber(row[4]),
                    taxPaid: this.parseNumber(row[5]),
                    taxAccrued: this.parseNumber(row[6]),
                    capital: this.parseNumber(row[7]),
                    earnings: this.parseNumber(row[8]),
                    employees: this.parseNumber(row[9]),
                    tangibleAssets: this.parseNumber(row[10])
                }));

            return { headers, metadata, jurisdictions };

        } catch (error) {
            console.error('Error processing Table 1:', error);
            return { headers: [], metadata: {}, jurisdictions: [] };
        }
    }

    static processTable2(sheet) {
        if (!sheet) {
            console.error('Table 2 sheet not found');
            return { headers: [], metadata: {}, entities: [] };
        }
    
        try {
            const rawData = xlsx.utils.sheet_to_json(sheet, { 
                header: 1,
                raw: true,
                defval: '',
                blankrows: false
            });
    
            // Capture headers
            const headers = [];
            let metadata = {
                tableTitle: '',
                mneGroup: '',
                fiscalYear: ''
            };
    
            for (let i = 0; i < rawData.length; i++) {
                const row = rawData[i];
                if (!Array.isArray(row)) continue;
                
                const rowText = row.map(cell => String(cell || '')).join(' ').trim();
                
                if (rowText.includes('Table 2')) {
                    metadata.tableTitle = rowText;
                    headers.push(rowText);
                }
                else if (rowText.includes('NAME OF THE MNE GROUP')) {
                    const [_, value] = rowText.split(':');
                    metadata.mneGroup = value ? value.trim() : '';
                    headers.push(rowText);
                }
                else if (rowText.includes('FISCAL YEAR CONCERNED')) {
                    const [_, value] = rowText.split(':');
                    metadata.fiscalYear = value ? value.trim() : '';
                    headers.push(rowText);
                }
            }
    
            // Find the header rows
            const mainHeaderRow = rawData.findIndex(row => 
                Array.isArray(row) && 
                String(row[0] || '').trim() === 'Tax Jurisdiction' &&
                String(row[1] || '').includes('Constituent Entities'));
    
            if (mainHeaderRow === -1) {
                return { headers, metadata, entities: [] };
            }
    
            // Get activity names from the row before the data starts (these are the specific activities)
            const activityRow = mainHeaderRow + 1;
            const activityHeaders = [];
            
            // Start from index 3 to skip the first three columns
            for (let i = 3; i < rawData[activityRow].length; i++) {
                const activityName = String(rawData[activityRow][i] || '').trim();
                if (activityName) {
                    activityHeaders.push({ index: i, name: activityName });
                }
            }
    
            // Process entities data starting after the activity names row
            const entities = [];
            for (let i = activityRow + 1; i < rawData.length; i++) {
                const row = rawData[i];
                if (!Array.isArray(row) || !row[0]) continue;
    
                const activities = [];
                activityHeaders.forEach(header => {
                    if (row[header.index] === 'X') {
                        activities.push(header.name);
                    }
                });
    
                if (String(row[0]).trim()) {
                    entities.push({
                        taxJurisdiction: String(row[0]).trim(),
                        entityName: String(row[1] || '').trim(),
                        activities
                    });
                }
            }
    
            return { headers, metadata, entities };
    
        } catch (error) {
            console.error('Error processing Table 2:', error);
            return { headers: [], metadata: {}, entities: [] };
        }
    }

    static processTable3(sheet) {
        if (!sheet) {
            console.error('Table 3 sheet not found');
            return { headers: [], metadata: {}, additionalInfo: [] };
        }

        try {
            const rawData = xlsx.utils.sheet_to_json(sheet, { 
                header: 1,
                raw: true,
                defval: '',
                blankrows: false
            });

            // Capture headers
            const headers = [];
            let metadata = {
                tableTitle: '',
                mneGroup: '',
                fiscalYear: ''
            };

            for (let i = 0; i < rawData.length; i++) {
                const row = rawData[i];
                if (!Array.isArray(row)) continue;
                
                const rowText = row.map(cell => String(cell || '')).join(' ').trim();
                
                if (rowText.includes('TABLE 3')) {
                    metadata.tableTitle = rowText;
                    headers.push(rowText);
                }
                else if (rowText.includes('NAME OF THE MNE GROUP')) {
                    const [_, value] = rowText.split(':');
                    metadata.mneGroup = value ? value.trim() : '';
                    headers.push(rowText);
                }
                else if (rowText.includes('FISCAL YEAR CONCERNED')) {
                    const [_, value] = rowText.split(':');
                    metadata.fiscalYear = value ? value.trim() : '';
                    headers.push(rowText);
                }
            }

            // Find data header row
            const headerRow = rawData.findIndex(row => 
                Array.isArray(row) && row[0] === 'S/N' && row[1] === 'Description');

            if (headerRow === -1) {
                return { headers, metadata, additionalInfo: [] };
            }

            // Process additional info
            const additionalInfo = rawData.slice(headerRow + 1)
                .filter(row => Array.isArray(row) && (row[0] || row[1]))
                .map(row => ({
                    sn: String(row[0] || '').trim(),
                    description: String(row[1] || '').trim()
                }));

            return { headers, metadata, additionalInfo };

        } catch (error) {
            console.error('Error processing Table 3:', error);
            return { headers: [], metadata: {}, additionalInfo: [] };
        }
    }

    static parseNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        if (typeof value === 'number') return Math.round(value);
        const numStr = String(value).replace(/[^0-9.-]/g, '');
        return Math.round(Number(numStr)) || 0;
    }
}

module.exports = { ExcelProcessor };