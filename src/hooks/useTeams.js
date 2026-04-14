import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api/client.js';

export default function useTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/teams');
      setTeams(res?.data || []);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const createTeam = async (name, description, color) => {
    const res = await apiPost('/api/teams', { name, description, color });
    const team = res?.data;
    if (team) setTeams((t) => [...t, team]);
    return team;
  };

  const updateTeam = async (id, updates) => {
    const res = await apiPatch(`/api/teams/${id}`, updates);
    setTeams((ts) => ts.map((t) => (t.id === id ? { ...t, ...res?.data } : t)));
    return res?.data;
  };

  const deleteTeam = async (id, confirmName) => {
    await apiDelete(`/api/teams/${id}`, { confirmName });
    setTeams((ts) => ts.filter((t) => t.id !== id));
  };

  const leaveTeam = async (id, selfUserId) => {
    await apiDelete(`/api/teams/${id}/members/${selfUserId}`);
    setTeams((ts) => ts.filter((t) => t.id !== id));
  };

  const inviteMember = async (teamId, email) => {
    const res = await apiPost(`/api/teams/${teamId}/invite`, { email });
    return res?.data;
  };

  const removeMember = async (teamId, userId) => {
    await apiDelete(`/api/teams/${teamId}/members/${userId}`);
  };

  const updateMemberRole = async (teamId, userId, role) => {
    await apiPatch(`/api/teams/${teamId}/members/${userId}`, { role });
  };

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    leaveTeam,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
}
