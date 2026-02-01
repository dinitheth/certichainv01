const API_BASE = import.meta.env.VITE_API_URL || '';

export interface InstitutionRegistration {
  id: number;
  name: string;
  email: string;
  website: string;
  location: string;
  description: string;
  walletAddress: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
}

export async function submitRegistration(data: {
  name: string;
  email: string;
  website: string;
  location: string;
  description: string;
  walletAddress: string;
}): Promise<InstitutionRegistration> {
  const response = await fetch(`${API_BASE}/api/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit registration');
  }
  
  return response.json();
}

export async function checkRegistration(walletAddress: string): Promise<InstitutionRegistration | null> {
  const response = await fetch(`${API_BASE}/api/registrations/check/${walletAddress}`);
  
  if (!response.ok) {
    throw new Error('Failed to check registration');
  }
  
  const data = await response.json();
  return data.status === 'not_found' ? null : data;
}

export async function getPendingRegistrations(): Promise<InstitutionRegistration[]> {
  const response = await fetch(`${API_BASE}/api/registrations/pending`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch pending registrations');
  }
  
  return response.json();
}

export async function getAllRegistrations(): Promise<InstitutionRegistration[]> {
  const response = await fetch(`${API_BASE}/api/registrations`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch registrations');
  }
  
  return response.json();
}

export async function updateRegistrationStatus(id: number, status: 'approved' | 'rejected'): Promise<InstitutionRegistration> {
  const response = await fetch(`${API_BASE}/api/registrations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update registration');
  }
  
  return response.json();
}