import type { Paper } from "@/types/paper";

export async function fetchPapers(): Promise<Paper[]> {
  const response = await fetch('/api/papers');
  if (!response.ok) {
    throw new Error('Failed to fetch papers');
  }
  const papers = await response.json();
  
  return papers.map((paper: Paper) => ({
    ...paper,
    publishedAt: new Date(paper.publishedAt),
    createdAt: new Date(paper.createdAt),
    updatedAt: new Date(paper.updatedAt)
  }));
}

export async function toggleFavorite(id: string, state: boolean) {
  const response = await fetch(`/api/papers/${id}/favorite`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state }),
  });
  if (!response.ok) {
    throw new Error('Failed to update favorite state');
  }
  return response.json();
}

export async function updateMemo(id: string, memo: string) {
  const response = await fetch(`/api/papers/${id}/memo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ memo }),
  });
  if (!response.ok) {
    throw new Error('Failed to update memo');
  }
  return response.json();
}

export async function markAsRead(id: string): Promise<Paper> {
  const response = await fetch(`/api/papers/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isRead: true }),
  })

  if (!response.ok) {
    throw new Error('Failed to mark paper as read')
  }

  return response.json()
}
