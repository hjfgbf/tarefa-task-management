import { useState, useRef } from 'react';
import { Comment } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Edit3, Trash2, Save, X, Paperclip, FileText, Image as ImageIcon, Plus } from 'lucide-react';

interface CommentEditorProps {
  comment: Comment;
  onCommentUpdated: (updatedComment: Comment) => void;
  onCommentDeleted: (commentId: number) => void;
  showActions?: boolean;
}

export function CommentEditor({ 
  comment, 
  onCommentUpdated, 
  onCommentDeleted, 
  showActions = true 
}: CommentEditorProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [isLoading, setIsLoading] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = user && (user.id === comment.user_id || user.role === 'admin');
  const canDelete = user && (user.id === comment.user_id || user.role === 'admin');

  const handleSave = async () => {
    if (editText.trim() === comment.comment.trim() && newFiles.length === 0 && filesToRemove.length === 0 && imagesToRemove.length === 0) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const updatedComment = await apiService.updateCommentWithFiles(
        comment.id,
        {
          comment: editText.trim(),
          file_urls: comment.file_urls,
          image_urls: comment.image_urls
        },
        newFiles,
        filesToRemove,
        imagesToRemove
      );
      
      onCommentUpdated(updatedComment);
      setIsEditing(false);
      setNewFiles([]);
      setFilesToRemove([]);
      setImagesToRemove([]);
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditText(comment.comment);
    setNewFiles([]);
    setFilesToRemove([]);
    setImagesToRemove([]);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiService.deleteComment(comment.id);
      onCommentDeleted(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      // Check file size
      const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${file.type.startsWith('image/') ? '10MB for images' : '50MB for files'}.`);
        return false;
      }
      return true;
    });

    setNewFiles(prev => [...prev, ...validFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFileRemoval = (fileUrl: string) => {
    setFilesToRemove(prev => 
      prev.includes(fileUrl) 
        ? prev.filter(url => url !== fileUrl)
        : [...prev, fileUrl]
    );
  };

  const toggleImageRemoval = (imageUrl: string) => {
    setImagesToRemove(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {comment?.user_details?.name.charAt(0)?.toUpperCase() || comment?.user_name.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {comment?.user_details?.name || comment?.user_name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatDate(comment?.created_at)}
              {comment?.is_edited && ' (edited)'}
            </span>
          </div>
        </div>

        {showActions && (canEdit || canDelete) && !isEditing && (
          <div className="flex items-center space-x-1">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit comment"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete comment"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={isLoading}
          />

          {/* Existing Files */}
          {(comment.file_urls && comment.file_urls.length > 0) && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Files:</p>
              <div className="space-y-1">
                {comment.file_urls.map((url, index) => (
                  <div key={index} className={`flex items-center justify-between p-2 rounded ${
                    filesToRemove.includes(url) 
                      ? 'bg-red-100 dark:bg-red-900/20 line-through' 
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        File {index + 1}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFileRemoval(url)}
                      className={`p-1 text-sm ${
                        filesToRemove.includes(url)
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-red-600 hover:text-red-700'
                      }`}
                      disabled={isLoading}
                    >
                      {filesToRemove.includes(url) ? 'Keep' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Images */}
          {(comment.image_urls && comment.image_urls.length > 0) && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Images:</p>
              <div className="grid grid-cols-2 gap-2">
                {comment.image_urls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Attachment ${index + 1}`}
                      className={`h-20 w-full object-cover rounded border ${
                        imagesToRemove.includes(url) ? 'opacity-50 grayscale' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleImageRemoval(url)}
                      className={`absolute top-1 right-1 p-1 text-xs rounded ${
                        imagesToRemove.includes(url)
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                      disabled={isLoading}
                    >
                      {imagesToRemove.includes(url) ? 'Keep' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Files */}
          {newFiles.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">New Files to Add:</p>
              <div className="space-y-2">
                {newFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file)}
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-48">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="p-1 text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Input */}
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Files
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading || (!editText.trim() && newFiles.length === 0 && filesToRemove.length === 0 && imagesToRemove.length === 0)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap mb-2">
            {comment.comment}
          </div>
          
          {/* File attachments */}
          {comment.file_urls && comment.file_urls.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Files:</p>
              {comment.file_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  File {index + 1}
                </a>
              ))}
            </div>
          )}

          {/* Image attachments */}
          {comment.image_urls && comment.image_urls.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Images:</p>
              <div className="grid grid-cols-2 gap-2">
                {comment.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="h-20 w-full object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Attachment summary */}
          {((comment.file_urls?.length || 0) > 0 || (comment.image_urls?.length || 0) > 0) && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Paperclip className="h-3 w-3 mr-1" />
              {(comment.file_urls?.length || 0) + (comment.image_urls?.length || 0)} attachment(s)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
