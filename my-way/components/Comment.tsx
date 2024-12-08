import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createComment, getCommentsByStep } from '@/Service/Comments.Service';

import { LinearGradient } from 'expo-linear-gradient';

interface CommentData {
  id: number;
  comment: string;
  createdAt: string;
  userId: number;
  user: {
    firstName: string;
    lastName: string;
    pic?: string; 
  };
}

interface CommentsProps {
  stepId: number | null;
  isVisible: boolean;
  onClose: () => void;
}

const Comments: React.FC<CommentsProps> = ({ stepId, isVisible, onClose }) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); 


  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id ? parseInt(id) : null);
    };
    fetchUserId();
  }, []);

  const fetchComments = async () => {
    if (!stepId) return;
    setLoading(true);
    setFetchError(false);

    try {
      const fetchedComments = await getCommentsByStep(stepId);

      if (Array.isArray(fetchedComments)) {
        setComments(fetchedComments.map((comment) => ({
          ...comment,
          user: { ...comment.user, pic: null },
        })));
      } else {
        setComments([]);
        console.error('Fetched comments is not an array:', fetchedComments);
      }
    } catch (error) {
      setFetchError(true);
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (isVisible && stepId) {
      fetchComments();
    }
  }, [stepId, isVisible]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !stepId || userId === null) return; 
    try {
      await createComment({
        userId: userId,
        stepId: stepId,
        comment: newComment,
      });

      setNewComment('');
      fetchComments(); 
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#faae7b','#c06c84' ]}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Commentaires</Text>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : fetchError ? (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle-outline" size={40} color="#FFFFFF" />
              <Text style={styles.messageText}>Erreur de chargement des commentaires</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="chatbubble-outline" size={40} color="#FFFFFF" />
              <Text style={styles.messageText}>Aucun commentaire pour cette étape</Text>
            </View>
          ) : (
            <ScrollView style={styles.commentsList}>
              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.userAvatar}>
                    {comment.user?.pic ? (
                      <Image source={{ uri: comment.user.pic }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>
                        {comment.user?.firstName.charAt(0)}
                        {comment.user?.lastName.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={styles.userName}>
                      {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Utilisateur inconnu'}
                    </Text>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Écrire un commentaire..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handlePostComment}
            >
              <Ionicons name="send" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    opacity: 0.8,
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
});

export default Comments;