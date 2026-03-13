
export const generateGoogleCalendarUrl = ({ title, description, location, startTime, endTime }) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('Invalid dates provided to calendar utility:', { startTime, endTime });
    return '#';
  }

  const format = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');
  const start = format(startDate);
  const end = format(endDate);
  
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&dates=${start}/${end}`;
};

export const downloadIcsFile = ({ title, description, location, startTime, endTime }) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('Invalid dates provided to calendar utility:', { startTime, endTime });
    return;
  }

  const format = (d) => d.toISOString().replace(/-|:|\.\d+/g, '') + 'Z';
  const start = format(startDate);
  const end = format(endDate);
  
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'event.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
