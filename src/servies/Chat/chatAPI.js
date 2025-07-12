import axios from "axios";
import api from "./../../api/API";

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: api,
  timeout: 30000,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }

    // Add content type for requests with data
    if (config.data && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Debug logging
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? '[REDACTED]' : undefined
      },
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const chatAPI = {
  async sendMessage(teamId, content, attachments = null, replyTo = null) {
    try {
      console.log('📤 Preparing message for send:', { teamId, content, attachments });

      // Validate required fields
      if (!teamId) {
        throw new Error('Team ID is required');
      }

      if (!content && !attachments?.images?.length && !attachments?.files?.length) {
        throw new Error('Message content, image, or file is required');
      }

      // Create FormData for file uploads
      const formData = new FormData();

      // Add basic fields
      formData.append('teamId', teamId.toString());
      formData.append('content', content || '');
      if (replyTo) {
        formData.append('replyTo', replyTo);
      }

      // Add images if present
      if (attachments?.images?.length > 0) {
        attachments.images.forEach((image, index) => {
          // If image is a File object, append directly
          if (image instanceof File) {
            formData.append('img', image);
          }
          // If image is a blob with additional metadata
          else if (image.file instanceof File) {
            formData.append('img', image.file);
          }
        });
      }

      // Add files if present
      if (attachments?.files?.length > 0) {
        attachments.files.forEach((file, index) => {
          // If file is a File object, append directly
          if (file instanceof File) {
            formData.append('file', file);
          }
          // If file is a blob with additional metadata
          else if (file.file instanceof File) {
            formData.append('file', file.file);
          }
        });
      }

      // Log FormData contents for debugging
      console.log('📤 FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type
          });
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await axiosInstance.post('/chat/sendMessage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add timeout for large file uploads
        timeout: 30000, // 30 seconds
      });

      console.log('✅ Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          // Don't log FormData as it's not serializable
          hasFormData: error.config?.data instanceof FormData
        }
      });

      // Enhanced error message based on response
      let errorMessage = 'Failed to send message';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Add status code to error message for debugging
      if (error.response?.status) {
        errorMessage += ` (Status: ${error.response.status})`;
      }

      throw new Error(errorMessage);
    }
  },

  // Get all messages for a team
  async getMessages(teamId) {
    try {
      console.log('📥 Fetching messages for team:', teamId);

      if (!teamId) {
        throw new Error('Team ID is required');
      }

      const response = await axiosInstance.get(`/chat/getAll/${teamId.toString()}`);

      console.log('✅ Messages fetched successfully:', {
        count: response.data?.messages?.length || 0,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch messages';
      throw new Error(errorMessage);
    }
  },
  // Reply to a specific message
  async replyToMessage(messageId, replyContent, attachments = null) {
    try {
      if (!messageId || !replyContent) {
        throw new Error('Message ID and reply content are required');
      }

      const formData = new FormData();
      formData.append('reply', replyContent);

      // Handle attachments (optional)
      if (attachments?.images?.length > 0) {
        attachments.images.forEach((img) => {
          formData.append('img', img instanceof File ? img : img.file);
        });
      }

      if (attachments?.files?.length > 0) {
        attachments.files.forEach((file) => {
          formData.append('file', file instanceof File ? file : file.file);
        });
      }

      const response = await axiosInstance.post(
        `/chat/replyToMessage/${messageId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      console.log("✅ Reply sent successfully:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ Error sending reply:", {
        error: error.message,
        response: error.response?.data,
      });

      throw new Error(error.response?.data?.message || error.message || "Failed to reply to message");
    }
  }
  ,
  // Edit a message
  async editMessage(messageId, content, img = null, file = null) {
    try {
      console.log('✏️ Editing message:', { messageId, content, img, file });

      if (!messageId) {
        throw new Error('Message ID is required');
      }

      const updateData = {};
      if (content !== undefined) updateData.content = content;
      if (img !== undefined) updateData.img = img;
      if (file !== undefined) updateData.file = file;

      const response = await axiosInstance.put(`/chat/editMessage/${messageId}`, updateData);

      console.log('✅ Message edited successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error editing message:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to edit message';
      throw new Error(errorMessage);
    }
  },

  // Delete a message
  async deleteMessage(messageId) {
    try {
      console.log('🗑️ Deleting message:', messageId);

      if (!messageId) {
        throw new Error('Message ID is required');
      }

      const response = await axiosInstance.delete(`/chat/deleteMessage/${messageId}`);

      console.log('✅ Message deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete message';
      throw new Error(errorMessage);
    }
  },

  // Check connection status
  async checkConnection() {
    try {
      const response = await axiosInstance.get('/health');
      return response.data;
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      throw error;
    }
  },

  // Test endpoint to verify API connectivity
  async testAPI() {
    try {
      console.log('🧪 Testing API connectivity...');
      const response = await axiosInstance.get('/test');
      console.log('✅ API test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API test failed:', error);
      throw error;
    }
  }

};