export const getUser = () => {
  try {
    const user = localStorage.getItem("CurrentUser");
    
  
    if (!user) {
      return null;
    }
    
    
    return JSON.parse(user);
  } catch (error) {
   
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
};

