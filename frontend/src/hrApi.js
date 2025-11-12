import axios from 'axios';

const API_BASE_URL = '/api/hr';

class HRApiService {
  // Candidate operations
  async uploadCV(cvFile, photoFile, fileSearchStoreName) {
    const formData = new FormData();
    formData.append('cv', cvFile);

    if (photoFile) {
      formData.append('photo', photoFile);
    }

    if (fileSearchStoreName) {
      formData.append('fileSearchStoreName', fileSearchStoreName);
    }

    const response = await axios.post(
      `${API_BASE_URL}/candidates/upload-cv`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getCandidates(status) {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_BASE_URL}/candidates`, { params });
    return response.data;
  }

  async getCandidate(id) {
    const response = await axios.get(`${API_BASE_URL}/candidates/${id}`);
    return response.data;
  }

  async updateCandidateStatus(id, status) {
    const response = await axios.patch(
      `${API_BASE_URL}/candidates/${id}/status`,
      { status }
    );
    return response.data;
  }

  getCandidatePhotoUrl(candidateId) {
    return `${API_BASE_URL}/candidates/${candidateId}/photo`;
  }

  // Job offer operations
  async generateJobOffer(candidateId, jobDetails, fileSearchStoreName) {
    const response = await axios.post(`${API_BASE_URL}/job-offers/generate`, {
      candidateId,
      jobDetails,
      fileSearchStoreName,
    });
    return response.data;
  }

  async getJobOffers(filters) {
    const response = await axios.get(`${API_BASE_URL}/job-offers`, {
      params: filters,
    });
    return response.data;
  }

  async getJobOffer(id) {
    const response = await axios.get(`${API_BASE_URL}/job-offers/${id}`);
    return response.data;
  }

  async updateJobOfferStatus(id, status) {
    const response = await axios.patch(
      `${API_BASE_URL}/job-offers/${id}/status`,
      { status }
    );
    return response.data;
  }

  // Onboarding operations
  async generateOnboardingChecklist(candidateId, jobDetails, fileSearchStoreName) {
    const response = await axios.post(`${API_BASE_URL}/onboarding/generate`, {
      candidateId,
      jobDetails,
      fileSearchStoreName,
    });
    return response.data;
  }

  async getOnboardingTasks(filters) {
    const response = await axios.get(`${API_BASE_URL}/onboarding`, {
      params: filters,
    });
    return response.data;
  }

  async getOnboardingTask(id) {
    const response = await axios.get(`${API_BASE_URL}/onboarding/${id}`);
    return response.data;
  }

  async updateTaskCompletion(onboardingId, sectionIndex, taskIndex, completed) {
    const response = await axios.patch(
      `${API_BASE_URL}/onboarding/${onboardingId}/tasks/${sectionIndex}/${taskIndex}`,
      { completed }
    );
    return response.data;
  }
}

export default new HRApiService();
