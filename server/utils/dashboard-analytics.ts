import XLSX from 'xlsx';
import { storage } from '../storage';

// Color palette for charts
export const CHART_COLORS = [
  '#D4AF37', '#FFD700', '#F0E68C', '#BDB76B', '#DAA520',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export interface DashboardData {
  // User Analytics
  userStats: {
    totalUsers: number;
    usersToday: number;
    usersThisWeek: number;
    usersThisMonth: number;
    userGrowthRate: number;
  };
  
  // Booking Analytics
  bookingStats: {
    totalBookings: number;
    bookingsToday: number;
    bookingsThisWeek: number;
    bookingsThisMonth: number;
    totalRevenue: number;
    averageBookingValue: number;
    popularServices: Array<{name: string, count: number}>;
  };
  
  // Message Analytics
  messageStats: {
    totalMessages: number;
    messagesToday: number;
    messagesThisWeek: number;
    messagesThisMonth: number;
    conversionRate: number;
  };
  
  // Time-based Charts Data
  timeSeriesData: {
    userRegistrations: Array<{date: string, count: number}>;
    bookings: Array<{date: string, count: number, revenue?: number}>;
    messages: Array<{date: string, count: number}>;
  };
  
  // Category/Pie Chart Data
  categoryData: {
    serviceCategories: Array<{name: string, value: number}>;
    bookingStatus: Array<{name: string, value: number}>;
    messageSources: Array<{name: string, value: number}>;
  };
}

export async function readExcelFile(filePath: string) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    console.error(`Error reading Excel file ${filePath}:`, error);
    return [];
  }
}

export function parseDate(dateString: any): Date {
  if (!dateString) return new Date();
  
  // Handle cases where dateString is not a string
  if (typeof dateString !== 'string') {
    if (dateString instanceof Date) {
      return dateString;
    }
    if (typeof dateString === 'number') {
      return new Date(dateString);
    }
    // Convert to string and try again
    dateString = String(dateString);
  }
  
  // Handle different date formats from Excel
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2}):(\d{2})\s*(am|pm)$/i,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2}):(\d{2})$/i,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})$/i,
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  ];
  
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      let year: string | number = new Date().getFullYear(), month: string | number = 1, day: string | number = 1;
      let hourStr = "0", minuteStr = "0", secondStr = "0", period: string | undefined;
      let hourNum = 0, minuteNum = 0, secondNum = 0;
      
      if (format === formats[0]) {
        // DD/MM/YYYY format with time, seconds, and AM/PM
        [, day, month, year, hourStr, minuteStr, secondStr, period] = match;
        const isPM = period?.toLowerCase() === 'pm';
        hourNum = parseInt(hourStr, 10);
        hourNum = hourNum + (isPM && hourStr !== '12' ? 12 : 0);
        if (isPM && hourStr === '12') hourNum = 12;
        if (!isPM && hourStr === '12') hourNum = 0;
        minuteNum = parseInt(minuteStr, 10);
        secondNum = parseInt(secondStr, 10);
      } else if (format === formats[1]) {
        // DD/MM/YYYY format with time (no seconds) and AM/PM
        [, day, month, year, hourStr, minuteStr, period] = match;
        const isPM = period?.toLowerCase() === 'pm';
        hourNum = parseInt(hourStr, 10);
        hourNum = hourNum + (isPM && hourStr !== '12' ? 12 : 0);
        if (isPM && hourStr === '12') hourNum = 12;
        if (!isPM && hourStr === '12') hourNum = 0;
        minuteNum = parseInt(minuteStr, 10);
        secondNum = 0;
      } else if (format === formats[2]) {
        // DD/MM/YYYY format with time and seconds (24-hour format)
        [, day, month, year, hourStr, minuteStr, secondStr] = match;
        hourNum = parseInt(hourStr, 10);
        minuteNum = parseInt(minuteStr, 10);
        secondNum = parseInt(secondStr, 10);
      } else if (format === formats[3]) {
        // DD/MM/YYYY format with time (24-hour format)
        [, day, month, year, hourStr, minuteStr] = match;
        hourNum = parseInt(hourStr, 10);
        minuteNum = parseInt(minuteStr, 10);
        secondNum = 0;
      } else if (format === formats[4]) {
        // ISO format
        [, year, month, day, hourStr, minuteStr, secondStr] = match;
        hourNum = parseInt(hourStr, 10);
        minuteNum = parseInt(minuteStr, 10);
        secondNum = parseInt(secondStr, 10);
      } else if (format === formats[5]) {
        // DD/MM/YYYY format (date only)
        [, day, month, year] = match;
      }
      
      return new Date(parseInt(String(year), 10), parseInt(String(month), 10) - 1, parseInt(String(day), 10), 
                     hourNum, minuteNum, secondNum);
    }
  }
  
  // Fallback to Date constructor
  return new Date(dateString);
}

export function filterDataByDateRange(data: any[], timeRange: string, dateField: string = 'Submission Date') {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      return data; // Return all data for 'all'
  }

  return data.filter(item => {
    const itemDate = parseDate(item[dateField]);
    return itemDate >= startDate && itemDate <= now;
  });
}

export async function processDashboardData(timeRange: string = 'all'): Promise<DashboardData> {
  try {
    console.log(`📊 Processing dashboard data for timeRange: ${timeRange}`);
    
    // Get bookings from database (not Excel) to access status
    const allBookings = await storage.getAllBookings();
    
    // Read Excel files for messages (bookings now come from database)
    const messagesData = await readExcelFile('data/contact-messages.xlsx');
    
    // Convert database bookings to Excel format for compatibility
    const bookingsData = allBookings.map((booking: any) => ({
      'Booking ID': booking.id,
      'Name': 'N/A',
      'Date': booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString('en-IN') : 'N/A',
      'Time': booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      'Services': 'N/A',
      'Total Amount': booking.totalAmount || 0,
      'Status': booking.status || 'pending',
      'Timestamp': booking.createdAt ? new Date(booking.createdAt).toISOString() : new Date().toISOString(),
      'Notes': booking.notes || ''
    }));
    
    console.log(`📈 Found ${allBookings.length} bookings from database and ${messagesData.length} messages from Excel files`);
    
    // Get user data from storage
    const allUsers = await storage.getAllUsers();
    console.log(`👥 Found ${allUsers.length} users in storage`);
    
    // Filter data by time range
    const filteredBookings = filterDataByDateRange(bookingsData, timeRange, 'Timestamp');
    const filteredMessages = filterDataByDateRange(messagesData, timeRange, 'Submission Date');
    const filteredUsers = allUsers.filter(user => {
      const userDate = new Date(user.createdAt || Date.now());
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          return true;
      }
      
      return userDate >= startDate && userDate <= now;
    });

    // Calculate user statistics
    console.log(`👥 Calculating user statistics...`);
    let userStats;
    try {
      userStats = {
        totalUsers: allUsers.length,
        usersToday: filterDataByDateRange(allUsers, 'today', 'createdAt').length,
        usersThisWeek: filterDataByDateRange(allUsers, 'week', 'createdAt').length,
        usersThisMonth: filterDataByDateRange(allUsers, 'month', 'createdAt').length,
        userGrowthRate: calculateGrowthRate(allUsers, 'createdAt')
      };
      console.log(`👥 User stats calculated successfully:`, userStats);
    } catch (error) {
      console.error(`❌ Error calculating user stats:`, (error as any).message);
      userStats = { totalUsers: allUsers.length, usersToday: 0, usersThisWeek: 0, usersThisMonth: 0, userGrowthRate: 0 };
    }

    // Calculate booking statistics
    console.log(`💰 Calculating booking statistics...`);
    let bookingStats;
    try {
      // Filter to only confirmed bookings for revenue calculation
      const confirmedBookings = filteredBookings.filter((booking: any) => {
        const status = booking['Status'] || booking.status || 'pending';
        return status === 'confirmed';
      });
      
      const totalRevenue = confirmedBookings.reduce((sum, booking) => {
        const amount = parseInt(booking['Total Amount'] || booking.totalAmount) || 0;
        return sum + amount;
      }, 0);
      console.log(`💰 Total revenue calculated from ${confirmedBookings.length} confirmed bookings: ₹${totalRevenue}`);

      // Get service names for popular services from confirmed bookings
      // Map confirmed bookings back to original database bookings to get serviceIds
      const confirmedBookingsFromDb = allBookings.filter((booking: any) => {
        const status = booking.status || 'pending';
        return status === 'confirmed';
      });
      
      const allServices = await storage.getServices();
      const confirmedBookingsWithServices = confirmedBookingsFromDb.map((booking: any) => {
        // Get service names from serviceIds
        const serviceIds = Array.isArray(booking.serviceIds) ? booking.serviceIds : [];
        const serviceNames: string[] = [];
        for (const serviceId of serviceIds) {
          const service = allServices.find((s: any) => s.id === serviceId);
          if (service) {
            serviceNames.push(service.name);
          }
        }
        // Fallback to Services field if serviceIds not available
        const services = serviceNames.length > 0 
          ? serviceNames.join(', ')
          : (booking['Services'] || 'N/A');
        return {
          'Services': services,
          'Total Amount': booking.totalAmount || 0
        };
      });
      
      const popularServices = getPopularServices(confirmedBookingsWithServices);
      console.log(`⭐ Popular services found:`, popularServices);

      bookingStats = {
        totalBookings: filteredBookings.length,
        confirmedBookings: confirmedBookings.length,
        bookingsToday: filterDataByDateRange(bookingsData, 'today', 'Timestamp').length,
        bookingsThisWeek: filterDataByDateRange(bookingsData, 'week', 'Timestamp').length,
        bookingsThisMonth: filterDataByDateRange(bookingsData, 'month', 'Timestamp').length,
        totalRevenue,
        averageBookingValue: confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0,
        popularServices: getPopularServices(confirmedBookings)
      };
      console.log(`💰 Booking stats calculated successfully`);
    } catch (error) {
      console.error(`❌ Error calculating booking stats:`, (error as any).message);
      bookingStats = { totalBookings: bookingsData.length, bookingsToday: 0, bookingsThisWeek: 0, bookingsThisMonth: 0, totalRevenue: 0, averageBookingValue: 0, popularServices: [] };
    }

    // Calculate message statistics
    console.log(`📧 Calculating message statistics...`);
    let messageStats;
    try {
      messageStats = {
        totalMessages: filteredMessages.length,
        messagesToday: filterDataByDateRange(messagesData, 'today', 'Submission Date').length,
        messagesThisWeek: filterDataByDateRange(messagesData, 'week', 'Submission Date').length,
        messagesThisMonth: filterDataByDateRange(messagesData, 'month', 'Submission Date').length,
        conversionRate: filteredMessages.length > 0 ? 
          (filteredBookings.length / filteredMessages.length) * 100 : 0
      };
      console.log(`📧 Message stats calculated successfully`);
    } catch (error) {
      console.error(`❌ Error calculating message stats:`, (error as any).message);
      messageStats = { totalMessages: messagesData.length, messagesToday: 0, messagesThisWeek: 0, messagesThisMonth: 0, conversionRate: 0 };
    }

    // Generate time series data
    console.log(`📈 Generating time series data...`);
    let timeSeriesData;
    try {
      timeSeriesData = {
        userRegistrations: generateTimeSeries(allUsers, 'createdAt', 'count'),
        bookings: generateTimeSeries(filteredBookings, 'Timestamp', 'count', 'Total Amount'),
        messages: generateTimeSeries(filteredMessages, 'Submission Date', 'count')
      };
      console.log(`📈 Time series data generated successfully`);
    } catch (error) {
      console.error(`❌ Error generating time series:`, (error as any).message);
      timeSeriesData = { userRegistrations: [], bookings: [], messages: [] };
    }

    // Generate category data
    console.log(`🏷️ Generating category data...`);
    let categoryData;
    try {
      categoryData = {
        serviceCategories: await getServiceCategories(filteredBookings),
        bookingStatus: getBookingStatus(filteredBookings),
        messageSources: getMessageSources(filteredMessages)
      };
      console.log(`🏷️ Category data generated successfully`);
    } catch (error) {
      console.error(`❌ Error generating category data:`, (error as any).message);
      categoryData = { serviceCategories: [], bookingStatus: [], messageSources: [] };
    }

    const result = {
      userStats,
      bookingStats,
      messageStats,
      timeSeriesData,
      categoryData
    };

    console.log(`✅ Dashboard data processed successfully for ${timeRange}`);
    console.log(`📊 Results: ${result.bookingStats.totalBookings} bookings, ${result.messageStats.totalMessages} messages, ₹${result.bookingStats.totalRevenue} revenue`);
    return result;

  } catch (error) {
    console.error('❌ Error processing dashboard data:', error);
    console.error('Error message:', (error as any).message);
    console.error('Error stack:', (error as any).stack);
    
    // Return basic structure even if processing fails
    const fallbackData = {
      userStats: { totalUsers: 0, usersToday: 0, usersThisWeek: 0, usersThisMonth: 0, userGrowthRate: 0 },
      bookingStats: { totalBookings: 0, bookingsToday: 0, bookingsThisWeek: 0, bookingsThisMonth: 0, totalRevenue: 0, averageBookingValue: 0, popularServices: [] },
      messageStats: { totalMessages: 0, messagesToday: 0, messagesThisWeek: 0, messagesThisMonth: 0, conversionRate: 0 },
      timeSeriesData: { userRegistrations: [], bookings: [], messages: [] },
      categoryData: { serviceCategories: [], bookingStatus: [], messageSources: [] }
    };
    
    console.log('🔄 Returning fallback data due to error');
    return fallbackData;
  }
}

function calculateGrowthRate(data: any[], dateField: string): number {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const lastMonthCount = data.filter(item => {
    const date = new Date(item[dateField]);
    return date >= lastMonth && date < thisMonth;
  }).length;
  
  const thisMonthCount = data.filter(item => {
    const date = new Date(item[dateField]);
    return date >= thisMonth;
  }).length;
  
  if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
  return ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
}

function getPopularServices(bookingsData: any[]): Array<{name: string, count: number}> {
  const serviceCounts: {[key: string]: number} = {};
  
  bookingsData.forEach(booking => {
    const service = booking['Services'] || booking['Service Name'];
    if (service) {
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    }
  });
  
  return Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function generateTimeSeries(data: any[], dateField: string, valueField: string, revenueField?: string): Array<{date: string, count: number, revenue?: number}> {
  try {
    console.log(`📈 Generating time series for ${data.length} items with dateField: ${dateField}`);
    
    if (data.length === 0) {
      console.log(`📈 No data to process for time series`);
      return [];
    }
    
    const groupedData: {[key: string]: {count: number, revenue: number}} = {};
    
    data.forEach((item, index) => {
      try {
        const dateValue = item[dateField];
        if (!dateValue) {
          console.log(`📈 Item ${index} has no date field: ${dateField}`);
          return;
        }
        
        const date = parseDate(dateValue);
        if (isNaN(date.getTime())) {
          console.log(`📈 Item ${index} has invalid date: ${dateValue} (type: ${typeof dateValue})`);
          return;
        }
        
        const dateKey = date.toISOString().split('T')[0];
        
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { count: 0, revenue: 0 };
        }
        
        groupedData[dateKey].count += 1;
        if (revenueField && item[revenueField]) {
          groupedData[dateKey].revenue += parseInt(item[revenueField]) || 0;
        }
        
        // Debug successful parsing for messages
        if (dateField === 'Submission Date' && index < 3) {
          console.log(`📈 Message ${index}: ${dateValue} -> ${dateKey}`);
        }
      } catch (itemError) {
        console.log(`📈 Error processing item ${index}:`, (itemError as any).message);
      }
    });
    
    const result = Object.entries(groupedData)
      .map(([date, data]) => ({
        date,
        count: data.count,
        ...(revenueField && { revenue: data.revenue })
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`📈 Generated ${result.length} time series data points`);
    return result;
  } catch (error) {
    console.error(`📈 Error in generateTimeSeries:`, (error as any).message);
    return [];
  }
}

async function getServiceCategories(bookingsData: any[]): Promise<Array<{name: string, value: number}>> {
  // Initialize a count map with ALL active services so each one appears
  const allServices = await storage.getServices();
  const serviceCounts: {[key: string]: number} = {};
  allServices.forEach(svc => { serviceCounts[svc.name] = 0; });

  // Count each individual service (split by comma), not coarse categories
  bookingsData.forEach(booking => {
    const servicesCell = booking['Services'] || booking['Service Name'] || '';
    const items = String(servicesCell)
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (items.length === 0) {
      serviceCounts['Other'] = (serviceCounts['Other'] || 0) + 1;
    } else {
      items.forEach((svc: string) => {
        serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
      });
    }
  });

  return Object.entries(serviceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getBookingStatus(bookingsData: any[]): Array<{name: string, value: number}> {
  const statusCounts: {[key: string]: number} = {};
  
  bookingsData.forEach(booking => {
    // Since we don't have status in Excel, we'll categorize by date
    const bookingDate = parseDate(booking['Timestamp'] || booking['Date']);
    const now = new Date();
    const daysDiff = Math.ceil((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let status = 'Pending';
    if (daysDiff < 0) status = 'Upcoming';
    else if (daysDiff === 0) status = 'Today';
    else if (daysDiff <= 7) status = 'Recent';
    else status = 'Completed';
    
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  return Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }));
}

function getMessageSources(messagesData: any[]): Array<{name: string, value: number}> {
  const sourceCounts: {[key: string]: number} = {};
  
  messagesData.forEach(message => {
    const source = message['Service Interest'] || message['Source'] || 'Contact Form';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  
  return Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
