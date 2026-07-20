import apiClient from './client';
import type {
    ConversationResponseDto,
    CreateConversationDto,
    SearchConversationsDto,
    PaginatedConversationsResponseDto
} from '../types/conversation';

/**
 * Upload audio file for conversation analysis
 */
export async function uploadConversationAudio(
    file: File,
    projectId: string,
    onUploadProgress?: (progressEvent: any) => void,
    title?: string
): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    if (title) formData.append('title', title);

    const response = await apiClient.post(
        '/conversations/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress
        }
    );
    return response.data;
}

/**
 * Create conversation from pasted transcript
 */
export async function createConversationFromTranscript(
    data: CreateConversationDto
): Promise<{ id: string }> {
    const response = await apiClient.post('/conversations', data);
    return response.data;
}

/**
 * Get single conversation by ID
 */
export async function getConversation(id: string): Promise<ConversationResponseDto> {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data;
}

/**
 * Search conversations with filters
 */
export async function searchConversations(
    filters: SearchConversationsDto
): Promise<PaginatedConversationsResponseDto> {
    const response = await apiClient.get('/conversations/search', {
        params: filters
    });
    return response.data;
}

