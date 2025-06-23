export const transformDurationToMinutes = (duration) => {
    if (!duration) return 0;

    const [hours, minutes] = duration.split(".").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid duration format");
      return 0;
    }

    return hours * 60 + minutes;
  };


  export const convertMinutesToDuration = (totalMinutes) => {
    if (isNaN(totalMinutes) || totalMinutes < 0) {
      console.error("Invalid minutes");
      return "00.00";
    }
  
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
  
    return `${formattedHours}.${formattedMinutes}`;
  };

  export const convertMinutesToDurationInWords = (minutes) => {
    if (isNaN(minutes) || minutes < 0) {
      console.error("Invalid input");
      return "Invalid input";
    }
  
    const hours = Math.floor(minutes / 60);  
    const remainingMinutes = minutes % 60;  
  
  
    let duration = '';
  
    if (hours > 0) {
      duration += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  
    if (remainingMinutes > 0) {
      if (duration) duration += ' and '; 
      duration += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    }
  
    return duration || '0 minutes';
  };