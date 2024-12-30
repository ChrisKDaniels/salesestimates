"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { marketMultipliers } from './salesCalculations';

export const exportToPDF = (estimates: any, projectDetails: any) => {
  const doc = new jsPDF();
  
  // Add logo/header
  doc.setFontSize(20);
  doc.text('CINELAUNCH', 14, 15);
  doc.setFontSize(14);
  doc.text('Sales Estimates Report', 14, 25);
  
  // Project Details
  doc.setFontSize(12);
  doc.text('Project Details', 14, 35);
  doc.setFontSize(10);
  const details = [
    ['Title:', projectDetails.title],
    ['Budget:', `$${parseInt(projectDetails.budget).toLocaleString()}`],
    ['Genre:', projectDetails.genre],
    ['Director:', projectDetails.director],
    ['Cast:', projectDetails.cast.map((actor: any) => actor.name).join(', ')],
  ];
  
  (doc as any).autoTable({
    startY: 40,
    head: [],
    body: details,
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  // Market Analysis
  doc.setFontSize(12);
  doc.text('Market Analysis', 14, (doc as any).lastAutoTable.finalY + 10);

  const marketData = Object.entries(estimates.regions).map(([region, data]: [string, any]) => [
    region,
    `$${Math.round(data.totalAsk).toLocaleString()}`,
    `$${Math.round(data.totalTake).toLocaleString()}`
  ]);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['Region', 'Ask Price', 'Take Price']],
    body: marketData,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255]
    },
  });

  // Territory Breakdown
  doc.addPage();
  doc.setFontSize(12);
  doc.text('Territory Breakdown', 14, 15);

  const territoryRows: any[] = [];
  Object.entries(estimates.regions).forEach(([region, data]: [string, any]) => {
    territoryRows.push([{ content: region.toUpperCase(), colSpan: 3, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }]);
    Object.entries(data.territories).forEach(([territory, values]: [string, any]) => {
      territoryRows.push([
        territory,
        `$${values.ask.toLocaleString()}`,
        `$${values.take.toLocaleString()}`
      ]);
    });
    territoryRows.push([
      'Region Total',
      `$${Math.round(data.totalAsk).toLocaleString()}`,
      `$${Math.round(data.totalTake).toLocaleString()}`
    ]);
    territoryRows.push([{ content: '', colSpan: 3 }]); // Spacer row
  });

  (doc as any).autoTable({
    startY: 20,
    head: [['Territory', 'Ask Price', 'Take Price']],
    body: territoryRows,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255]
    },
  });

  // Worldwide Totals
  const totalRow = [
    ['TOTAL WORLDWIDE', 
     `$${estimates.total.ask.toLocaleString()}`, 
     `$${estimates.total.take.toLocaleString()}`]
  ];

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 5,
    body: totalRow,
    theme: 'striped',
    bodyStyles: {
      fillColor: [51, 65, 85],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
  });

  // Save the PDF
  doc.save(`${projectDetails.title}_Sales_Estimates.pdf`);
};