"use client";

import ExcelJS from 'exceljs';

export const exportToExcel = async (estimates, projectDetails) => {
  const workbook = new ExcelJS.Workbook();
  
  // Add Summary worksheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Style for headers
  const headerStyle = {
    font: { bold: true, size: 12 },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' }
    }
  };

  // Project Details
  summarySheet.addRow(['Project Details']).font = { bold: true, size: 14 };
  summarySheet.addRow(['Title', projectDetails.title]);
  summarySheet.addRow(['Budget', `$${parseInt(projectDetails.budget).toLocaleString()}`]);
  summarySheet.addRow(['Genre', projectDetails.genre]);
  summarySheet.addRow(['Director', projectDetails.director]);
  summarySheet.addRow(['Cast', projectDetails.cast.map(actor => actor.name).join(', ')]);
  summarySheet.addRow([]);

  // Worldwide Totals
  summarySheet.addRow(['Worldwide Totals']).font = { bold: true, size: 14 };
  summarySheet.addRow(['Total Ask', `$${estimates.total.ask.toLocaleString()}`]);
  summarySheet.addRow(['Total Take', `$${estimates.total.take.toLocaleString()}`]);

  // Territory Breakdown worksheet
  const territorySheet = workbook.addWorksheet('Territory Breakdown');
  
  // Add headers
  territorySheet.addRow(['Territory', 'Ask Price', 'Take Price']);
  territorySheet.getRow(1).font = { bold: true };

  // Add territory data
  Object.entries(estimates.regions).forEach(([region, data]) => {
    // Add region header
    territorySheet.addRow([region.toUpperCase()]).font = { bold: true };
    
    // Add territory details
    Object.entries(data.territories).forEach(([territory, values]) => {
      territorySheet.addRow([
        territory,
        `$${values.ask.toLocaleString()}`,
        `$${values.take.toLocaleString()}`
      ]);
    });
    
    // Add region total
    territorySheet.addRow([
      'Region Total',
      `$${Math.round(data.totalAsk).toLocaleString()}`,
      `$${Math.round(data.totalTake).toLocaleString()}`
    ]).font = { bold: true };
    
    territorySheet.addRow([]); // Empty row between regions
  });

  // Auto-size columns
  territorySheet.columns.forEach(column => {
    column.width = 20;
  });

  // Generate the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectDetails.title}_Sales_Estimates.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};