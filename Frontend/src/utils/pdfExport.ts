import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Account, Transaction } from '../types';

export const exportAccountsToPDF = async (accounts: Account[]) => {
  const pdf = new jsPDF();
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Accounts Report', 20, 30);
  
  // Date
  pdf.setFontSize(10);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
  
  // Table headers
  pdf.setFontSize(12);
  let y = 60;
  pdf.text('Account Name', 20, y);
  pdf.text('Type', 80, y);
  pdf.text('Balance', 140, y);
  
  // Line under headers
  pdf.line(20, y + 2, 180, y + 2);
  y += 10;
  
  // Account data
  pdf.setFontSize(10);
  let totalBalance = 0;
  
  accounts.forEach((account) => {
    if (y > 270) { // New page if needed
      pdf.addPage();
      y = 30;
    }
    
    pdf.text(account.name, 20, y);
    pdf.text(account.accountCategoryName, 80, y);
    
    const balanceColor = account.balance >= 0 ? [0, 128, 0] : [255, 0, 0];
    pdf.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    pdf.text(`$${account.balance.toFixed(2)}`, 140, y);
    pdf.setTextColor(0, 0, 0); // Reset to black
    
    totalBalance += account.balance;
    y += 8;
  });
  
  // Total
  y += 10;
  pdf.line(20, y, 180, y);
  y += 8;
  pdf.setFontSize(12);
  pdf.text('Total Balance:', 80, y);
  
  const totalColor = totalBalance >= 0 ? [0, 128, 0] : [255, 0, 0];
  pdf.setTextColor(totalColor[0], totalColor[1], totalColor[2]);
  pdf.text(`$${totalBalance.toFixed(2)}`, 140, y);
  
  // Save the PDF
  pdf.save(`accounts-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportTransactionsToPDF = async (transactions: Transaction[], accountFilter?: string) => {
  const pdf = new jsPDF();
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Transactions Report', 20, 30);
  
  // Subtitle if filtered
  if (accountFilter) {
    pdf.setFontSize(12);
    pdf.text(`Account: ${accountFilter}`, 20, 40);
  }
  
  // Date
  pdf.setFontSize(10);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, accountFilter ? 50 : 40);
  
  // Table headers
  pdf.setFontSize(10);
  let y = accountFilter ? 70 : 60;
  pdf.text('Date', 20, y);
  pdf.text('Description', 45, y);
  pdf.text('Category', 90, y);
  pdf.text('Account', 125, y);
  pdf.text('Amount', 160, y);
  
  // Line under headers
  pdf.line(20, y + 2, 190, y + 2);
  y += 8;
  
  // Transaction data
  let totalCredit = 0;
  let totalDebit = 0;
  
  transactions.forEach((transaction) => {
    if (y > 270) { // New page if needed
      pdf.addPage();
      y = 30;
    }
    
    // Format date
    const date = new Date(transaction.transactionDateTime).toLocaleDateString();
    pdf.text(date, 20, y);
    
    // Description (truncate if too long)
    const description = (transaction.description || transaction.transactionCategoryName).substring(0, 15);
    pdf.text(description, 45, y);
    
    // Category (truncate if too long)
    const category = transaction.transactionCategoryName.substring(0, 12);
    pdf.text(category, 90, y);
    
    // Account (truncate if too long)
    const account = transaction.accountName.substring(0, 12);
    pdf.text(account, 125, y);
    
    // Amount with color
    const isCredit = transaction.transactionType === 'C';
    const amountColor = isCredit ? [0, 128, 0] : [255, 0, 0];
    pdf.setTextColor(amountColor[0], amountColor[1], amountColor[2]);
    pdf.text(`${isCredit ? '+' : '-'}$${transaction.amount.toFixed(2)}`, 160, y);
    pdf.setTextColor(0, 0, 0); // Reset to black
    
    if (isCredit) {
      totalCredit += transaction.amount;
    } else {
      totalDebit += transaction.amount;
    }
    
    y += 6;
  });
  
  // Summary
  y += 10;
  pdf.line(20, y, 190, y);
  y += 8;
  pdf.setFontSize(10);
  
  pdf.setTextColor(0, 128, 0);
  pdf.text(`Total Credits: +$${totalCredit.toFixed(2)}`, 20, y);
  
  pdf.setTextColor(255, 0, 0);
  pdf.text(`Total Debits: -$${totalDebit.toFixed(2)}`, 100, y);
  
  y += 8;
  pdf.setTextColor(0, 0, 0);
  const netAmount = totalCredit - totalDebit;
  const netColor = netAmount >= 0 ? [0, 128, 0] : [255, 0, 0];
  pdf.setTextColor(netColor[0], netColor[1], netColor[2]);
  pdf.text(`Net Amount: ${netAmount >= 0 ? '+' : ''}$${netAmount.toFixed(2)}`, 20, y);
  
  // Save the PDF
  const filterSuffix = accountFilter ? `-${accountFilter.replace(/\s+/g, '-').toLowerCase()}` : '';
  pdf.save(`transactions-report${filterSuffix}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportElementToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
