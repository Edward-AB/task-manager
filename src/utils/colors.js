/** Get the task colour object from a task and theme */
export function getTaskColor(task, deadlines, theme) {
  const dlId = task.deadlineId || task.deadline_id;
  if (dlId) {
    const dl = deadlines.find(d => d.id === dlId);
    if (dl) {
      const idx = dl.colorIdx ?? dl.color_idx ?? 0;
      return theme.deadline[idx % theme.deadline.length];
    }
  }
  const cId = task.colorId || task.color_id;
  if (cId) {
    const tc = theme.taskColor.find(c => c.id === cId);
    if (tc) return tc;
  }
  return theme.taskColor[0]; // default white
}
