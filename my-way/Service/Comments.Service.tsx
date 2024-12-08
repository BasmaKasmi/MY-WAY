import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCommentsByStep = async (stepId: number) => {
  try {
    

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/comments/step/${stepId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const createComment = async (commentData: {
  userId: number;
  stepId: number;
  comment: string;
}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const url = `${process.env.EXPO_PUBLIC_API_URL}/comments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error creating comment: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Detailed create comment error:', error);
    throw error;
  }
};
export const getCommentById = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/comments/${id}`, {
      headers: {
        
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching comment by ID: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch comment');
  }
};


export const updateComment = async (id: number, commentData: any) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error(`Error updating comment: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update comment');
  }
};
export const deleteComment = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting comment: ${response.status}`);
    }

    return true; 
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete comment');
  }
};
