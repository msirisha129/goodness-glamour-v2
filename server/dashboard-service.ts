import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export function readBookingsExcel() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'bookings.xlsx');
    
    if (!fs.existsSync(filePath)) {
      console.log('Bookings file not found');
      return [];
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data;
  } catch (error) {
    console.error('Error reading bookings Excel:', error);
    return [];
  }
}

export function readContactMessagesExcel() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'contact-messages.xlsx');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ Contact messages file not found at:', filePath);
      return [];
    }
    
    console.log('✅ Reading contact messages from:', filePath);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log('📄 Sheet name:', sheetName);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log('📊 Contact messages found:', data.length);
    console.log('📋 Sample data:', data[0]);
    
    return data;
  } catch (error) {
    console.error('❌ Error reading messages Excel:', error);
    return [];
  }
}

export function filterByTimeRange(data: any[], timeRange: string) {
  const now = new Date();
  console.log(`🔍 Filtering data for timeRange: ${timeRange}, Current date: ${now.toDateString()}`);
  
  return data.filter((item: any) => {
    // Handle different column names from different Excel files
    const timestampStr = item.Timestamp || item['Submission Date'] || item.Date || '';
    console.log(`📅 Processing item with date: "${timestampStr}"`);
    
    if (!timestampStr) {
      console.log('⚠️ No timestamp found, including in "all" view');
      return timeRange === 'all'; // Only include in "all" view if no timestamp
    }
    
    // Parse date - handle different formats
    let itemDate: Date;
    
    if (timestampStr.includes(',')) {
      // Format: "10/10/2025, 01:37 pm" or similar
      const [datePart, timePart] = timestampStr.split(', ');
      itemDate = new Date(datePart);
    } else if (timestampStr.includes('T')) {
      // ISO format: "2025-01-10T10:30:00.000Z"
      itemDate = new Date(timestampStr);
    } else {
      // Try direct parsing
      itemDate = new Date(timestampStr);
    }
    
    // Check if date is valid
    if (isNaN(itemDate.getTime())) {
      console.log('⚠️ Invalid date format:', timestampStr);
      return timeRange === 'all'; // Only include in "all" view if date is invalid
    }
    
    console.log(`📅 Parsed date: ${itemDate.toDateString()}`);
    
    switch (timeRange) {
      case 'today':
        const isToday = itemDate.toDateString() === now.toDateString();
        console.log(`📅 Is today? ${isToday} (${itemDate.toDateString()} vs ${now.toDateString()})`);
        return isToday;
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const isThisWeek = itemDate >= weekAgo;
        console.log(`📅 Is this week? ${isThisWeek} (${itemDate.toDateString()} >= ${weekAgo.toDateString()})`);
        return isThisWeek;
      
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const isThisMonth = itemDate >= monthAgo;
        console.log(`📅 Is this month? ${isThisMonth} (${itemDate.toDateString()} >= ${monthAgo.toDateString()})`);
        return isThisMonth;
      
      case 'all':
      default:
        console.log(`📅 Including in "all" view`);
        return true;
    }
  });
}

export function calculateTotalRevenue(bookings: any[]) {
  return bookings.reduce((sum, booking) => {
    const amount = parseFloat(booking['Total Amount']) || 0;
    return sum + amount;
  }, 0);
}

export function getPopularServices(bookings: any[]) {
  const serviceCounts: { [key: string]: number } = {};
  
  bookings.forEach((booking) => {
    const services = booking.Services?.split(',') || [];
    services.forEach((service: string) => {
      const trimmed = service.trim();
      if (trimmed) {
        serviceCounts[trimmed] = (serviceCounts[trimmed] || 0) + 1;
      }
    });
  });
  
  return Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 services
}

export function calculateAverageValue(bookings: any[]) {
  if (bookings.length === 0) return 0;
  const total = calculateTotalRevenue(bookings);
  return Math.round(total / bookings.length);
}

export function getBookingTrends(bookings: any[]) {
  const trends: { [key: string]: { bookings: number; revenue: number } } = {};
  
  bookings.forEach((booking) => {
    const date = new Date(booking.Timestamp || booking.Date);
    const dateKey = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    
    if (!trends[dateKey]) {
      trends[dateKey] = { bookings: 0, revenue: 0 };
    }
    
    trends[dateKey].bookings += 1;
    trends[dateKey].revenue += parseFloat(booking['Total Amount']) || 0;
  });
  
  return Object.entries(trends)
    .map(([date, data]) => ({
      date,
      bookings: data.bookings,
      revenue: Math.round(data.revenue),
    }))
    .slice(-7); // Last 7 days
}

