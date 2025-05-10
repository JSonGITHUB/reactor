import { jsPDF } from 'jspdf';

const PDFReport = () => {
    const generatePDF = () => {
        const doc = new jsPDF();

        // Set title
        doc.setFontSize(20);
        doc.text('Monthly Activity Report', 20, 20);

        // Metadata
        doc.setFontSize(12);
        doc.text(`Date: April 2025`, 20, 35);
        doc.text(`Prepared by: Placeholder Name`, 20, 45);

        // Section
        doc.setFontSize(16);
        doc.text('Overview', 20, 60);

        doc.setFontSize(12);
        doc.text(
            'This is a placeholder report used for demonstrating PDF generation in React. It can include charts, tables, and structured data in production.',
            20,
            70,
            { maxWidth: 170 }
        );

        // Summary list
        doc.setFontSize(16);
        doc.text('Summary', 20, 100);

        doc.setFontSize(12);
        const summaryItems = [
            'Item 1: Description goes here.',
            'Item 2: Description goes here.',
            'Item 3: Description goes here.',
        ];

        summaryItems.forEach((item, i) => {
            doc.text(`• ${item}`, 25, 110 + i * 10);
        });

        doc.save('report.pdf');
    };

    return (
        <div className='containerBox'>
            <button
                onClick={generatePDF}
                className='containerBox'
            >
                Generate PDF
            </button>
        </div>
    );
};

export default PDFReport;