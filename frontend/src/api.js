import axios from 'axios';

const API_BASE_URL = '/api/gemini';

class ApiService {
  // File Search Store operations
  async createStore(displayName) {
    const response = await axios.post(`${API_BASE_URL}/stores`, { displayName });
    return response.data;
  }

  async listStores() {
    const response = await axios.get(`${API_BASE_URL}/stores`);
    return response.data;
  }

  async getStore(storeName) {
    const response = await axios.get(`${API_BASE_URL}/stores/${storeName}`);
    return response.data;
  }

  async deleteStore(storeName) {
    const response = await axios.delete(`${API_BASE_URL}/stores/${storeName}`);
    return response.data;
  }

  // File upload
  async uploadFile(storeName, file, displayName, metadata) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('displayName', displayName || file.name);

    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await axios.post(
      `${API_BASE_URL}/stores/${storeName}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Proposal generation
  async generateProposal(requirement, storeName, metadataFilter) {
    const response = await axios.post(`${API_BASE_URL}/generate-proposal`, {
      requirement,
      storeName,
      metadataFilter,
    });
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }
}

export default new ApiService();
