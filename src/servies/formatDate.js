const formatDate = (dateString) => {
  if (!dateString) return "now";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    const diffTime = now - date; // Remove Math.abs to handle future dates
    const diffMinutes = Math.floor(Math.abs(diffTime) / (1000 * 60));
    const diffHours = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60));
    const diffDays = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
    
    // Handle future dates
    if (diffTime < 0) {
      if (diffMinutes < 1) {
        return "In a moment";
      } else if (diffMinutes < 60) {
        return `In ${diffMinutes}m`;
      } else if (diffHours < 24) {
        return `In ${diffHours}h`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
        });
      }
    }
    
    // Handle past dates
    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1w ago" : `${weeks}w ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? "1mo ago" : `${months}mo ago`;
    } else {
      // Show full date for old messages
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return "now";
  }
};

export default formatDate;