import { useState, useCallback } from 'react';
import { apiGet } from '../api/client.js';

export default function useTeamSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async (teamId, date) => {
    if (!teamId || !date) return;
    try {
      setLoading(true);
      const res = await apiGet(`/api/teams/${teamId}/schedules?date=${date}`);
      setSchedules(res?.data || []);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load team schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedules, loading, error, fetchSchedules };
}
