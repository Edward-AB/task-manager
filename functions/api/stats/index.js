export async function onRequestGet({ env, data }) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);
    const toDate = now.toISOString().slice(0, 10);

    const [completionData, priorityData, streakData] = await Promise.all([
      // Last 30 days: total tasks and done tasks
      env.DB.prepare(`
        SELECT
          COUNT(*) AS total_tasks,
          SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS completed_tasks
        FROM tasks
        WHERE user_id = ? AND date >= ? AND date <= ?
      `).bind(data.userId, fromDate, toDate).first(),

      // Priority breakdown
      env.DB.prepare(`
        SELECT
          priority,
          COUNT(*) AS count,
          SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS done_count
        FROM tasks
        WHERE user_id = ? AND date >= ? AND date <= ?
        GROUP BY priority
      `).bind(data.userId, fromDate, toDate).all(),

      // Streak: get recent dates with all tasks done (for calculating streak)
      env.DB.prepare(`
        SELECT date,
          COUNT(*) AS total,
          SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS done
        FROM tasks
        WHERE user_id = ? AND date <= ?
        GROUP BY date
        ORDER BY date DESC
        LIMIT 60
      `).bind(data.userId, toDate).all(),
    ]);

    // Calculate streak
    let streak = 0;
    const today = now.toISOString().slice(0, 10);
    const dateMap = new Map();
    for (const row of streakData.results) {
      dateMap.set(row.date, row);
    }

    // Walk backwards from today (or yesterday if today has no tasks)
    const checkDate = new Date(now);
    // If today has no tasks, start from yesterday
    if (!dateMap.has(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 60; i++) {
      const d = checkDate.toISOString().slice(0, 10);
      const row = dateMap.get(d);
      if (row && row.total > 0 && row.done === row.total) {
        streak++;
      } else if (row && row.total > 0) {
        break; // Had tasks but not all done -- streak broken
      }
      // Skip days with no tasks (weekends, etc.)
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const priorityBreakdown = {};
    for (const row of priorityData.results) {
      priorityBreakdown[row.priority || 'none'] = {
        total: row.count,
        done: row.done_count,
      };
    }

    return Response.json({
      data: {
        period: { from: fromDate, to: toDate },
        total_tasks: completionData.total_tasks,
        completed_tasks: completionData.completed_tasks,
        completion_rate: completionData.total_tasks > 0
          ? Math.round((completionData.completed_tasks / completionData.total_tasks) * 100)
          : 0,
        streak,
        priority_breakdown: priorityBreakdown,
      },
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
